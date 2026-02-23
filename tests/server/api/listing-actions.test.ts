import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mock Nuxt/Nitro auto-imports BEFORE route handler modules are loaded ---
// vi.hoisted moves this block before any import statements
const mocks = vi.hoisted(() => {
  const getRouterParam = vi.fn()
  const readBody = vi.fn()
  const getOwnedListing = vi.fn()
  const transaction = vi.fn()

  const errorResponse = vi.fn((_event: any, message: string, statusCode: number) => ({
    success: false,
    error: message,
    statusCode,
  }))

  const successResponse = vi.fn((data: any, statusCode = 200) => ({
    success: true,
    data,
    statusCode,
  }))

  // Nitro compiler macros
  ;(globalThis as any).defineRouteMeta = () => {}
  ;(globalThis as any).defineEventHandler = (fn: any) => fn

  // h3 helpers
  ;(globalThis as any).getRouterParam = getRouterParam
  ;(globalThis as any).readBody = readBody

  // Server utils (auto-imported by Nuxt)
  ;(globalThis as any).getOwnedListing = getOwnedListing
  ;(globalThis as any).errorResponse = errorResponse
  ;(globalThis as any).successResponse = successResponse
  ;(globalThis as any).prisma = { $transaction: transaction }
  ;(globalThis as any).DEV_USER_ID = vi.fn()

  return { getRouterParam, readBody, getOwnedListing, errorResponse, successResponse, transaction }
})

// --- Import handlers (defineEventHandler returns the raw function) ---
import publishHandler from '~/server/api/listings/[id]/publish.post'
import draftHandler from '~/server/api/listings/[id]/draft.post'
import soldHandler from '~/server/api/listings/[id]/sold.post'
import duplicateHandler from '~/server/api/listings/[id]/duplicate.post'

// --- Helpers ---

