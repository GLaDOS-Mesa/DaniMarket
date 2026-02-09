import type { Listing, PlatformPublication } from '~/types/listing'
import {
  Platform,
  ListingCategory,
  ListingCondition,
  ListingColor,
  PackageSize,
  ListingStatus,
  PlatformPublicationStatus,
  ActivityAction,
} from '~/types/listing'

// ========== MOCK DATA ==========
// Simulates database records - will be replaced by actual API calls

const mockListings: Listing[] = [
  {
    id: 'listing-1',
    title: 'iPhone 14 Pro 256GB Viola Scuro',
    description:
      'Vendo iPhone 14 Pro 256GB colore Viola Scuro (Deep Purple). Acquistato a dicembre 2023, sempre utilizzato con cover e pellicola protettiva. Batteria all\'85% di capacità. Inclusi scatola originale, cavo e caricatore. Nessun graffio o segno di usura visibile. Funziona perfettamente.',
    price: 750,
    currency: 'EUR',
    category: ListingCategory.ELECTRONICS,
    condition: ListingCondition.LIKE_NEW,
    brand: 'Apple',
    size: '',
    colors: [ListingColor.PURPLE],
    material: '',
    city: 'Milano',
    province: 'Milano (MI)',
    shippingAvailable: true,
    packageSize: PackageSize.SMALL,
    shippingCost: 9.9,
    images: [
      'https://picsum.photos/seed/iphone14a/800/800',
      'https://picsum.photos/seed/iphone14b/800/800',
      'https://picsum.photos/seed/iphone14c/800/800',
      'https://picsum.photos/seed/iphone14d/800/800',
    ],
    platforms: [Platform.EBAY, Platform.VINTED, Platform.SUBITO],
    status: ListingStatus.ACTIVE,
    publications: [
      {
        id: 'pub-1-1',
        platform: Platform.EBAY,
        status: PlatformPublicationStatus.PUBLISHED,
        platformListingId: 'ebay-123456',
        platformListingUrl: 'https://www.ebay.it/itm/123456',
        publishedAt: new Date('2024-01-15T10:30:00'),
        lastError: null,
        createdAt: new Date('2024-01-15T10:00:00'),
        updatedAt: new Date('2024-01-15T10:30:00'),
      },
      {
        id: 'pub-1-2',
        platform: Platform.VINTED,
        status: PlatformPublicationStatus.PUBLISHED,
        platformListingId: 'vinted-789012',
        platformListingUrl: 'https://www.vinted.it/items/789012',
        publishedAt: new Date('2024-01-15T10:35:00'),
        lastError: null,
        createdAt: new Date('2024-01-15T10:00:00'),
        updatedAt: new Date('2024-01-15T10:35:00'),
      },
      {
        id: 'pub-1-3',
        platform: Platform.SUBITO,
        status: PlatformPublicationStatus.ERROR,
        platformListingId: null,
        platformListingUrl: null,
        publishedAt: null,
        lastError: 'Errore di autenticazione. Verifica le credenziali del tuo account Subito.',
        createdAt: new Date('2024-01-15T10:00:00'),
        updatedAt: new Date('2024-01-15T10:40:00'),
      },
    ],
    activityLog: [
      {
        id: 'act-1-1',
        action: ActivityAction.CREATED,
        description: 'Annuncio creato come bozza',
        platform: null,
        timestamp: new Date('2024-01-15T09:00:00'),
        metadata: null,
      },
      {
        id: 'act-1-2',
        action: ActivityAction.PUBLISHED,
        description: 'Pubblicato su eBay',
        platform: Platform.EBAY,
        timestamp: new Date('2024-01-15T10:30:00'),
        metadata: { listingId: 'ebay-123456' },
      },
      {
        id: 'act-1-3',
        action: ActivityAction.PUBLISHED,
        description: 'Pubblicato su Vinted',
        platform: Platform.VINTED,
        timestamp: new Date('2024-01-15T10:35:00'),
        metadata: { listingId: 'vinted-789012' },
      },
      {
        id: 'act-1-4',
        action: ActivityAction.UPDATED,
        description: 'Prezzo modificato da €800 a €750',
        platform: null,
        timestamp: new Date('2024-01-20T14:00:00'),
        metadata: { field: 'price', oldValue: 800, newValue: 750 },
      },
    ],
    stats: {
      totalViews: 234,
      favorites: 18,
      messages: 5,
      daysOnline: 12,
    },
    createdAt: new Date('2024-01-15T09:00:00'),
    updatedAt: new Date('2024-01-20T14:00:00'),
  },
  {
    id: 'listing-2',
    title: 'MacBook Air M1 2020 256GB',
    description:
      'MacBook Air M1 2020 in ottime condizioni. Colore Grigio Siderale. 8GB RAM, 256GB SSD. Batteria con 87 cicli, autonomia eccellente. Sempre usato con custodia e pellicola tastiera. Includo caricatore originale e scatola.',
    price: 850,
    currency: 'EUR',
    category: ListingCategory.ELECTRONICS,
    condition: ListingCondition.GOOD,
    brand: 'Apple',
    size: '',
    colors: [ListingColor.GREY],
    material: 'Alluminio',
    city: 'Roma',
    province: 'Roma (RM)',
    shippingAvailable: true,
    packageSize: PackageSize.MEDIUM,
    shippingCost: 15,
    images: [
      'https://picsum.photos/seed/macbook1/800/800',
      'https://picsum.photos/seed/macbook2/800/800',
    ],
    platforms: [Platform.EBAY, Platform.FACEBOOK],
    status: ListingStatus.ACTIVE,
    publications: [
      {
        id: 'pub-2-1',
        platform: Platform.EBAY,
        status: PlatformPublicationStatus.PUBLISHED,
        platformListingId: 'ebay-234567',
        platformListingUrl: 'https://www.ebay.it/itm/234567',
        publishedAt: new Date('2024-01-10T14:00:00'),
        lastError: null,
        createdAt: new Date('2024-01-10T13:30:00'),
        updatedAt: new Date('2024-01-10T14:00:00'),
      },
      {
        id: 'pub-2-2',
        platform: Platform.FACEBOOK,
        status: PlatformPublicationStatus.ERROR,
        platformListingId: null,
        platformListingUrl: null,
        publishedAt: null,
        lastError: 'Impossibile pubblicare: categoria non supportata.',
        createdAt: new Date('2024-01-10T13:30:00'),
        updatedAt: new Date('2024-01-10T14:05:00'),
      },
    ],
    activityLog: [
      {
        id: 'act-2-1',
        action: ActivityAction.CREATED,
        description: 'Annuncio creato',
        platform: null,
        timestamp: new Date('2024-01-10T13:30:00'),
        metadata: null,
      },
      {
        id: 'act-2-2',
        action: ActivityAction.PUBLISHED,
        description: 'Pubblicato su eBay',
        platform: Platform.EBAY,
        timestamp: new Date('2024-01-10T14:00:00'),
        metadata: null,
      },
    ],
    stats: {
      totalViews: 156,
      favorites: 8,
      messages: 3,
      daysOnline: 17,
    },
    createdAt: new Date('2024-01-10T13:30:00'),
    updatedAt: new Date('2024-01-10T14:05:00'),
  },
  {
    id: 'listing-3',
    title: 'Giacca invernale The North Face Nuptse',
    description:
      'Giacca The North Face Nuptse 1996 Retro, taglia M, colore nero. Acquistata l\'anno scorso, usata solo una stagione. Condizioni perfette, nessun difetto. Imbottitura in piuma d\'oca 700.',
    price: 180,
    currency: 'EUR',
    category: ListingCategory.CLOTHING,
    condition: ListingCondition.LIKE_NEW,
    brand: 'The North Face',
    size: 'M',
    colors: [ListingColor.BLACK],
    material: 'Nylon / Piuma',
    city: 'Torino',
    province: 'Torino (TO)',
    shippingAvailable: true,
    packageSize: PackageSize.MEDIUM,
    shippingCost: 8,
    images: [],
    platforms: [],
    status: ListingStatus.DRAFT,
    publications: [],
    activityLog: [
      {
        id: 'act-3-1',
        action: ActivityAction.CREATED,
        description: 'Annuncio creato come bozza',
        platform: null,
        timestamp: new Date('2024-01-22T16:00:00'),
        metadata: null,
      },
    ],
    stats: {
      totalViews: null,
      favorites: null,
      messages: null,
      daysOnline: null,
    },
    createdAt: new Date('2024-01-22T16:00:00'),
    updatedAt: new Date('2024-01-22T16:00:00'),
  },
  {
    id: 'listing-4',
    title: 'Bicicletta da corsa Bianchi Oltre XR4',
    description:
      'Bianchi Oltre XR4 taglia 55, gruppo Shimano Ultegra Di2, ruote Fulcrum Racing Zero. Km percorsi circa 8000. Telaio in carbonio perfetto, nessuna caduta. Vendo per passaggio a gravel.',
    price: 3200,
    currency: 'EUR',
    category: ListingCategory.SPORTS,
    condition: ListingCondition.GOOD,
    brand: 'Bianchi',
    size: '55',
    colors: [ListingColor.GREEN, ListingColor.BLACK],
    material: 'Carbonio',
    city: 'Firenze',
    province: 'Firenze (FI)',
    shippingAvailable: false,
    packageSize: null,
    shippingCost: null,
    images: [
      'https://picsum.photos/seed/bianchi1/800/800',
      'https://picsum.photos/seed/bianchi2/800/800',
      'https://picsum.photos/seed/bianchi3/800/800',
    ],
    platforms: [Platform.SUBITO, Platform.FACEBOOK],
    status: ListingStatus.SOLD,
    publications: [
      {
        id: 'pub-4-1',
        platform: Platform.SUBITO,
        status: PlatformPublicationStatus.REMOVED,
        platformListingId: 'subito-456789',
        platformListingUrl: null,
        publishedAt: new Date('2024-01-05T09:00:00'),
        lastError: null,
        createdAt: new Date('2024-01-05T08:30:00'),
        updatedAt: new Date('2024-01-18T11:00:00'),
      },
      {
        id: 'pub-4-2',
        platform: Platform.FACEBOOK,
        status: PlatformPublicationStatus.REMOVED,
        platformListingId: 'fb-987654',
        platformListingUrl: null,
        publishedAt: new Date('2024-01-05T09:05:00'),
        lastError: null,
        createdAt: new Date('2024-01-05T08:30:00'),
        updatedAt: new Date('2024-01-18T11:00:00'),
      },
    ],
    activityLog: [
      {
        id: 'act-4-1',
        action: ActivityAction.CREATED,
        description: 'Annuncio creato',
        platform: null,
        timestamp: new Date('2024-01-05T08:30:00'),
        metadata: null,
      },
      {
        id: 'act-4-2',
        action: ActivityAction.PUBLISHED,
        description: 'Pubblicato su Subito',
        platform: Platform.SUBITO,
        timestamp: new Date('2024-01-05T09:00:00'),
        metadata: null,
      },
      {
        id: 'act-4-3',
        action: ActivityAction.PUBLISHED,
        description: 'Pubblicato su Facebook Marketplace',
        platform: Platform.FACEBOOK,
        timestamp: new Date('2024-01-05T09:05:00'),
        metadata: null,
      },
      {
        id: 'act-4-4',
        action: ActivityAction.SOLD,
        description: 'Articolo venduto',
        platform: null,
        timestamp: new Date('2024-01-18T11:00:00'),
        metadata: { soldPrice: 3000, buyer: 'Marco R.' },
      },
    ],
    stats: {
      totalViews: 89,
      favorites: 12,
      messages: 8,
      daysOnline: 13,
    },
    createdAt: new Date('2024-01-05T08:30:00'),
    updatedAt: new Date('2024-01-18T11:00:00'),
  },
  {
    id: 'listing-5',
    title: 'PlayStation 5 Digital Edition',
    description:
      'PS5 Digital Edition con controller DualSense originale. Console in perfette condizioni, utilizzata poco. Firmware aggiornato all\'ultima versione. Vendo per passaggio a PC gaming.',
    price: 380,
    currency: 'EUR',
    category: ListingCategory.GAMES,
    condition: ListingCondition.LIKE_NEW,
    brand: 'Sony',
    size: '',
    colors: [ListingColor.WHITE, ListingColor.BLACK],
    material: '',
    city: 'Napoli',
    province: 'Napoli (NA)',
    shippingAvailable: true,
    packageSize: PackageSize.LARGE,
    shippingCost: 20,
    images: [
      'https://picsum.photos/seed/ps5a/800/800',
      'https://picsum.photos/seed/ps5b/800/800',
    ],
    platforms: [Platform.EBAY, Platform.VINTED, Platform.SUBITO, Platform.FACEBOOK],
    status: ListingStatus.ACTIVE,
    publications: [
      {
        id: 'pub-5-1',
        platform: Platform.EBAY,
        status: PlatformPublicationStatus.PUBLISHED,
        platformListingId: 'ebay-567890',
        platformListingUrl: 'https://www.ebay.it/itm/567890',
        publishedAt: new Date('2024-01-20T15:00:00'),
        lastError: null,
        createdAt: new Date('2024-01-20T14:30:00'),
        updatedAt: new Date('2024-01-20T15:00:00'),
      },
      {
        id: 'pub-5-2',
        platform: Platform.VINTED,
        status: PlatformPublicationStatus.PUBLISHED,
        platformListingId: 'vinted-345678',
        platformListingUrl: 'https://www.vinted.it/items/345678',
        publishedAt: new Date('2024-01-20T15:05:00'),
        lastError: null,
        createdAt: new Date('2024-01-20T14:30:00'),
        updatedAt: new Date('2024-01-20T15:05:00'),
      },
      {
        id: 'pub-5-3',
        platform: Platform.SUBITO,
        status: PlatformPublicationStatus.PUBLISHED,
        platformListingId: 'subito-901234',
        platformListingUrl: 'https://www.subito.it/annunci/901234',
        publishedAt: new Date('2024-01-20T15:10:00'),
        lastError: null,
        createdAt: new Date('2024-01-20T14:30:00'),
        updatedAt: new Date('2024-01-20T15:10:00'),
      },
      {
        id: 'pub-5-4',
        platform: Platform.FACEBOOK,
        status: PlatformPublicationStatus.PUBLISHED,
        platformListingId: 'fb-112233',
        platformListingUrl: 'https://www.facebook.com/marketplace/item/112233',
        publishedAt: new Date('2024-01-20T15:15:00'),
        lastError: null,
        createdAt: new Date('2024-01-20T14:30:00'),
        updatedAt: new Date('2024-01-20T15:15:00'),
      },
    ],
    activityLog: [
      {
        id: 'act-5-1',
        action: ActivityAction.CREATED,
        description: 'Annuncio creato',
        platform: null,
        timestamp: new Date('2024-01-20T14:30:00'),
        metadata: null,
      },
      {
        id: 'act-5-2',
        action: ActivityAction.PUBLISHED,
        description: 'Pubblicato su tutte le piattaforme',
        platform: null,
        timestamp: new Date('2024-01-20T15:15:00'),
        metadata: { platforms: ['ebay', 'vinted', 'subito', 'facebook'] },
      },
    ],
    stats: {
      totalViews: 412,
      favorites: 34,
      messages: 12,
      daysOnline: 7,
    },
    createdAt: new Date('2024-01-20T14:30:00'),
    updatedAt: new Date('2024-01-20T15:15:00'),
  },
]

