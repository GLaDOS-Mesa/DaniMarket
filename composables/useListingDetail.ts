import {
  type Listing,
  type Photo,
  type ListingCategory,
  type ListingCondition,
  type ListingColor,
  type PackageSize,
  ListingCategory as LC,
  categoriesRequiringSize,
} from '~/types/listing'

// ========== TYPES ==========

// Editable fields from Listing (excludes readonly fields like id, status, publications, etc.)
export interface EditableListingData {
  photos: Photo[]
  title: string
  description: string
  price: number
  category: ListingCategory
  condition: ListingCondition
  brand: string | null
  size: string | null
  colors: ListingColor[]
  material: string | null
  city: string
  province: string
  shippingAvailable: boolean
  packageSize: PackageSize | null
  shippingCost: number | null
}

// ========== FIELD LABELS (Italian) ==========

const fieldLabels: Record<string, string> = {
  photos: 'Foto',
  title: 'Titolo',
  description: 'Descrizione',
  price: 'Prezzo',
  category: 'Categoria',
  condition: 'Condizioni',
  brand: 'Marca',
  size: 'Taglia',
  colors: 'Colori',
  material: 'Materiale',
  city: 'Comune',
  province: 'Provincia',
  shippingAvailable: 'Spedizione disponibile',
  packageSize: 'Dimensione pacco',
  shippingCost: 'Costo spedizione',
}

// ========== EDITABLE FIELDS LIST ==========

const editableFields: (keyof Listing)[] = [
  'photos',
  'title',
  'description',
  'price',
  'category',
  'condition',
  'brand',
  'size',
  'colors',
  'material',
  'city',
  'province',
  'shippingAvailable',
  'packageSize',
  'shippingCost',
]

// ========== SINGLETON STATE ==========

// Edit mode state
const isEditMode = ref(false)
const workingCopy = ref<Partial<Listing> | null>(null)
const originalSnapshot = ref<Partial<Listing> | null>(null)

// Listing state
const listing = ref<Listing | null>(null)
const isLoading = ref(false)
const isPublishing = ref(false)
const isDeleting = ref(false)
const isSaving = ref(false)

// ========== HELPER FUNCTIONS ==========

/**
 * Deep clone an object (handles Date objects and arrays)
 */
const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T
  }

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * Compare two values for equality (handles arrays and primitives)
 */
const areValuesEqual = (a: unknown, b: unknown): boolean => {
  // Handle null/undefined
  if (a === b) return true
  if (a == null || b == null) return false

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => areValuesEqual(item, b[index]))
  }

  // Handle objects (but not arrays)
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as object)
    const keysB = Object.keys(b as object)
    if (keysA.length !== keysB.length) return false
    return keysA.every((key) =>
      areValuesEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
    )
  }

  // Primitives
  return a === b
}

// ========== COMPOSABLE ==========

