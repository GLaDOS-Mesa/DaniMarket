// Mock useRuntimeConfig (not needed for mapping but may be loaded)
;(globalThis as any).useRuntimeConfig = () => ({})

import {
  conditionMapping,
  categoryMapping,
  getPublicPhotoUrl,
  buildAspects,
  listingToEbayInventoryItem,
  listingToEbayOffer,
} from '~/server/utils/ebay-mapping'

const baseListing = {
  title: 'Scarpe Nike Air Max',
  description: 'Scarpe da ginnastica nuove, mai indossate',
  condition: 'NEW_WITH_TAGS',
  category: 'SHOES',
  price: 89.99,
  brand: 'Nike',
  size: '42',
  colors: ['BLACK', 'WHITE'],
  material: 'Pelle',
  photos: [
    { url: 'https://res.cloudinary.com/demo/photo1.jpg' },
    { url: 'https://res.cloudinary.com/demo/photo2.jpg' },
  ],
}

// --- conditionMapping ---

describe('conditionMapping', () => {
  it('maps all DaniMarket conditions to eBay values', () => {
    expect(conditionMapping['NEW_WITH_TAGS']).toBe('NEW_WITH_TAGS')
    expect(conditionMapping['NEW_WITHOUT_TAGS']).toBe('NEW_WITHOUT_TAGS')
    expect(conditionMapping['LIKE_NEW']).toBe('LIKE_NEW')
    expect(conditionMapping['GOOD']).toBe('GOOD')
    expect(conditionMapping['FAIR']).toBe('FAIR')
    expect(conditionMapping['DAMAGED']).toBe('FOR_PARTS_OR_NOT_WORKING')
  })
})

// --- categoryMapping ---

describe('categoryMapping', () => {
  it('maps all DaniMarket categories to eBay IDs', () => {
    expect(categoryMapping['CLOTHING']).toBe('11450')
    expect(categoryMapping['SHOES']).toBe('11450')
    expect(categoryMapping['ACCESSORIES']).toBe('11450')
    expect(categoryMapping['ELECTRONICS']).toBe('293')
    expect(categoryMapping['HOME']).toBe('11700')
    expect(categoryMapping['SPORTS']).toBe('888')
    expect(categoryMapping['BOOKS_MEDIA']).toBe('267')
    expect(categoryMapping['GAMES']).toBe('1249')
    expect(categoryMapping['OTHER']).toBe('99')
  })
})

// --- getPublicPhotoUrl ---

describe('getPublicPhotoUrl', () => {
  it('returns full URLs as-is', () => {
    expect(getPublicPhotoUrl('https://res.cloudinary.com/photo.jpg'))
      .toBe('https://res.cloudinary.com/photo.jpg')
  })

  it('prepends app URL for relative paths', () => {
    const original = process.env.NUXT_PUBLIC_APP_URL
    process.env.NUXT_PUBLIC_APP_URL = 'https://danimarket.up.railway.app'

    expect(getPublicPhotoUrl('/uploads/listings/abc/photo.jpg'))
      .toBe('https://danimarket.up.railway.app/uploads/listings/abc/photo.jpg')

    process.env.NUXT_PUBLIC_APP_URL = original
  })
})

// --- buildAspects ---

describe('buildAspects', () => {
  it('includes all non-null fields', () => {
    const aspects = buildAspects(baseListing)

    expect(aspects).toEqual({
      Marca: ['Nike'],
      Taglia: ['42'],
      Colore: ['BLACK', 'WHITE'],
      Materiale: ['Pelle'],
    })
  })

  it('omits null/empty fields', () => {
    const aspects = buildAspects({
      ...baseListing,
      brand: null,
      size: null,
      colors: [],
      material: null,
    })

    expect(aspects).toEqual({})
  })

  it('includes only available fields', () => {
    const aspects = buildAspects({
      ...baseListing,
      size: null,
      material: null,
    })

    expect(aspects).toEqual({
      Marca: ['Nike'],
      Colore: ['BLACK', 'WHITE'],
    })
  })
})

