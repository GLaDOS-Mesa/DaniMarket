// ========== ENUMS ==========

export enum Platform {
  EBAY = 'ebay',
  VINTED = 'vinted',
  SUBITO = 'subito',
  FACEBOOK = 'facebook',
}

export enum ListingCategory {
  CLOTHING = 'clothing',
  SHOES = 'shoes',
  ACCESSORIES = 'accessories',
  ELECTRONICS = 'electronics',
  HOME = 'home',
  SPORTS = 'sports',
  BOOKS_MEDIA = 'books_media',
  GAMES = 'games',
  OTHER = 'other',
}

export enum ListingCondition {
  NEW_WITH_TAGS = 'new_with_tags',
  NEW_WITHOUT_TAGS = 'new_without_tags',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  DAMAGED = 'damaged',
}

export enum ListingColor {
  BLACK = 'black',
  WHITE = 'white',
  GREY = 'grey',
  BLUE = 'blue',
  RED = 'red',
  GREEN = 'green',
  YELLOW = 'yellow',
  PINK = 'pink',
  ORANGE = 'orange',
  PURPLE = 'purple',
  BROWN = 'brown',
  BEIGE = 'beige',
  MULTICOLOR = 'multicolor',
  OTHER = 'other',
}

export enum PackageSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

// ========== INTERFACES ==========

export interface ListingFormData {
  // Step 1 — Foto
  photos: ListingPhoto[]

  // Step 2 — Info base
  title: string
  description: string
  price: number | null
  category: ListingCategory | null
  condition: ListingCondition | null

  // Step 3 — Dettagli
  brand: string
  size: string
  colors: ListingColor[]
  material: string

  // Step 4 — Spedizione
  city: string
  province: string
  shippingAvailable: boolean
  packageSize: PackageSize | null
  shippingCost: number | null

  // Step 5 — Piattaforme
  platforms: Platform[]
}

export type ListingPhoto = {
  file: File
  rotation: 0 | 90 | 180 | 270
  displayRotation: number
}

// ========== PLATFORM MAPPINGS ==========

export const conditionMapping: Record<ListingCondition, Record<Platform, string>> = {
  [ListingCondition.NEW_WITH_TAGS]: {
    [Platform.EBAY]: 'New',
    [Platform.VINTED]: 'Nuovo con cartellino',
    [Platform.SUBITO]: 'Nuovo',
    [Platform.FACEBOOK]: 'New',
  },
  [ListingCondition.NEW_WITHOUT_TAGS]: {
    [Platform.EBAY]: 'New (other)',
    [Platform.VINTED]: 'Nuovo senza cartellino',
    [Platform.SUBITO]: 'Nuovo',
    [Platform.FACEBOOK]: 'New',
  },
  [ListingCondition.LIKE_NEW]: {
    [Platform.EBAY]: 'Used – Like New',
    [Platform.VINTED]: 'Ottime condizioni',
    [Platform.SUBITO]: 'Come nuovo',
    [Platform.FACEBOOK]: 'Used – Like New',
  },
  [ListingCondition.GOOD]: {
    [Platform.EBAY]: 'Used – Good',
    [Platform.VINTED]: 'Buone condizioni',
    [Platform.SUBITO]: 'Buono',
    [Platform.FACEBOOK]: 'Used – Good',
  },
  [ListingCondition.FAIR]: {
    [Platform.EBAY]: 'Used – Acceptable',
    [Platform.VINTED]: 'Discrete condizioni',
    [Platform.SUBITO]: 'Ottimo',
    [Platform.FACEBOOK]: 'Used – Fair',
  },
  [ListingCondition.DAMAGED]: {
    [Platform.EBAY]: 'For parts or not working',
    [Platform.VINTED]: 'Discrete condizioni',
    [Platform.SUBITO]: 'Danneggiato',
    [Platform.FACEBOOK]: 'Used – Fair',
  },
}

