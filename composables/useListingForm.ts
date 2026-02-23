import {
  type ListingFormData,
  type ListingPhoto,
  type Platform,
  type Listing,
  ListingCategory,
  Platform as PlatformEnum,
  platformRequiredFields,
  categoriesRequiringSize,
} from '~/types/listing'

const STORAGE_KEY = 'danimarket_listing_draft'

interface StepValidation {
  isValid: boolean
  errors: Record<string, string>
}

interface UseListingFormReturn {
  formData: Ref<ListingFormData>
  currentStep: Ref<number>
  totalSteps: number
  isDuplicating: Ref<boolean>
  isSubmitting: Ref<boolean>
  stepValidation: ComputedRef<StepValidation>
  isStepCompleted: (step: number) => boolean
  canGoNext: ComputedRef<boolean>
  canGoToStep: (step: number) => boolean
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateField: <K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => void
  addPhoto: (file: File) => void
  setPhotoRotation: (index: number, rotation: ListingPhoto['rotation'], displayRotation?: number) => void
  removePhoto: (index: number) => void
  reorderPhotos: (fromIndex: number, toIndex: number) => void
  getPlatformReadiness: (platform: Platform) => { ready: boolean; missingFields: string[] }
  saveDraft: () => void
  loadDraft: () => boolean
  clearDraft: () => void
  resetForm: () => void
  populateFromListing: (listing: Listing) => void
  submitAsDraft: () => Promise<string | null>
  submitAndPublish: () => Promise<string | null>
  loadDuplicateSource: (id: string) => Promise<void>
}

const createInitialFormData = (): ListingFormData => ({
  // Step 1 — Photos
  photos: [],

  // Step 2 — Basic info
  title: '',
  description: '',
  price: null,
  category: null,
  condition: null,

  // Step 3 — Details
  brand: '',
  size: '',
  colors: [],
  material: '',

  // Step 4 — Shipping
  city: '',
  province: '',
  shippingAvailable: true,
  packageSize: null,
  shippingCost: null,

  // Step 5 — Platforms
  platforms: [],
})

// Singleton state - shared across all components
const formData = ref<ListingFormData>(createInitialFormData())
const currentStep = ref(1)
const totalSteps = 5
const isDuplicating = ref(false)
const isSubmitting = ref(false)