// --- listingToEbayInventoryItem ---

describe('listingToEbayInventoryItem', () => {
  it('converts listing to eBay inventory item', () => {
    const item = listingToEbayInventoryItem(baseListing)

    expect(item.availability.shipToLocationAvailability.quantity).toBe(1)
    expect(item.condition).toBe('NEW_WITH_TAGS')
    expect(item.product.title).toBe('Scarpe Nike Air Max')
    expect(item.product.description).toBe(baseListing.description)
    expect(item.product.imageUrls).toHaveLength(2)
  })

  it('omits conditionDescription for new items', () => {
    const item = listingToEbayInventoryItem(baseListing)
    expect(item.conditionDescription).toBeUndefined()
  })

  it('includes conditionDescription for used items', () => {
    const item = listingToEbayInventoryItem({ ...baseListing, condition: 'GOOD' })
    expect(item.conditionDescription).toBe(baseListing.description)
  })

  it('truncates title to 80 chars', () => {
    const longTitle = 'A'.repeat(100)
    const item = listingToEbayInventoryItem({ ...baseListing, title: longTitle })
    expect(item.product.title).toHaveLength(80)
  })

  it('truncates description to 4000 chars', () => {
    const longDesc = 'B'.repeat(5000)
    const item = listingToEbayInventoryItem({ ...baseListing, description: longDesc })
    expect(item.product.description).toHaveLength(4000)
  })

  it('truncates conditionDescription to 1000 chars', () => {
    const longDesc = 'C'.repeat(2000)
    const item = listingToEbayInventoryItem({ ...baseListing, condition: 'FAIR', description: longDesc })
    expect(item.conditionDescription).toHaveLength(1000)
  })

  it('falls back to GOOD for unknown condition', () => {
    const item = listingToEbayInventoryItem({ ...baseListing, condition: 'UNKNOWN' })
    expect(item.condition).toBe('GOOD')
  })
})

// --- listingToEbayOffer ---

describe('listingToEbayOffer', () => {
  const policies = {
    fulfillmentPolicyId: 'fp-123',
    returnPolicyId: 'rp-456',
    paymentPolicyId: 'pp-789',
  }

  it('converts listing to eBay offer', () => {
    const offer = listingToEbayOffer(baseListing, 'DM-abc123', policies, 'danimarket-default')

    expect(offer.sku).toBe('DM-abc123')
    expect(offer.marketplaceId).toBe('EBAY_IT')
    expect(offer.format).toBe('FIXED_PRICE')
    expect(offer.availableQuantity).toBe(1)
    expect(offer.categoryId).toBe('11450')
    expect(offer.merchantLocationKey).toBe('danimarket-default')
    expect(offer.pricingSummary.price.value).toBe('89.99')
    expect(offer.pricingSummary.price.currency).toBe('EUR')
    expect(offer.listingPolicies).toEqual(policies)
  })

  it('handles Prisma Decimal price', () => {
    const decimalListing = {
      ...baseListing,
      price: { toNumber: () => 45.5 },
    }
    const offer = listingToEbayOffer(decimalListing, 'DM-x', policies, 'loc')
    expect(offer.pricingSummary.price.value).toBe('45.5')
  })

  it('falls back to category 99 for unknown category', () => {
    const offer = listingToEbayOffer(
      { ...baseListing, category: 'UNKNOWN' },
      'DM-x', policies, 'loc'
    )
    expect(offer.categoryId).toBe('99')
  })

  it('truncates listing description to 4000 chars', () => {
    const offer = listingToEbayOffer(
      { ...baseListing, description: 'D'.repeat(5000) },
      'DM-x', policies, 'loc'
    )
    expect(offer.listingDescription).toHaveLength(4000)
  })
})
