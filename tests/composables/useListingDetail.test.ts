import { describe, it, expect, beforeEach } from 'vitest'
import { useListingDetail } from '~/composables/useListingDetail'
import {
  ListingCategory,
  ListingCondition,
  ListingColor,
  PackageSize,
  Platform,
  type Listing,
} from '~/types/listing'

describe('useListingDetail', () => {
  // Mock listing for testing
  const createMockListing = (): Listing => ({
    id: 'listing-123',
    images: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    title: 'Test Product',
    description: 'Test description',
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
    activityLog: [],
    stats: { totalViews: 100, favorites: 10, messages: 5, daysOnline: 30 },
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  beforeEach(() => {
    // Reset state before each test
    const { exitEditMode } = useListingDetail()
    exitEditMode()
  })

  describe('initial state', () => {
    it('should start in view mode', () => {
      const { isEditMode, workingCopy, originalSnapshot } = useListingDetail()
      expect(isEditMode.value).toBe(false)
      expect(workingCopy.value).toBeNull()
      expect(originalSnapshot.value).toBeNull()
    })

    it('should have no changes initially', () => {
      const { hasChanges, modifiedFields } = useListingDetail()
      expect(hasChanges.value).toBe(false)
      expect(modifiedFields.value.size).toBe(0)
    })
  })

  describe('enterEditMode', () => {
    it('should enable edit mode', () => {
      const { enterEditMode, isEditMode } = useListingDetail()
      enterEditMode(createMockListing())
      expect(isEditMode.value).toBe(true)
    })

    it('should create working copy from listing', () => {
      const { enterEditMode, workingCopy } = useListingDetail()
      const listing = createMockListing()
      enterEditMode(listing)

      expect(workingCopy.value).not.toBeNull()
      expect(workingCopy.value?.title).toBe('Test Product')
      expect(workingCopy.value?.price).toBe(99)
      expect(workingCopy.value?.brand).toBe('Nike')
    })

    it('should create deep clone (no reference sharing)', () => {
      const { enterEditMode, workingCopy } = useListingDetail()
      const listing = createMockListing()
      enterEditMode(listing)

      // Modify working copy
      workingCopy.value!.colors!.push(ListingColor.RED)

      // Original should not be affected
      expect(listing.colors).toEqual([ListingColor.BLACK, ListingColor.WHITE])
    })

    it('should store original snapshot', () => {
      const { enterEditMode, originalSnapshot } = useListingDetail()
      enterEditMode(createMockListing())

      expect(originalSnapshot.value).not.toBeNull()
      expect(originalSnapshot.value?.title).toBe('Test Product')
    })
  })

  describe('exitEditMode', () => {
    it('should disable edit mode', () => {
      const { enterEditMode, exitEditMode, isEditMode } = useListingDetail()
      enterEditMode(createMockListing())
      exitEditMode()

      expect(isEditMode.value).toBe(false)
    })

    it('should clear working copy and snapshot', () => {
      const { enterEditMode, exitEditMode, workingCopy, originalSnapshot } = useListingDetail()
      enterEditMode(createMockListing())
      exitEditMode()

      expect(workingCopy.value).toBeNull()
      expect(originalSnapshot.value).toBeNull()
    })
  })

  describe('change tracking', () => {
    it('should detect no changes when data is unmodified', () => {
      const { enterEditMode, hasChanges, modifiedFields } = useListingDetail()
      enterEditMode(createMockListing())

      expect(hasChanges.value).toBe(false)
      expect(modifiedFields.value.size).toBe(0)
    })

    it('should detect changes to simple fields', () => {
      const { enterEditMode, updateField, hasChanges, modifiedFields, isFieldModified } =
        useListingDetail()
      enterEditMode(createMockListing())

      updateField('title', 'New Title')

      expect(hasChanges.value).toBe(true)
      expect(modifiedFields.value.has('title')).toBe(true)
      expect(isFieldModified('title')).toBe(true)
      expect(isFieldModified('description')).toBe(false)
    })

    it('should detect changes to array fields', () => {
      const { enterEditMode, updateField, modifiedFields } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('colors', [ListingColor.RED])

      expect(modifiedFields.value.has('colors')).toBe(true)
    })

    it('should detect changes to number fields', () => {
      const { enterEditMode, updateField, modifiedFields } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('price', 150)

      expect(modifiedFields.value.has('price')).toBe(true)
    })

    it('should not mark field as modified if value is the same', () => {
      const { enterEditMode, updateField, modifiedFields } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('title', 'Test Product') // Same as original

      expect(modifiedFields.value.has('title')).toBe(false)
    })
  })

  describe('discardChanges', () => {
    it('should restore working copy to original values', () => {
      const { enterEditMode, updateField, discardChanges, workingCopy, hasChanges } =
        useListingDetail()
      enterEditMode(createMockListing())

      // Make changes
      updateField('title', 'Modified Title')
      updateField('price', 200)
      expect(hasChanges.value).toBe(true)

      // Discard
      discardChanges()

      expect(workingCopy.value?.title).toBe('Test Product')
      expect(workingCopy.value?.price).toBe(99)
      expect(hasChanges.value).toBe(false)
    })
  })

  describe('validation', () => {
    it('should require images', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('images', [])

      expect(validationErrors.value.images).toBe('Carica almeno una foto')
    })

    it('should limit images to 6', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('images', Array(7).fill('https://example.com/photo.jpg'))

      expect(validationErrors.value.images).toBe('Massimo 6 foto consentite')
    })

    it('should require title', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('title', '')

      expect(validationErrors.value.title).toBe('Il titolo è obbligatorio')
    })

    it('should enforce max 80 characters for title', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('title', 'a'.repeat(81))

      expect(validationErrors.value.title).toBe('Il titolo non può superare 80 caratteri')
    })

    it('should require description', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('description', '')

      expect(validationErrors.value.description).toBe('La descrizione è obbligatoria')
    })

    it('should require valid price', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('price', 0)

      expect(validationErrors.value.price).toBe('Inserisci un prezzo valido')
    })

    it('should require brand for non-OTHER categories', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('brand', '')

      expect(validationErrors.value.brand).toBe('La marca è obbligatoria')
    })

    it('should not require brand for OTHER category', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      const listing = createMockListing()
      listing.category = ListingCategory.OTHER
      listing.brand = ''
      enterEditMode(listing)

      expect(validationErrors.value.brand).toBeUndefined()
    })

    it('should require size for CLOTHING category', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('size', '')

      expect(validationErrors.value.size).toBe('La taglia è obbligatoria')
    })

    it('should require city', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('city', '')

      expect(validationErrors.value.city).toBe('Il comune è obbligatorio')
    })

    it('should require package size when shipping is available', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      enterEditMode(createMockListing())

      updateField('packageSize', null)

      expect(validationErrors.value.packageSize).toBe('Seleziona la dimensione del pacco')
    })

    it('should not require package size when shipping is not available', () => {
      const { enterEditMode, updateField, validationErrors } = useListingDetail()
      const listing = createMockListing()
      listing.shippingAvailable = false
      listing.packageSize = null
      enterEditMode(listing)

      expect(validationErrors.value.packageSize).toBeUndefined()
    })

    it('should be valid when all fields are correct', () => {
      const { enterEditMode, isValid, validationErrors } = useListingDetail()
      enterEditMode(createMockListing())

      expect(isValid.value).toBe(true)
      expect(Object.keys(validationErrors.value)).toHaveLength(0)
    })
  })

  describe('getFieldLabel', () => {
    it('should return Italian labels for known fields', () => {
      const { getFieldLabel } = useListingDetail()

      expect(getFieldLabel('title')).toBe('Titolo')
      expect(getFieldLabel('price')).toBe('Prezzo')
      expect(getFieldLabel('description')).toBe('Descrizione')
      expect(getFieldLabel('city')).toBe('Comune')
    })

    it('should return field name for unknown fields', () => {
      const { getFieldLabel } = useListingDetail()

      expect(getFieldLabel('unknownField')).toBe('unknownField')
    })
  })
})
