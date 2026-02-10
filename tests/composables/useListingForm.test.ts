import { describe, it, expect, beforeEach } from 'vitest'
import { useListingForm } from '~/composables/useListingForm'
import { ListingCategory, ListingCondition, ListingColor, PackageSize, Platform } from '~/types/listing'

describe('useListingForm', () => {
  beforeEach(() => {
    // Reset form before each test
    const { resetForm } = useListingForm()
    resetForm()
  })

  describe('initial state', () => {
    it('should start at step 1', () => {
      const { currentStep } = useListingForm()
      expect(currentStep.value).toBe(1)
    })

    it('should have empty form data', () => {
      const { formData } = useListingForm()
      expect(formData.value.photos).toEqual([])
      expect(formData.value.title).toBe('')
      expect(formData.value.price).toBeNull()
      expect(formData.value.platforms).toEqual([])
    })

    it('should have 5 total steps', () => {
      const { totalSteps } = useListingForm()
      expect(totalSteps).toBe(5)
    })
  })

  describe('step 1 validation (photos)', () => {
    it('should be invalid with no photos', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.photos = []
      expect(stepValidation.value.isValid).toBe(false)
      expect(stepValidation.value.errors.photos).toBe('Carica almeno una foto')
    })

    it('should be valid with 1-6 photos', () => {
      const { stepValidation, formData } = useListingForm()
      // Create mock File objects
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      formData.value.photos = [mockFile]
      expect(stepValidation.value.isValid).toBe(true)
      expect(stepValidation.value.errors.photos).toBeUndefined()
    })

    it('should be invalid with more than 6 photos', () => {
      const { stepValidation, formData } = useListingForm()
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      formData.value.photos = Array(7).fill(mockFile)
      expect(stepValidation.value.isValid).toBe(false)
      expect(stepValidation.value.errors.photos).toBe('Massimo 6 foto consentite')
    })
  })

  describe('step 2 validation (basic info)', () => {
    beforeEach(() => {
      const { formData, goToStep } = useListingForm()
      // Setup valid step 1
      formData.value.photos = [new File([''], 'test.jpg', { type: 'image/jpeg' })]
      goToStep(2)
    })

    it('should require title', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.title = ''
      expect(stepValidation.value.errors.title).toBe('Il titolo è obbligatorio')
    })

    it('should enforce max 80 characters for title', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.title = 'a'.repeat(81)
      expect(stepValidation.value.errors.title).toBe('Il titolo non può superare 80 caratteri')
    })

    it('should require description', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.description = ''
      expect(stepValidation.value.errors.description).toBe('La descrizione è obbligatoria')
    })

    it('should require valid price', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.price = 0
      expect(stepValidation.value.errors.price).toBe('Inserisci un prezzo valido')
    })

    it('should require category', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.category = null
      expect(stepValidation.value.errors.category).toBe('Seleziona una categoria')
    })

    it('should require condition', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.condition = null
      expect(stepValidation.value.errors.condition).toBe('Seleziona le condizioni')
    })

    it('should be valid with all required fields', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.title = 'Test Product'
      formData.value.description = 'A test description'
      formData.value.price = 50
      formData.value.category = ListingCategory.CLOTHING
      formData.value.condition = ListingCondition.GOOD
      expect(stepValidation.value.isValid).toBe(true)
    })
  })

  describe('step 3 validation (details)', () => {
    beforeEach(() => {
      const { formData, goToStep } = useListingForm()
      // Setup valid steps 1-2
      formData.value.photos = [new File([''], 'test.jpg', { type: 'image/jpeg' })]
      formData.value.title = 'Test'
      formData.value.description = 'Test desc'
      formData.value.price = 50
      formData.value.category = ListingCategory.CLOTHING
      formData.value.condition = ListingCondition.GOOD
      goToStep(3)
    })

    it('should require brand for non-OTHER categories', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.category = ListingCategory.CLOTHING
      formData.value.brand = ''
      expect(stepValidation.value.errors.brand).toBe('La marca è obbligatoria')
    })

    it('should not require brand for OTHER category', () => {
      const { stepValidation, formData, goToStep } = useListingForm()
      formData.value.category = ListingCategory.OTHER
      formData.value.brand = ''
      goToStep(3) // Re-evaluate validation
      expect(stepValidation.value.errors.brand).toBeUndefined()
    })

    it('should require size for CLOTHING category', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.category = ListingCategory.CLOTHING
      formData.value.size = ''
      expect(stepValidation.value.errors.size).toBe('La taglia è obbligatoria')
    })

    it('should require size for SHOES category', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.category = ListingCategory.SHOES
      formData.value.size = ''
      expect(stepValidation.value.errors.size).toBe('La taglia è obbligatoria')
    })

    it('should not require size for ELECTRONICS category', () => {
      const { stepValidation, formData, goToStep } = useListingForm()
      formData.value.category = ListingCategory.ELECTRONICS
      formData.value.brand = 'Apple'
      formData.value.size = ''
      goToStep(3)
      expect(stepValidation.value.errors.size).toBeUndefined()
    })
  })

  describe('step 4 validation (shipping)', () => {
    beforeEach(() => {
      const { formData, goToStep } = useListingForm()
      // Setup valid steps 1-3
      formData.value.photos = [new File([''], 'test.jpg', { type: 'image/jpeg' })]
      formData.value.title = 'Test'
      formData.value.description = 'Test desc'
      formData.value.price = 50
      formData.value.category = ListingCategory.ELECTRONICS
      formData.value.condition = ListingCondition.GOOD
      formData.value.brand = 'Apple'
      goToStep(4)
    })

    it('should require city', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.city = ''
      expect(stepValidation.value.errors.city).toBe('Il comune è obbligatorio')
    })

    it('should require province', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.province = ''
      expect(stepValidation.value.errors.province).toBe('La provincia è obbligatoria')
    })

    it('should require package size when shipping is available', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.city = 'Milano'
      formData.value.province = 'MI'
      formData.value.shippingAvailable = true
      formData.value.packageSize = null
      expect(stepValidation.value.errors.packageSize).toBe('Seleziona la dimensione del pacco')
    })

    it('should not require package size when shipping is not available', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.city = 'Milano'
      formData.value.province = 'MI'
      formData.value.shippingAvailable = false
      formData.value.packageSize = null
      expect(stepValidation.value.errors.packageSize).toBeUndefined()
      expect(stepValidation.value.isValid).toBe(true)
    })
  })

  describe('step 5 validation (platforms)', () => {
    beforeEach(() => {
      const { formData, goToStep } = useListingForm()
      // Setup valid steps 1-4
      formData.value.photos = [new File([''], 'test.jpg', { type: 'image/jpeg' })]
      formData.value.title = 'Test'
      formData.value.description = 'Test desc'
      formData.value.price = 50
      formData.value.category = ListingCategory.ELECTRONICS
      formData.value.condition = ListingCondition.GOOD
      formData.value.brand = 'Apple'
      formData.value.city = 'Milano'
      formData.value.province = 'MI'
      formData.value.shippingAvailable = false
      goToStep(5)
    })

    it('should require at least one platform', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.platforms = []
      expect(stepValidation.value.errors.platforms).toBe('Seleziona almeno una piattaforma')
    })

    it('should be valid with one platform selected', () => {
      const { stepValidation, formData } = useListingForm()
      formData.value.platforms = [Platform.EBAY]
      expect(stepValidation.value.isValid).toBe(true)
    })
  })

  describe('navigation', () => {
    it('should allow going to previous steps', () => {
      const { formData, goToStep, currentStep } = useListingForm()
      formData.value.photos = [new File([''], 'test.jpg', { type: 'image/jpeg' })]
      goToStep(2)
      expect(currentStep.value).toBe(2)
      goToStep(1)
      expect(currentStep.value).toBe(1)
    })

    it('should not allow skipping steps with invalid data', () => {
      const { canGoToStep, formData } = useListingForm()
      formData.value.photos = [] // Invalid step 1
      expect(canGoToStep(2)).toBe(false)
      expect(canGoToStep(3)).toBe(false)
    })

    it('should allow going to next step with valid data', () => {
      const { canGoToStep, formData } = useListingForm()
      formData.value.photos = [new File([''], 'test.jpg', { type: 'image/jpeg' })]
      expect(canGoToStep(2)).toBe(true)
    })
  })

  describe('photo management', () => {
    it('should add photos up to 6', () => {
      const { addPhoto, formData } = useListingForm()
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })

      for (let i = 0; i < 6; i++) {
        addPhoto(mockFile)
      }
      expect(formData.value.photos.length).toBe(6)

      // Should not add 7th photo
      addPhoto(mockFile)
      expect(formData.value.photos.length).toBe(6)
    })

    it('should remove photos by index', () => {
      const { addPhoto, removePhoto, formData } = useListingForm()
      const file1 = new File(['1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['2'], 'test2.jpg', { type: 'image/jpeg' })

      addPhoto(file1)
      addPhoto(file2)
      expect(formData.value.photos.length).toBe(2)

      removePhoto(0)
      expect(formData.value.photos.length).toBe(1)
      expect(formData.value.photos[0].name).toBe('test2.jpg')
    })

    it('should reorder photos', () => {
      const { addPhoto, reorderPhotos, formData } = useListingForm()
      const file1 = new File(['1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['2'], 'test2.jpg', { type: 'image/jpeg' })
      const file3 = new File(['3'], 'test3.jpg', { type: 'image/jpeg' })

      addPhoto(file1)
      addPhoto(file2)
      addPhoto(file3)

      reorderPhotos(0, 2) // Move first to last
      expect(formData.value.photos[0].name).toBe('test2.jpg')
      expect(formData.value.photos[1].name).toBe('test3.jpg')
      expect(formData.value.photos[2].name).toBe('test1.jpg')
    })
  })

  describe('platform readiness', () => {
    it('should check platform requirements', () => {
      const { formData, getPlatformReadiness } = useListingForm()

      // Setup minimal data
      formData.value.title = 'Test'
      formData.value.photos = [new File([''], 'test.jpg', { type: 'image/jpeg' })]
      formData.value.price = 50
      formData.value.category = ListingCategory.ELECTRONICS
      formData.value.condition = ListingCondition.GOOD
      formData.value.city = 'Milano'
      formData.value.province = 'MI'

      const ebayReadiness = getPlatformReadiness(Platform.EBAY)
      expect(ebayReadiness.ready).toBe(true)

      // Vinted requires description and brand
      formData.value.description = ''
      formData.value.brand = ''
      const vintedReadiness = getPlatformReadiness(Platform.VINTED)
      expect(vintedReadiness.ready).toBe(false)
      expect(vintedReadiness.missingFields).toContain('description')
      expect(vintedReadiness.missingFields).toContain('brand')
    })
  })

  describe('duplicate listing (populateFromListing)', () => {
    // Mock listing to duplicate
    const mockListing = {
      id: 'listing-123',
      images: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      title: 'Original Product Title',
      description: 'Original description text',
      price: 99,
      currency: 'EUR',
      category: ListingCategory.CLOTHING,
      condition: ListingCondition.LIKE_NEW,
      brand: 'Nike',
      size: 'M',
      colors: [ListingColor.BLACK, ListingColor.WHITE],
      material: 'Cotton',
      city: 'Roma',
      province: 'RM',
      shippingAvailable: true,
      packageSize: PackageSize.MEDIUM,
      shippingCost: 5,
      platforms: [Platform.VINTED, Platform.EBAY],
      status: 'ACTIVE',
      publications: [],
      activityLog: [{ id: '1', action: 'created', description: 'Created', timestamp: new Date() }],
      stats: { totalViews: 100, favorites: 10, messages: 5, daysOnline: 30 },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should not copy photos (must be re-uploaded)', () => {
      const { populateFromListing, formData } = useListingForm()
      populateFromListing(mockListing as any)

      expect(formData.value.photos).toEqual([])
      expect(formData.value.photos.length).toBe(0)
    })

    it('should add "Copia di — " prefix to title', () => {
      const { populateFromListing, formData } = useListingForm()
      populateFromListing(mockListing as any)

      expect(formData.value.title).toBe('Copia di — Original Product Title')
      expect(formData.value.title.startsWith('Copia di — ')).toBe(true)
    })

    it('should copy all editable fields', () => {
      const { populateFromListing, formData } = useListingForm()
      populateFromListing(mockListing as any)

      expect(formData.value.description).toBe('Original description text')
      expect(formData.value.price).toBe(99)
      expect(formData.value.category).toBe(ListingCategory.CLOTHING)
      expect(formData.value.condition).toBe(ListingCondition.LIKE_NEW)
      expect(formData.value.brand).toBe('Nike')
      expect(formData.value.size).toBe('M')
      expect(formData.value.colors).toEqual([ListingColor.BLACK, ListingColor.WHITE])
      expect(formData.value.material).toBe('Cotton')
      expect(formData.value.city).toBe('Roma')
      expect(formData.value.province).toBe('RM')
      expect(formData.value.shippingAvailable).toBe(true)
      expect(formData.value.packageSize).toBe(PackageSize.MEDIUM)
      expect(formData.value.shippingCost).toBe(5)
      expect(formData.value.platforms).toEqual([Platform.VINTED, Platform.EBAY])
    })

    it('should set isDuplicating to true', () => {
      const { populateFromListing, isDuplicating } = useListingForm()
      populateFromListing(mockListing as any)

      expect(isDuplicating.value).toBe(true)
    })

    it('should reset to step 1 (photos)', () => {
      const { populateFromListing, currentStep, goToStep, formData } = useListingForm()

      // First setup valid data and go to another step
      formData.value.photos = [new File([''], 'test.jpg', { type: 'image/jpeg' })]
      formData.value.title = 'Test'
      formData.value.description = 'Test desc'
      formData.value.price = 50
      formData.value.category = ListingCategory.CLOTHING
      formData.value.condition = ListingCondition.GOOD
      formData.value.brand = 'Nike'
      formData.value.size = 'M'
      goToStep(3)
      expect(currentStep.value).toBe(3)

      // Then populate from listing
      populateFromListing(mockListing as any)

      expect(currentStep.value).toBe(1)
    })

    it('should create independent copies of arrays (no reference sharing)', () => {
      const { populateFromListing, formData } = useListingForm()
      populateFromListing(mockListing as any)

      // Modify the form data
      formData.value.colors.push(ListingColor.RED)
      formData.value.platforms.push(Platform.SUBITO)

      // Original mock should not be affected
      expect(mockListing.colors).toEqual([ListingColor.BLACK, ListingColor.WHITE])
      expect(mockListing.platforms).toEqual([Platform.VINTED, Platform.EBAY])
    })
  })
})