export const categoryMapping: Record<ListingCategory, Record<Platform, string>> = {
  [ListingCategory.CLOTHING]: {
    [Platform.EBAY]: 'Clothing, Shoes & Accessories > Clothing',
    [Platform.VINTED]: 'Abbigliamento',
    [Platform.SUBITO]: 'Abbigliamento e Accessori',
    [Platform.FACEBOOK]: 'Clothing & Shoes',
  },
  [ListingCategory.SHOES]: {
    [Platform.EBAY]: 'Clothing, Shoes & Accessories > Shoes',
    [Platform.VINTED]: 'Scarpe',
    [Platform.SUBITO]: 'Abbigliamento e Accessori',
    [Platform.FACEBOOK]: 'Clothing & Shoes',
  },
  [ListingCategory.ACCESSORIES]: {
    [Platform.EBAY]: 'Clothing, Shoes & Accessories > Accessories',
    [Platform.VINTED]: 'Accessori',
    [Platform.SUBITO]: 'Abbigliamento e Accessori',
    [Platform.FACEBOOK]: 'Accessories',
  },
  [ListingCategory.ELECTRONICS]: {
    [Platform.EBAY]: 'Electronics',
    [Platform.VINTED]: 'Elettronica',
    [Platform.SUBITO]: 'Elettronica',
    [Platform.FACEBOOK]: 'Electronics',
  },
  [ListingCategory.HOME]: {
    [Platform.EBAY]: 'Home & Garden',
    [Platform.VINTED]: 'Casa',
    [Platform.SUBITO]: 'Per la Casa e la Persona',
    [Platform.FACEBOOK]: 'Home & Garden',
  },
  [ListingCategory.SPORTS]: {
    [Platform.EBAY]: 'Sporting Goods',
    [Platform.VINTED]: 'Sport e tempo libero',
    [Platform.SUBITO]: 'Sport e Hobby',
    [Platform.FACEBOOK]: 'Sporting Goods',
  },
  [ListingCategory.BOOKS_MEDIA]: {
    [Platform.EBAY]: 'Books, Comics & Magazines',
    [Platform.VINTED]: 'Intrattenimento',
    [Platform.SUBITO]: 'Libri e Riviste',
    [Platform.FACEBOOK]: 'Entertainment',
  },
  [ListingCategory.GAMES]: {
    [Platform.EBAY]: 'Video Games & Consoles',
    [Platform.VINTED]: 'Elettronica',
    [Platform.SUBITO]: 'Console e Videogiochi',
    [Platform.FACEBOOK]: 'Toys & Games',
  },
  [ListingCategory.OTHER]: {
    [Platform.EBAY]: 'Everything Else',
    [Platform.VINTED]: 'Altro',
    [Platform.SUBITO]: 'Altro',
    [Platform.FACEBOOK]: 'Miscellaneous',
  },
}

