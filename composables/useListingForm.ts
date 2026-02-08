import {
  type ListingFormData,
  type Platform,
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
  stepValidation: ComputedRef<StepValidation>
  isStepCompleted: (step: number) => boolean
  canGoNext: ComputedRef<boolean>
  canGoToStep: (step: number) => boolean
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateField: <K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => void
  addPhoto: (file: File) => void
  removePhoto: (index: number) => void
  reorderPhotos: (fromIndex: number, toIndex: number) => void
  getPlatformReadiness: (platform: Platform) => { ready: boolean; missingFields: string[] }
  saveDraft: () => void
  loadDraft: () => boolean
  clearDraft: () => void
  resetForm: () => void
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
  location: '',
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
  if (category && category !== 'other' && !formData.value.brand.trim()) {
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

  if (!formData.value.location.trim()) {
    errors.location = 'La località è obbligatoria'
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

const isStepCompleted = (step: number): boolean => {
  return validateStep(step).isValid
}

// Check if all previous steps are completed
const areAllPreviousStepsCompleted = (upToStep: number): boolean => {
  for (let i = 1; i < upToStep; i++) {
    if (!isStepCompleted(i)) {
      return false
    }
  }
  return true
}

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
    return areAllPreviousStepsCompleted(step)
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
      formData.value.photos.push(file)
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
      if (field === 'size' && platform === 'vinted') {
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
        photos: formData.value.photos.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
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
    clearDraft()
  }

  return {
    formData,
    currentStep,
    totalSteps,
    stepValidation,
    isStepCompleted,
    canGoNext,
    canGoToStep,
    goToStep,
    nextStep,
    prevStep,
    updateField,
    addPhoto,
    removePhoto,
    reorderPhotos,
    getPlatformReadiness,
    saveDraft,
    loadDraft,
    clearDraft,
    resetForm,
  }
}
