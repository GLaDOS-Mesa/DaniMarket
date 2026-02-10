import {
  type Listing,
  type ListingCategory,
  type ListingCondition,
  type ListingColor,
  type PackageSize,
  categoriesRequiringSize,
} from '~/types/listing'

// ========== TYPES ==========

// Editable fields from Listing (excludes readonly fields like id, status, publications, etc.)
export interface EditableListingData {
  images: string[]
  title: string
  description: string
  price: number
  category: ListingCategory
  condition: ListingCondition
  brand: string
  size: string
  colors: ListingColor[]
  material: string
  city: string
  province: string
  shippingAvailable: boolean
  packageSize: PackageSize | null
  shippingCost: number | null
}

interface UseListingDetailReturn {
  // State
  isEditMode: Ref<boolean>
  workingCopy: Ref<Partial<Listing> | null>
  originalSnapshot: Ref<Partial<Listing> | null>
  isSaving: Ref<boolean>

  // Change tracking
  modifiedFields: ComputedRef<Set<string>>
  hasChanges: ComputedRef<boolean>

  // Validation
  validationErrors: ComputedRef<Record<string, string>>
  isValid: ComputedRef<boolean>

  // Actions
  enterEditMode: (listing: Listing) => void
  exitEditMode: () => void
  updateField: <K extends keyof Listing>(field: K, value: Listing[K]) => void
  discardChanges: () => void
  isFieldModified: (field: string) => boolean

  // Field labels for UI
  getFieldLabel: (field: string) => string
}

// ========== FIELD LABELS (Italian) ==========

const fieldLabels: Record<string, string> = {
  images: 'Foto',
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
  'images',
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

const isEditMode = ref(false)
const workingCopy = ref<Partial<Listing> | null>(null)
const originalSnapshot = ref<Partial<Listing> | null>(null)
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
      areValuesEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    )
  }

  // Primitives
  return a === b
}

// ========== COMPOSABLE ==========

export const useListingDetail = (): UseListingDetailReturn => {
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

    // Images validation
    if (!data.images || data.images.length === 0) {
      errors.images = 'Carica almeno una foto'
    } else if (data.images.length > 6) {
      errors.images = 'Massimo 6 foto consentite'
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
    if (data.category && data.category !== 'other' && !data.brand?.trim()) {
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

  // ========== ACTIONS ==========

  const enterEditMode = (listing: Listing): void => {
    // Create a deep clone of editable fields for working copy
    const editableData: Partial<Listing> = {}
    for (const field of editableFields) {
      ;(editableData as Record<string, unknown>)[field] = deepClone(listing[field])
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

  return {
    // State
    isEditMode,
    workingCopy,
    originalSnapshot,
    isSaving,

    // Change tracking
    modifiedFields,
    hasChanges,

    // Validation
    validationErrors,
    isValid,

    // Actions
    enterEditMode,
    exitEditMode,
    updateField,
    discardChanges,
    isFieldModified,

    // Field labels
    getFieldLabel,
  }
}