export const colorMapping: Record<ListingColor, Record<Platform, string>> = {
  [ListingColor.BLACK]: {
    [Platform.EBAY]: 'Black',
    [Platform.VINTED]: 'Nero',
    [Platform.SUBITO]: 'Nero',
    [Platform.FACEBOOK]: 'Black',
  },
  [ListingColor.WHITE]: {
    [Platform.EBAY]: 'White',
    [Platform.VINTED]: 'Bianco',
    [Platform.SUBITO]: 'Bianco',
    [Platform.FACEBOOK]: 'White',
  },
  [ListingColor.GREY]: {
    [Platform.EBAY]: 'Gray',
    [Platform.VINTED]: 'Grigio',
    [Platform.SUBITO]: 'Grigio',
    [Platform.FACEBOOK]: 'Gray',
  },
  [ListingColor.BLUE]: {
    [Platform.EBAY]: 'Blue',
    [Platform.VINTED]: 'Blu',
    [Platform.SUBITO]: 'Blu',
    [Platform.FACEBOOK]: 'Blue',
  },
  [ListingColor.RED]: {
    [Platform.EBAY]: 'Red',
    [Platform.VINTED]: 'Rosso',
    [Platform.SUBITO]: 'Rosso',
    [Platform.FACEBOOK]: 'Red',
  },
  [ListingColor.GREEN]: {
    [Platform.EBAY]: 'Green',
    [Platform.VINTED]: 'Verde',
    [Platform.SUBITO]: 'Verde',
    [Platform.FACEBOOK]: 'Green',
  },
  [ListingColor.YELLOW]: {
    [Platform.EBAY]: 'Yellow',
    [Platform.VINTED]: 'Giallo',
    [Platform.SUBITO]: 'Giallo',
    [Platform.FACEBOOK]: 'Yellow',
  },
  [ListingColor.PINK]: {
    [Platform.EBAY]: 'Pink',
    [Platform.VINTED]: 'Rosa',
    [Platform.SUBITO]: 'Rosa',
    [Platform.FACEBOOK]: 'Pink',
  },
  [ListingColor.ORANGE]: {
    [Platform.EBAY]: 'Orange',
    [Platform.VINTED]: 'Arancione',
    [Platform.SUBITO]: 'Arancione',
    [Platform.FACEBOOK]: 'Orange',
  },
  [ListingColor.PURPLE]: {
    [Platform.EBAY]: 'Purple',
    [Platform.VINTED]: 'Viola',
    [Platform.SUBITO]: 'Viola',
    [Platform.FACEBOOK]: 'Purple',
  },
  [ListingColor.BROWN]: {
    [Platform.EBAY]: 'Brown',
    [Platform.VINTED]: 'Marrone',
    [Platform.SUBITO]: 'Marrone',
    [Platform.FACEBOOK]: 'Brown',
  },
  [ListingColor.BEIGE]: {
    [Platform.EBAY]: 'Beige',
    [Platform.VINTED]: 'Beige',
    [Platform.SUBITO]: 'Beige',
    [Platform.FACEBOOK]: 'Beige',
  },
  [ListingColor.MULTICOLOR]: {
    [Platform.EBAY]: 'Multicolor',
    [Platform.VINTED]: 'Multicolore',
    [Platform.SUBITO]: 'Multicolore',
    [Platform.FACEBOOK]: 'Multicolor',
  },
  [ListingColor.OTHER]: {
    [Platform.EBAY]: 'Other',
    [Platform.VINTED]: 'Altro',
    [Platform.SUBITO]: 'Altro',
    [Platform.FACEBOOK]: 'Other',
  },
}

export const packageSizeMapping: Record<PackageSize, Record<Platform, string>> = {
  [PackageSize.SMALL]: {
    [Platform.EBAY]: 'Small',
    [Platform.VINTED]: 'Piccolo',
    [Platform.SUBITO]: 'Piccolo',
    [Platform.FACEBOOK]: 'Small',
  },
  [PackageSize.MEDIUM]: {
    [Platform.EBAY]: 'Medium',
    [Platform.VINTED]: 'Medio',
    [Platform.SUBITO]: 'Medio',
    [Platform.FACEBOOK]: 'Medium',
  },
  [PackageSize.LARGE]: {
    [Platform.EBAY]: 'Large',
    [Platform.VINTED]: 'Grande',
    [Platform.SUBITO]: 'Grande',
    [Platform.FACEBOOK]: 'Large',
  },
}

// ========== PLATFORM COMPATIBILITY HELPERS ==========

export const platformRequiredFields: Record<Platform, (keyof ListingFormData)[]> = {
  [Platform.EBAY]: ['title', 'photos', 'price', 'category', 'condition', 'city', 'province'],
  [Platform.VINTED]: ['title', 'photos', 'description', 'price', 'category', 'condition', 'brand', 'size'],
  [Platform.SUBITO]: ['title', 'description', 'category', 'condition', 'city', 'province'],
  [Platform.FACEBOOK]: ['title', 'photos', 'price', 'category', 'condition', 'city', 'province'],
}

