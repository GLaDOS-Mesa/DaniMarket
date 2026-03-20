/**
 * Mapping functions to convert DaniMarket listings to eBay Inventory API format.
 */

// DaniMarket condition → eBay condition enum
const conditionMapping: Record<string, string> = {
  NEW_WITH_TAGS: 'NEW_WITH_TAGS',
  NEW_WITHOUT_TAGS: 'NEW_WITHOUT_TAGS',
  LIKE_NEW: 'LIKE_NEW',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  DAMAGED: 'FOR_PARTS_OR_NOT_WORKING',
}

// DaniMarket category → eBay IT category ID
const categoryMapping: Record<string, string> = {
  CLOTHING: '11450',
  SHOES: '11450',
  ACCESSORIES: '11450',
  ELECTRONICS: '293',
  HOME: '11700',
  SPORTS: '888',
  BOOKS_MEDIA: '267',
  GAMES: '1249',
  OTHER: '99',
}

type ListingForMapping = {
  title: string
  description: string
  condition: string
  category: string
  price: number | { toNumber?: () => number }
  brand?: string | null
  size?: string | null
  colors: string[]
  material?: string | null
  photos: { url: string }[]
}

type EbayPolicies = {
  fulfillmentPolicyId: string
  returnPolicyId: string
  paymentPolicyId: string
}

/**
 * Returns the public HTTPS URL for a photo.
 */
export function getPublicPhotoUrl(photoUrl: string): string {
  // If already a full URL (Cloudinary), return as-is
  if (photoUrl.startsWith('http')) return photoUrl

  const appUrl = process.env.NUXT_PUBLIC_APP_URL || ''
  return `${appUrl}${photoUrl}`
}

/**
 * Builds eBay item specifics (aspects) from listing data.
 * Only includes non-null fields.
 */
export function buildAspects(listing: ListingForMapping): Record<string, string[]> {
  const aspects: Record<string, string[]> = {}

  if (listing.brand) aspects['Marca'] = [listing.brand]
  if (listing.size) aspects['Taglia'] = [listing.size]
  if (listing.colors.length > 0) aspects['Colore'] = [...listing.colors]
  if (listing.material) aspects['Materiale'] = [listing.material]

  return aspects
}

/**
 * Converts a DaniMarket listing to an eBay Inventory Item.
 */
export function listingToEbayInventoryItem(listing: ListingForMapping) {
  const needsConditionDescription =
    listing.condition !== 'NEW_WITH_TAGS' && listing.condition !== 'NEW_WITHOUT_TAGS'

  return {
    availability: {
      shipToLocationAvailability: {
        quantity: 1,
      },
    },
    condition: conditionMapping[listing.condition] || 'GOOD',
    conditionDescription: needsConditionDescription
      ? listing.description.substring(0, 1000)
      : undefined,
    product: {
      title: listing.title.substring(0, 80),
      description: listing.description.substring(0, 4000),
      aspects: buildAspects(listing),
      imageUrls: listing.photos.map((p) => getPublicPhotoUrl(p.url)),
    },
  }
}

/**
 * Converts a DaniMarket listing to an eBay Offer.
 */
export function listingToEbayOffer(
  listing: ListingForMapping,
  sku: string,
  policies: EbayPolicies,
  locationKey: string
) {
  const price = typeof listing.price === 'object' && listing.price?.toNumber
    ? listing.price.toNumber()
    : Number(listing.price)

  return {
    sku,
    marketplaceId: 'EBAY_IT',
    format: 'FIXED_PRICE',
    listingDescription: listing.description.substring(0, 4000),
    availableQuantity: 1,
    categoryId: categoryMapping[listing.category] || '99',
    merchantLocationKey: locationKey,
    pricingSummary: {
      price: {
        value: price.toString(),
        currency: 'EUR',
      },
    },
    listingPolicies: {
      fulfillmentPolicyId: policies.fulfillmentPolicyId,
      returnPolicyId: policies.returnPolicyId,
      paymentPolicyId: policies.paymentPolicyId,
    },
  }
}

export { conditionMapping, categoryMapping }
export type { EbayPolicies, ListingForMapping }