// Validation functions that use the shared state
const validateStep1 = (): StepValidation => {
  const errors: Record<string, string> = {}

  if (formData.value.photos.length === 0) {
    errors.photos = 'Carica almeno una foto'
  } else if (formData.value.photos.length > 6) {
    errors.photos = 'Massimo 6 foto consentite'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

const validateStep2 = (): StepValidation => {
  const errors: Record<string, string> = {}

  if (!formData.value.title.trim()) {
    errors.title = 'Il titolo è obbligatorio'
  } else if (formData.value.title.length > 80) {
    errors.title = 'Il titolo non può superare 80 caratteri'
  }

  if (!formData.value.description.trim()) {
    errors.description = 'La descrizione è obbligatoria'
  }

  if (formData.value.price === null || formData.value.price <= 0) {
    errors.price = 'Inserisci un prezzo valido'
  }

  if (!formData.value.category) {
    errors.category = 'Seleziona una categoria'
  }

  if (!formData.value.condition) {
    errors.condition = 'Seleziona le condizioni'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

const validateStep3 = (): StepValidation => {
  const errors: Record<string, string> = {}
  const category = formData.value.category

  // Brand is required for all categories except OTHER
  if (category && category !== ListingCategory.OTHER && !formData.value.brand.trim()) {
    errors.brand = 'La marca è obbligatoria'
  }

  // Size is required for CLOTHING and SHOES
  if (category && categoriesRequiringSize.includes(category) && !formData.value.size) {
    errors.size = 'La taglia è obbligatoria'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

const validateStep4 = (): StepValidation => {
  const errors: Record<string, string> = {}

  if (!formData.value.city.trim()) {
    errors.city = 'Il comune è obbligatorio'
  }

  if (!formData.value.province.trim()) {
    errors.province = 'La provincia è obbligatoria'
  }

  if (formData.value.shippingAvailable && !formData.value.packageSize) {
    errors.packageSize = 'Seleziona la dimensione del pacco'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

const validateStep5 = (): StepValidation => {
  const errors: Record<string, string> = {}

  if (formData.value.platforms.length === 0) {
    errors.platforms = 'Seleziona almeno una piattaforma'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

const validateStep = (step: number): StepValidation => {
  switch (step) {
    case 1:
      return validateStep1()
    case 2:
      return validateStep2()
    case 3:
      return validateStep3()
    case 4:
      return validateStep4()
    case 5:
      return validateStep5()
    default:
      return { isValid: false, errors: {} }
  }
}

// Check if all steps up to (but not including) the given step are valid
const areAllPreviousStepsValid = (upToStep: number): boolean => {
  for (let i = 1; i < upToStep; i++) {
    if (!validateStep(i).isValid) {
      return false
    }
  }
  return true
}

const isStepCompleted = (step: number): boolean => {
  // A step is only completed if all previous steps are valid AND this step is valid
  return areAllPreviousStepsValid(step) && validateStep(step).isValid
}

// ========== PAYLOAD BUILDER ==========

function buildPayload() {
  return {
    title: formData.value.title,
    description: formData.value.description,
    price: formData.value.price,
    category: formData.value.category,
    condition: formData.value.condition,
    brand: formData.value.brand || undefined,
    size: formData.value.size || undefined,
    colors: formData.value.colors,
    material: formData.value.material || undefined,
    city: formData.value.city,
    province: formData.value.province,
    shippingAvailable: formData.value.shippingAvailable,
    packageSize: formData.value.packageSize,
    shippingCost: formData.value.shippingCost,
    platforms: formData.value.platforms,
  }
}

// ========== COMPOSABLE ==========

export const useListingForm = (): UseListingFormReturn => {
  const stepValidation = computed((): StepValidation => {
    return validateStep(currentStep.value)
  })

  const canGoNext = computed(() => stepValidation.value.isValid)

  const canGoToStep = (step: number): boolean => {
    if (step < 1 || step > totalSteps) return false
    // Can always go back
    if (step <= currentStep.value) return true
    // Can only go forward if all previous steps are completed
    return areAllPreviousStepsValid(step)
  }

  const goToStep = (step: number) => {
    if (canGoToStep(step)) {
      currentStep.value = step
    }
  }

  const nextStep = () => {
    if (currentStep.value < totalSteps && canGoNext.value) {
      currentStep.value++
      saveDraft()
    }
  }

  const prevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  const updateField = <K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => {
    formData.value[field] = value
  }

  const addPhoto = (file: File) => {
    if (formData.value.photos.length < 6) {
      formData.value.photos.push({ file, rotation: 0, displayRotation: 0 })
    }
  }

  const setPhotoRotation = (index: number, rotation: ListingPhoto['rotation'], displayRotation?: number) => {
    const photo = formData.value.photos[index]
    if (photo) {
      photo.rotation = rotation
      photo.displayRotation = displayRotation ?? rotation
    }
  }

  const removePhoto = (index: number) => {
    formData.value.photos.splice(index, 1)
  }

  const reorderPhotos = (fromIndex: number, toIndex: number) => {
    const photos = [...formData.value.photos]
    const [movedPhoto] = photos.splice(fromIndex, 1)
    photos.splice(toIndex, 0, movedPhoto)
    formData.value.photos = photos
  }

  const getPlatformReadiness = (platform: Platform): { ready: boolean; missingFields: string[] } => {
    const requiredFields = platformRequiredFields[platform]
    const missingFields: string[] = []

    for (const field of requiredFields) {
      const value = formData.value[field]

      // Special handling for size on Vinted (only required for CLOTHING/SHOES)
      if (field === 'size' && platform === PlatformEnum.VINTED) {
        const category = formData.value.category
        if (category && categoriesRequiringSize.includes(category) && !value) {
          missingFields.push(field)
        }
        continue
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          missingFields.push(field)
        }
      } else if (value === null || value === undefined || value === '') {
        missingFields.push(field)
      }
    }

    return {
      ready: missingFields.length === 0,
      missingFields,
    }
  }

  const saveDraft = () => {
    if (import.meta.client) {
      // Cannot save File objects to localStorage, so we save metadata instead
      const dataToSave = {
        ...formData.value,
        photos: formData.value.photos.map((photo) => ({
          name: photo.file.name,
          size: photo.file.size,
          type: photo.file.type,
          rotation: photo.rotation,
          displayRotation: photo.displayRotation,
        })),
        _currentStep: currentStep.value,
        _savedAt: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    }
  }

  const loadDraft = (): boolean => {
    if (import.meta.client) {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          // Restore form data except photos (File objects cannot be restored from localStorage)
          formData.value = {
            ...createInitialFormData(),
            ...parsed,
            photos: [], // Photos need to be re-uploaded
          }
          currentStep.value = parsed._currentStep || 1
          return true
        } catch {
          return false
        }
      }
    }
    return false
  }

  const clearDraft = () => {
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const resetForm = () => {
    formData.value = createInitialFormData()
    currentStep.value = 1
    isDuplicating.value = false
    isSubmitting.value = false
    clearDraft()
  }

  const populateFromListing = (listing: Listing) => {
    formData.value = {
      photos: [], // Photos must be re-uploaded
      title: `Copia di — ${listing.title}`,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      condition: listing.condition,
      brand: listing.brand || '',
      size: listing.size || '',
      colors: [...listing.colors],
      material: listing.material || '',
      city: listing.city,
      province: listing.province,
      shippingAvailable: listing.shippingAvailable,
      packageSize: listing.packageSize,
      shippingCost: listing.shippingCost,
      platforms: listing.platformPublications.map((p) => p.platform),
    }
    currentStep.value = 1 // Start from Step 1 (Photos)
    isDuplicating.value = true
  }

  // ========== API SUBMIT METHODS ==========

  async function submitAsDraft(): Promise<string | null> {
    const { post, uploadPhotos } = useApi()
    const toast = useToast()
    isSubmitting.value = true
    try {
      const created = await post<Listing>('/api/listings', buildPayload())

      if (formData.value.photos.length > 0) {
        const files = formData.value.photos.map((p) => p.file)
        await uploadPhotos(created.id, files)
      }

      clearDraft()
      resetForm()
      toast.success('Bozza salvata con successo!')
      return created.id
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore durante il salvataggio della bozza'
      toast.error(message)
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  async function submitAndPublish(): Promise<string | null> {
    const { post, uploadPhotos } = useApi()
    const toast = useToast()
    isSubmitting.value = true
    try {
      const created = await post<Listing>('/api/listings', buildPayload())

      if (formData.value.photos.length > 0) {
        const files = formData.value.photos.map((p) => p.file)
        await uploadPhotos(created.id, files)
      }

      await post(`/api/listings/${created.id}/publish`)

      clearDraft()
      resetForm()
      toast.success('Annuncio pubblicato con successo!')
      return created.id
    } catch (e: any) {
      const message = e?.data?.error || e?.message || 'Errore durante la pubblicazione'
      toast.error(message)
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  async function loadDuplicateSource(id: string): Promise<void> {
    const { get } = useApi()
    try {
      const source = await get<Listing>(`/api/listings/${id}`)
      // Prisma Decimal fields are serialized as strings in JSON — convert to numbers
      source.price = Number(source.price)
      if (source.shippingCost != null) {
        source.shippingCost = Number(source.shippingCost)
      }
      populateFromListing(source)
    } catch {
      // Silently fail — form stays empty
    }
  }

  return {
    formData,
    currentStep,
    totalSteps,
    isDuplicating,
    isSubmitting,
    stepValidation,
    isStepCompleted,
    canGoNext,
    canGoToStep,
    goToStep,
    nextStep,
    prevStep,
    updateField,
    addPhoto,
    setPhotoRotation,
    removePhoto,
    reorderPhotos,
    getPlatformReadiness,
    saveDraft,
    loadDraft,
    clearDraft,
    resetForm,
    populateFromListing,
    submitAsDraft,
    submitAndPublish,
    loadDuplicateSource,
  }
}