// Categories that require the size field
export const categoriesRequiringSize: ListingCategory[] = [
  ListingCategory.CLOTHING,
  ListingCategory.SHOES,
]

// Categories that show the material field
export const categoriesWithMaterial: ListingCategory[] = [
  ListingCategory.CLOTHING,
  ListingCategory.SHOES,
  ListingCategory.ACCESSORIES,
]

// Categories that show the brand field (all except "Other")
export const categoriesWithBrand: ListingCategory[] = [
  ListingCategory.CLOTHING,
  ListingCategory.SHOES,
  ListingCategory.ACCESSORIES,
  ListingCategory.ELECTRONICS,
  ListingCategory.HOME,
  ListingCategory.SPORTS,
  ListingCategory.BOOKS_MEDIA,
  ListingCategory.GAMES,
]

// ========== ITALIAN LABELS FOR UI ==========

export const categoryLabels: Record<ListingCategory, string> = {
  [ListingCategory.CLOTHING]: 'Abbigliamento',
  [ListingCategory.SHOES]: 'Scarpe',
  [ListingCategory.ACCESSORIES]: 'Accessori (borse, cinture, gioielli, orologi)',
  [ListingCategory.ELECTRONICS]: 'Elettronica',
  [ListingCategory.HOME]: 'Casa e arredamento',
  [ListingCategory.SPORTS]: 'Sport e tempo libero',
  [ListingCategory.BOOKS_MEDIA]: 'Libri e media',
  [ListingCategory.GAMES]: 'Giochi e videogiochi',
  [ListingCategory.OTHER]: 'Altro',
}

export const conditionLabels: Record<ListingCondition, string> = {
  [ListingCondition.NEW_WITH_TAGS]: 'Nuovo con cartellino',
  [ListingCondition.NEW_WITHOUT_TAGS]: 'Nuovo senza cartellino',
  [ListingCondition.LIKE_NEW]: 'Come nuovo',
  [ListingCondition.GOOD]: 'Buone condizioni',
  [ListingCondition.FAIR]: 'Discrete condizioni',
  [ListingCondition.DAMAGED]: 'Danneggiato',
}

export const colorLabels: Record<ListingColor, string> = {
  [ListingColor.BLACK]: 'Nero',
  [ListingColor.WHITE]: 'Bianco',
  [ListingColor.GREY]: 'Grigio',
  [ListingColor.BLUE]: 'Blu',
  [ListingColor.RED]: 'Rosso',
  [ListingColor.GREEN]: 'Verde',
  [ListingColor.YELLOW]: 'Giallo',
  [ListingColor.PINK]: 'Rosa',
  [ListingColor.ORANGE]: 'Arancione',
  [ListingColor.PURPLE]: 'Viola',
  [ListingColor.BROWN]: 'Marrone',
  [ListingColor.BEIGE]: 'Beige',
  [ListingColor.MULTICOLOR]: 'Multicolore',
  [ListingColor.OTHER]: 'Altro',
}

export const packageSizeLabels: Record<PackageSize, string> = {
  [PackageSize.SMALL]: 'Piccolo (< 2kg)',
  [PackageSize.MEDIUM]: 'Medio (2-5kg)',
  [PackageSize.LARGE]: 'Grande (5-15kg)',
}

export const platformLabels: Record<Platform, string> = {
  [Platform.EBAY]: 'eBay',
  [Platform.VINTED]: 'Vinted',
  [Platform.SUBITO]: 'Subito.it',
  [Platform.FACEBOOK]: 'Facebook Marketplace',
}

// ========== SIZE OPTIONS ==========

export const clothingSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const

export const shoeSizes = Array.from({ length: 16 }, (_, i) => String(35 + i)) as string[]

// ========== ITALIAN LOCATION ==========

export interface ItalianCity {
  nome: string
  provincia: string
  sigla: string
  regione: string
  cap: string[]
}

// ========== LISTING STATUS ENUMS ==========