function createMockTx() {
  return {
    listing: {
      update: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    platformPublication: {
      updateMany: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  }
}

const mockEvent = {} as any

const baseListing = {
  id: 'listing-1',
  userId: 'user-123',
  title: 'Scarpe Nike',
  description: 'Scarpe da ginnastica nuove',
  price: 50,
  category: 'SHOES',
  condition: 'NEW_WITH_TAGS',
  brand: 'Nike',
  size: '42',
  colors: ['BLACK'],
  material: 'Leather',
  city: 'Milano',
  province: 'MI',
  shippingAvailable: true,
  packageSize: 'MEDIUM',
  shippingCost: 5,
  status: 'DRAFT',
  photos: [{ id: 'photo-1', order: 0 }],
  platformPublications: [
    { id: 'pub-1', platform: 'EBAY', status: 'DRAFT' },
    { id: 'pub-2', platform: 'VINTED', status: 'DRAFT' },
  ],
  activityLog: [{ id: 'log-1', action: 'CREATED' }],
}

describe('listing action endpoints', () => {
  let mockTx: ReturnType<typeof createMockTx>

  beforeEach(() => {
    vi.clearAllMocks()
    mockTx = createMockTx()
    mocks.transaction.mockImplementation(async (cb: any) => cb(mockTx))
  })

  // ─── PUBLISH ────────────────────────────────────────────────

  describe('POST /api/listings/[id]/publish', () => {
    it('should return 400 when id is missing', async () => {
      mocks.getRouterParam.mockReturnValue(undefined)

      await publishHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'ID annuncio mancante', 400)
    })

    it('should return 404 when listing not found', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(null)

      await publishHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Annuncio non trovato', 404)
    })

    it('should return 400 when no platform publications exist', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue({
        ...baseListing,
        platformPublications: [],
      })

      await publishHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(
        mockEvent,
        'Seleziona almeno una piattaforma',
        400,
      )
    })

    it('should return 400 when no photos exist', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue({
        ...baseListing,
        photos: [],
      })

      await publishHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(
        mockEvent,
        'Aggiungi almeno una foto',
        400,
      )
    })

    it('should set listing status to ACTIVE', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.findUnique.mockResolvedValue({ ...baseListing, status: 'ACTIVE' })

      await publishHandler(mockEvent)

      expect(mockTx.listing.update).toHaveBeenCalledWith({
        where: { id: 'listing-1' },
        data: { status: 'ACTIVE' },
      })
    })

    it('should update DRAFT/ERROR publications to PUBLISHED', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.findUnique.mockResolvedValue(baseListing)

      await publishHandler(mockEvent)

      expect(mockTx.platformPublication.updateMany).toHaveBeenCalledWith({
        where: {
          listingId: 'listing-1',
          status: { in: ['DRAFT', 'ERROR'] },
        },
        data: {
          status: 'PUBLISHED',
          publishedAt: expect.any(Date),
        },
      })
    })

    it('should create PUBLISHED activity log with platform names', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.findUnique.mockResolvedValue(baseListing)

      await publishHandler(mockEvent)

      expect(mockTx.activityLog.create).toHaveBeenCalledWith({
        data: {
          listingId: 'listing-1',
          action: 'PUBLISHED',
          description: 'Pubblicato su EBAY, VINTED',
          metadata: { platforms: ['EBAY', 'VINTED'] },
        },
      })
    })

    it('should return the updated listing via successResponse', async () => {
      const updatedListing = { ...baseListing, status: 'ACTIVE' }
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.findUnique.mockResolvedValue(updatedListing)

      await publishHandler(mockEvent)

      expect(mocks.successResponse).toHaveBeenCalledWith(updatedListing)
    })
  })

  // ─── DRAFT ──────────────────────────────────────────────────

  describe('POST /api/listings/[id]/draft', () => {
    it('should return 404 when listing not found', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(null)

      await draftHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Annuncio non trovato', 404)
    })

    it('should set listing status to DRAFT', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.findUnique.mockResolvedValue({ ...baseListing, status: 'DRAFT' })

      await draftHandler(mockEvent)

      expect(mockTx.listing.update).toHaveBeenCalledWith({
        where: { id: 'listing-1' },
        data: { status: 'DRAFT' },
      })
    })

    it('should create DRAFTED activity log', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.findUnique.mockResolvedValue(baseListing)

      await draftHandler(mockEvent)

      expect(mockTx.activityLog.create).toHaveBeenCalledWith({
        data: {
          listingId: 'listing-1',
          action: 'DRAFTED',
          description: 'Salvato come bozza',
        },
      })
    })

    it('should return the updated listing via successResponse', async () => {
      const draftedListing = { ...baseListing, status: 'DRAFT' }
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.findUnique.mockResolvedValue(draftedListing)

      await draftHandler(mockEvent)

      expect(mocks.successResponse).toHaveBeenCalledWith(draftedListing)
    })
  })

  // ─── SOLD ───────────────────────────────────────────────────

  describe('POST /api/listings/[id]/sold', () => {
    it('should return 404 when listing not found', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(null)

      await soldHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Annuncio non trovato', 404)
    })

    it('should mark listing as SOLD without platform', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mocks.readBody.mockResolvedValue(null)
      mockTx.listing.findUnique.mockResolvedValue({ ...baseListing, status: 'SOLD' })

      await soldHandler(mockEvent)

      expect(mockTx.listing.update).toHaveBeenCalledWith({
        where: { id: 'listing-1' },
        data: { status: 'SOLD' },
      })
    })

    it('should create activity log without platform when not specified', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mocks.readBody.mockResolvedValue(null)
      mockTx.listing.findUnique.mockResolvedValue(baseListing)

      await soldHandler(mockEvent)

      expect(mockTx.activityLog.create).toHaveBeenCalledWith({
        data: {
          listingId: 'listing-1',
          action: 'SOLD',
          description: 'Segnato come venduto',
          platform: undefined,
        },
      })
    })

    it('should include platform in activity log when specified', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mocks.readBody.mockResolvedValue({ platform: 'EBAY' })
      mockTx.listing.findUnique.mockResolvedValue(baseListing)

      await soldHandler(mockEvent)

      expect(mockTx.activityLog.create).toHaveBeenCalledWith({
        data: {
          listingId: 'listing-1',
          action: 'SOLD',
          description: 'Venduto tramite EBAY',
          platform: 'EBAY',
        },
      })
    })

    it('should handle readBody failure gracefully (no platform)', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mocks.readBody.mockRejectedValue(new Error('No body'))
      mockTx.listing.findUnique.mockResolvedValue(baseListing)

      await soldHandler(mockEvent)

      expect(mockTx.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: 'Segnato come venduto',
        }),
      })
    })
  })

  // ─── DUPLICATE ──────────────────────────────────────────────

  describe('POST /api/listings/[id]/duplicate', () => {
    it('should return 404 when source listing not found', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(null)

      await duplicateHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Annuncio non trovato', 404)
    })

    it('should create new listing with "Copia di — " prefix', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.create.mockResolvedValue({ id: 'new-listing-1' })
      mockTx.listing.findUnique.mockResolvedValue({ id: 'new-listing-1' })

      await duplicateHandler(mockEvent)

      expect(mockTx.listing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Copia di — Scarpe Nike',
        }),
      })
    })

    it('should create new listing with DRAFT status', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.create.mockResolvedValue({ id: 'new-listing-1' })
      mockTx.listing.findUnique.mockResolvedValue({ id: 'new-listing-1' })

      await duplicateHandler(mockEvent)

      expect(mockTx.listing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'DRAFT',
        }),
      })
    })

    it('should copy all listing fields from source', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.create.mockResolvedValue({ id: 'new-listing-1' })
      mockTx.listing.findUnique.mockResolvedValue({ id: 'new-listing-1' })

      await duplicateHandler(mockEvent)

      expect(mockTx.listing.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          description: 'Scarpe da ginnastica nuove',
          price: 50,
          category: 'SHOES',
          condition: 'NEW_WITH_TAGS',
          brand: 'Nike',
          size: '42',
          colors: ['BLACK'],
          material: 'Leather',
          city: 'Milano',
          province: 'MI',
          shippingAvailable: true,
          packageSize: 'MEDIUM',
          shippingCost: 5,
        }),
      })
    })

    it('should create CREATED activity log with duplicatedFrom metadata', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.create.mockResolvedValue({ id: 'new-listing-1' })
      mockTx.listing.findUnique.mockResolvedValue({ id: 'new-listing-1' })

      await duplicateHandler(mockEvent)

      expect(mockTx.activityLog.create).toHaveBeenCalledWith({
        data: {
          listingId: 'new-listing-1',
          action: 'CREATED',
          description: 'Duplicato da Scarpe Nike',
          metadata: { duplicatedFrom: 'listing-1' },
        },
      })
    })

    it('should return 201 status code', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.listing.create.mockResolvedValue({ id: 'new-listing-1' })
      const newListing = { id: 'new-listing-1', title: 'Copia di — Scarpe Nike' }
      mockTx.listing.findUnique.mockResolvedValue(newListing)

      await duplicateHandler(mockEvent)

      expect(mocks.successResponse).toHaveBeenCalledWith(newListing, 201)
    })
  })
})