export const useListingDetail = () => {
  const { get, post, put, del, uploadPhotos } = useApi()
  const toast = useToast()

  // ========== CHANGE TRACKING ==========

  const modifiedFields = computed((): Set<string> => {
    const modified = new Set<string>()

    if (!workingCopy.value || !originalSnapshot.value) {
      return modified
    }

    for (const field of editableFields) {
      const workingValue = workingCopy.value[field]
      const originalValue = originalSnapshot.value[field]

      if (!areValuesEqual(workingValue, originalValue)) {
        modified.add(field)
      }
    }

    return modified
  })

  const hasChanges = computed((): boolean => {
    return modifiedFields.value.size > 0
  })

  const isFieldModified = (field: string): boolean => {
    return modifiedFields.value.has(field)
  }

  // ========== VALIDATION ==========

  const validationErrors = computed((): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!workingCopy.value) {
      return errors
    }

    const data = workingCopy.value

    // Photos validation
    if (!data.photos || data.photos.length === 0) {
      errors.photos = 'Carica almeno una foto'
    } else if (data.photos.length > 6) {
      errors.photos = 'Massimo 6 foto consentite'
    }

    // Title validation
    if (!data.title?.trim()) {
      errors.title = 'Il titolo è obbligatorio'
    } else if (data.title.length > 80) {
      errors.title = 'Il titolo non può superare 80 caratteri'
    }

    // Description validation
    if (!data.description?.trim()) {
      errors.description = 'La descrizione è obbligatoria'
    }

    // Price validation
    if (data.price === null || data.price === undefined || data.price <= 0) {
      errors.price = 'Inserisci un prezzo valido'
    }

    // Category validation
    if (!data.category) {
      errors.category = 'Seleziona una categoria'
    }

    // Condition validation
    if (!data.condition) {
      errors.condition = 'Seleziona le condizioni'
    }

    // Brand validation (required for all categories except OTHER)
    if (data.category && data.category !== LC.OTHER && !data.brand?.trim()) {
      errors.brand = 'La marca è obbligatoria'
    }

    // Size validation (required for CLOTHING and SHOES)
    if (
      data.category &&
      categoriesRequiringSize.includes(data.category) &&
      !data.size
    ) {
      errors.size = 'La taglia è obbligatoria'
    }

    // City validation
    if (!data.city?.trim()) {
      errors.city = 'Il comune è obbligatorio'
    }

    // Province validation
    if (!data.province?.trim()) {
      errors.province = 'La provincia è obbligatoria'
    }

    // Package size validation (required if shipping is available)
    if (data.shippingAvailable && !data.packageSize) {
      errors.packageSize = 'Seleziona la dimensione del pacco'
    }

    return errors
  })

  const isValid = computed((): boolean => {
    return Object.keys(validationErrors.value).length === 0
  })

  // ========== EDIT MODE ACTIONS ==========

  const enterEditMode = (source: Listing): void => {
    const editableData: Partial<Listing> = {}
    for (const field of editableFields) {
      ;(editableData as Record<string, unknown>)[field] = deepClone(source[field])
    }

    workingCopy.value = editableData
    originalSnapshot.value = deepClone(editableData)
    isEditMode.value = true
  }

  const exitEditMode = (): void => {
    isEditMode.value = false
    workingCopy.value = null
    originalSnapshot.value = null
    isSaving.value = false
  }

  const updateField = <K extends keyof Listing>(field: K, value: Listing[K]): void => {
    if (workingCopy.value) {
      workingCopy.value[field] = value
    }
  }

  const discardChanges = (): void => {
    if (originalSnapshot.value) {
      workingCopy.value = deepClone(originalSnapshot.value)
    }
  }

  const getFieldLabel = (field: string): string => {
    return fieldLabels[field] || field
  }

  // ========== API ACTIONS ==========

  async function fetchListing(id: string) {
    isLoading.value = true
    try {
      const data = await get<Listing>(`/api/listings/${id}`)
      // Prisma Decimal fields are serialized as strings in JSON — convert to numbers
      data.price = Number(data.price)
      if (data.shippingCost != null) {
        data.shippingCost = Number(data.shippingCost)
      }
      listing.value = data
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Annuncio non trovato'
      toast.error(message)
    } finally {
      isLoading.value = false
    }
  }

  async function saveListing() {
    if (!listing.value || !workingCopy.value || !hasChanges.value) return
    isSaving.value = true
    try {
      const changedData: Record<string, any> = {}
      for (const field of modifiedFields.value) {
        changedData[field] = (workingCopy.value as Record<string, unknown>)[field]
      }
      await put(`/api/listings/${listing.value.id}`, changedData)
      await fetchListing(listing.value.id)
      exitEditMode()
      toast.success('Modifiche salvate con successo!')
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore durante il salvataggio'
      toast.error(message)
    } finally {
      isSaving.value = false
    }
  }

  async function publishListing() {
    if (!listing.value) return
    isPublishing.value = true
    try {
      await post(`/api/listings/${listing.value.id}/publish`)
      await fetchListing(listing.value.id)
      toast.success('Annuncio pubblicato con successo!')
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore durante la pubblicazione'
      toast.error(message)
    } finally {
      isPublishing.value = false
    }
  }

  async function saveAsDraft() {
    if (!listing.value) return
    isSaving.value = true
    try {
      if (hasChanges.value) {
        const changedData: Record<string, any> = {}
        for (const field of modifiedFields.value) {
          changedData[field] = (workingCopy.value as Record<string, unknown>)[field]
        }
        await put(`/api/listings/${listing.value.id}`, changedData)
      }
      await post(`/api/listings/${listing.value.id}/draft`)
      await fetchListing(listing.value.id)
      exitEditMode()
      toast.success('Salvato come bozza')
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore durante il salvataggio'
      toast.error(message)
    } finally {
      isSaving.value = false
    }
  }

  async function saveAndRepublish() {
    if (!listing.value) return
    isSaving.value = true
    try {
      if (hasChanges.value) {
        const changedData: Record<string, any> = {}
        for (const field of modifiedFields.value) {
          changedData[field] = (workingCopy.value as Record<string, unknown>)[field]
        }
        await put(`/api/listings/${listing.value.id}`, changedData)
      }
      await post(`/api/listings/${listing.value.id}/publish`)
      await fetchListing(listing.value.id)
      exitEditMode()
      toast.success('Modifiche salvate e annuncio ripubblicato!')
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore durante la pubblicazione'
      toast.error(message)
    } finally {
      isSaving.value = false
    }
  }

  async function deleteListing(): Promise<boolean> {
    if (!listing.value) return false
    isDeleting.value = true
    try {
      await del(`/api/listings/${listing.value.id}`)
      toast.success('Annuncio eliminato con successo')
      return true
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore durante l\'eliminazione'
      toast.error(message)
      return false
    } finally {
      isDeleting.value = false
    }
  }

  async function duplicateListing(): Promise<string | null> {
    if (!listing.value) return null
    try {
      const newListing = await post<Listing>(`/api/listings/${listing.value.id}/duplicate`)
      toast.success('Annuncio duplicato — completa le foto e i dettagli')
      return newListing.id
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore durante la duplicazione'
      toast.error(message)
      return null
    }
  }

  // ========== PLATFORM ACTIONS ==========

  async function addPlatform(platform: string) {
    if (!listing.value) return
    try {
      await post(`/api/listings/${listing.value.id}/platforms`, { platform })
      await fetchListing(listing.value.id)
      toast.success('Piattaforma aggiunta')
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore nell\'aggiunta della piattaforma'
      toast.error(message)
    }
  }

  async function publishPlatform(platform: string) {
    if (!listing.value) return
    try {
      await post(`/api/listings/${listing.value.id}/platforms/${platform}/publish`)
      await fetchListing(listing.value.id)
      toast.success('Pubblicato sulla piattaforma')
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore nella pubblicazione'
      toast.error(message)
    }
  }

  async function removePlatform(platform: string) {
    if (!listing.value) return
    try {
      await del(`/api/listings/${listing.value.id}/platforms/${platform}`)
      await fetchListing(listing.value.id)
      toast.success('Rimosso dalla piattaforma')
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore nella rimozione'
      toast.error(message)
    }
  }

  // ========== PHOTO ACTIONS ==========

  // Sync working copy photos with the latest listing data after server-side photo changes
  function syncWorkingCopyPhotos() {
    if (isEditMode.value && workingCopy.value && listing.value) {
      workingCopy.value.photos = deepClone(listing.value.photos)
      if (originalSnapshot.value) {
        originalSnapshot.value.photos = deepClone(listing.value.photos)
      }
    }
  }

  async function addPhotos(files: File[]) {
    if (!listing.value) return
    try {
      await uploadPhotos(listing.value.id, files)
      await fetchListing(listing.value.id)
      syncWorkingCopyPhotos()
      toast.success(files.length > 1 ? `${files.length} foto aggiunte` : 'Foto aggiunta')
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore nell\'upload delle foto'
      toast.error(message)
    }
  }

  async function removePhoto(photoId: string) {
    if (!listing.value) return
    try {
      await del(`/api/listings/${listing.value.id}/photos/${photoId}`)
      await fetchListing(listing.value.id)
      syncWorkingCopyPhotos()
      toast.success('Foto rimossa')
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore nella rimozione della foto'
      toast.error(message)
    }
  }

  async function reorderPhotos(orderedIds: string[]) {
    if (!listing.value) return
    try {
      await put(`/api/listings/${listing.value.id}/photos/reorder`, { orderedIds })
      await fetchListing(listing.value.id)
      syncWorkingCopyPhotos()
      toast.success('Ordine foto aggiornato')
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore nel riordinamento delle foto'
      toast.error(message)
    }
  }

  return {
    // Listing state
    listing,
    isLoading,
    isPublishing,
    isDeleting,
    isSaving,

    // Edit mode state
    isEditMode,
    workingCopy,
    originalSnapshot,

    // Change tracking
    modifiedFields,
    hasChanges,

    // Validation
    validationErrors,
    isValid,

    // Edit mode actions
    enterEditMode,
    exitEditMode,
    updateField,
    discardChanges,
    isFieldModified,
    getFieldLabel,

    // API actions
    fetchListing,
    saveListing,
    saveAsDraft,
    saveAndRepublish,
    publishListing,
    deleteListing,
    duplicateListing,

    // Platform actions
    addPlatform,
    publishPlatform,
    removePlatform,

    // Photo actions
    addPhotos,
    removePhoto,
    reorderPhotos,
  }
}