export enum ListingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  ARCHIVED = 'ARCHIVED',
}

export enum PlatformPublicationStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ERROR = 'ERROR',
  REMOVED = 'REMOVED',
}

export enum ActivityAction {
  CREATED = 'created',
  PUBLISHED = 'published',
  UPDATED = 'updated',
  REMOVED = 'removed',
  SOLD = 'sold',
  DRAFTED = 'drafted',
  DELETED = 'deleted',
  PLATFORM_ADDED = 'platform_added',
  PLATFORM_REMOVED = 'platform_removed',
}

// ========== LISTING DETAIL INTERFACES ==========

export interface PlatformPublication {
  id: string
  platform: Platform
  status: PlatformPublicationStatus
  platformListingId: string | null
  platformListingUrl: string | null
  publishedAt: Date | null
  lastError: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ActivityLogEntry {
  id: string
  action: ActivityAction
  description: string
  platform: Platform | null
  timestamp: Date
  metadata: Record<string, unknown> | null
}

export interface ListingStats {
  totalViews: number | null
  favorites: number | null
  messages: number | null
  daysOnline: number | null
}

export interface Listing {
  id: string
  // Step 1 — Foto (URLs instead of File objects)
  images: string[]

  // Step 2 — Info base
  title: string
  description: string
  price: number
  currency: string
  category: ListingCategory
  condition: ListingCondition

  // Step 3 — Dettagli
  brand: string
  size: string
  colors: ListingColor[]
  material: string

  // Step 4 — Spedizione
  city: string
  province: string
  shippingAvailable: boolean
  packageSize: PackageSize | null
  shippingCost: number | null

  // Step 5 — Piattaforme
  platforms: Platform[]

  // Status & Publications
  status: ListingStatus
  publications: PlatformPublication[]

  // Activity & Stats
  activityLog: ActivityLogEntry[]
  stats: ListingStats

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ========== STATUS LABELS ==========

export const listingStatusLabels: Record<ListingStatus, string> = {
  [ListingStatus.DRAFT]: 'Bozza',
  [ListingStatus.ACTIVE]: 'Attivo',
  [ListingStatus.SOLD]: 'Venduto',
  [ListingStatus.ARCHIVED]: 'Archiviato',
}

export const publicationStatusLabels: Record<PlatformPublicationStatus, string> = {
  [PlatformPublicationStatus.DRAFT]: 'Bozza',
  [PlatformPublicationStatus.PUBLISHED]: 'Pubblicato',
  [PlatformPublicationStatus.ERROR]: 'Errore',
  [PlatformPublicationStatus.REMOVED]: 'Rimosso',
}

export const activityActionLabels: Record<ActivityAction, string> = {
  [ActivityAction.CREATED]: 'Annuncio creato',
  [ActivityAction.PUBLISHED]: 'Pubblicato',
  [ActivityAction.UPDATED]: 'Aggiornato',
  [ActivityAction.REMOVED]: 'Rimosso',
  [ActivityAction.SOLD]: 'Venduto',
  [ActivityAction.DRAFTED]: 'Salvato come bozza',
  [ActivityAction.DELETED]: 'Eliminato',
  [ActivityAction.PLATFORM_ADDED]: 'Piattaforma aggiunta',
  [ActivityAction.PLATFORM_REMOVED]: 'Piattaforma rimossa',
}

export const activityActionIcons: Record<ActivityAction, string> = {
  [ActivityAction.CREATED]: '✏️',
  [ActivityAction.PUBLISHED]: '🚀',
  [ActivityAction.UPDATED]: '📝',
  [ActivityAction.REMOVED]: '🗑️',
  [ActivityAction.SOLD]: '💰',
  [ActivityAction.DRAFTED]: '📋',
  [ActivityAction.DELETED]: '❌',
  [ActivityAction.PLATFORM_ADDED]: '➕',
  [ActivityAction.PLATFORM_REMOVED]: '➖',
}