// ========== SIMULATED API DELAY ==========

const simulateApiDelay = (ms: number = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ========== API INTERFACE ==========

export interface ListingsApiError {
  code: string
  message: string
}

export interface ListingsApiResponse<T> {
  data: T | null
  error: ListingsApiError | null
}

// ========== COMPOSABLE ==========

export const useListingsApi = () => {
  /**
   * Get all listings
   * Future: GET /api/listings
   */
  const getAll = async (): Promise<ListingsApiResponse<Listing[]>> => {
    await simulateApiDelay()
    return {
      data: [...mockListings],
      error: null,
    }
  }

  /**
   * Get a single listing by ID
   * Future: GET /api/listings/:id
   */
  const getById = async (id: string): Promise<ListingsApiResponse<Listing>> => {
    await simulateApiDelay(500)
    const listing = mockListings.find((l) => l.id === id)
    if (!listing) {
      return {
        data: null,
        error: { code: 'NOT_FOUND', message: 'Annuncio non trovato' },
      }
    }
    return {
      data: { ...listing },
      error: null,
    }
  }

  /**
   * Create a new listing
   * Future: POST /api/listings
   */
  const create = async (
    data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'publications' | 'activityLog' | 'stats'>
  ): Promise<ListingsApiResponse<Listing>> => {
    await simulateApiDelay(800)
    const newListing: Listing = {
      ...data,
      id: `listing-${Date.now()}`,
      publications: [],
      activityLog: [
        {
          id: `act-${Date.now()}`,
          action: ActivityAction.CREATED,
          description: 'Annuncio creato',
          platform: null,
          timestamp: new Date(),
          metadata: null,
        },
      ],
      stats: {
        totalViews: null,
        favorites: null,
        messages: null,
        daysOnline: null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockListings.push(newListing)
    return {
      data: newListing,
      error: null,
    }
  }

  /**
   * Update an existing listing
   * Future: PATCH /api/listings/:id
   */
  const update = async (
    id: string,
    data: Partial<Listing>
  ): Promise<ListingsApiResponse<Listing>> => {
    await simulateApiDelay(500)
    const index = mockListings.findIndex((l) => l.id === id)
    if (index === -1) {
      return {
        data: null,
        error: { code: 'NOT_FOUND', message: 'Annuncio non trovato' },
      }
    }
    const updated = {
      ...mockListings[index],
      ...data,
      updatedAt: new Date(),
    }
    mockListings[index] = updated
    return {
      data: updated,
      error: null,
    }
  }

  /**
   * Delete a listing
   * Future: DELETE /api/listings/:id
   */
  const remove = async (id: string): Promise<ListingsApiResponse<void>> => {
    await simulateApiDelay(500)
    const index = mockListings.findIndex((l) => l.id === id)
    if (index === -1) {
      return {
        data: null,
        error: { code: 'NOT_FOUND', message: 'Annuncio non trovato' },
      }
    }
    mockListings.splice(index, 1)
    return {
      data: undefined,
      error: null,
    }
  }

  /**
   * Publish listing to a platform
   * Future: POST /api/listings/:id/publish
   */
  const publishToPlatform = async (
    listingId: string,
    platform: Platform
  ): Promise<ListingsApiResponse<PlatformPublication>> => {
    await simulateApiDelay(1000)
    const index = mockListings.findIndex((l) => l.id === listingId)
    if (index === -1) {
      return {
        data: null,
        error: { code: 'NOT_FOUND', message: 'Annuncio non trovato' },
      }
    }

    const publication: PlatformPublication = {
      id: `pub-${Date.now()}`,
      platform,
      status: PlatformPublicationStatus.PUBLISHED,
      platformListingId: `${platform}-${Date.now()}`,
      platformListingUrl: `https://www.${platform}.it/items/${Date.now()}`,
      publishedAt: new Date(),
      lastError: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockListings[index].publications.push(publication)
    mockListings[index].status = ListingStatus.ACTIVE
    mockListings[index].updatedAt = new Date()

    return {
      data: publication,
      error: null,
    }
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    publishToPlatform,
  }
}
