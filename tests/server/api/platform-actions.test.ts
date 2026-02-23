import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mock Nuxt/Nitro auto-imports BEFORE route handler modules are loaded ---
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

  ;(globalThis as any).defineRouteMeta = () => {}
  ;(globalThis as any).defineEventHandler = (fn: any) => fn
  ;(globalThis as any).getRouterParam = getRouterParam
  ;(globalThis as any).readBody = readBody
  ;(globalThis as any).getOwnedListing = getOwnedListing
  ;(globalThis as any).errorResponse = errorResponse
  ;(globalThis as any).successResponse = successResponse
  ;(globalThis as any).prisma = { $transaction: transaction }
  ;(globalThis as any).DEV_USER_ID = vi.fn()

  return { getRouterParam, readBody, getOwnedListing, errorResponse, successResponse, transaction }
})

// --- Import handlers ---
import addPlatformHandler from '~/server/api/listings/[id]/platforms/index.post'
import publishPlatformHandler from '~/server/api/listings/[id]/platforms/[platform]/publish.post'
import removePlatformHandler from '~/server/api/listings/[id]/platforms/[platform].delete'

// --- Helpers ---

function createMockTx() {
  return {
    listing: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    platformPublication: {
      create: vi.fn(),
      update: vi.fn(),
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
  status: 'DRAFT',
  photos: [{ id: 'photo-1', order: 0 }],
  platformPublications: [
    { id: 'pub-1', platform: 'EBAY', status: 'DRAFT' },
    { id: 'pub-2', platform: 'VINTED', status: 'PUBLISHED' },
  ],
  activityLog: [],
}

describe('platform action endpoints', () => {
  let mockTx: ReturnType<typeof createMockTx>

  beforeEach(() => {
    vi.clearAllMocks()
    mockTx = createMockTx()
    mocks.transaction.mockImplementation(async (cb: any) => cb(mockTx))
  })

  // ─── ADD PLATFORM ─────────────────────────────────────────

  describe('POST /api/listings/[id]/platforms', () => {
    it('should return 400 when id is missing', async () => {
      mocks.getRouterParam.mockReturnValue(undefined)

      await addPlatformHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'ID annuncio mancante', 400)
    })

    it('should return 404 when listing not found', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(null)

      await addPlatformHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Annuncio non trovato', 404)
    })

    it('should return 400 when platform is invalid', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mocks.readBody.mockResolvedValue({ platform: 'AMAZON' })

      await addPlatformHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Piattaforma non valida', 400)
    })

    it('should return 400 when platform already added', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mocks.readBody.mockResolvedValue({ platform: 'EBAY' })

      await addPlatformHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Piattaforma già aggiunta', 400)
    })

    it('should create platform publication with DRAFT status', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mocks.readBody.mockResolvedValue({ platform: 'SUBITO' })
      const createdPub = { id: 'pub-3', platform: 'SUBITO', status: 'DRAFT' }
      mockTx.platformPublication.create.mockResolvedValue(createdPub)

      await addPlatformHandler(mockEvent)

      expect(mockTx.platformPublication.create).toHaveBeenCalledWith({
        data: {
          listingId: 'listing-1',
          platform: 'SUBITO',
          status: 'DRAFT',
        },
      })
    })

    it('should create PLATFORM_ADDED activity log', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mocks.readBody.mockResolvedValue({ platform: 'SUBITO' })
      mockTx.platformPublication.create.mockResolvedValue({ id: 'pub-3' })

      await addPlatformHandler(mockEvent)

      expect(mockTx.activityLog.create).toHaveBeenCalledWith({
        data: {
          listingId: 'listing-1',
          action: 'PLATFORM_ADDED',
          description: 'Piattaforma SUBITO aggiunta',
          platform: 'SUBITO',
        },
      })
    })

    it('should return 201 status code', async () => {
      mocks.getRouterParam.mockReturnValue('listing-1')
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mocks.readBody.mockResolvedValue({ platform: 'SUBITO' })
      const createdPub = { id: 'pub-3', platform: 'SUBITO', status: 'DRAFT' }
      mockTx.platformPublication.create.mockResolvedValue(createdPub)

      await addPlatformHandler(mockEvent)

      expect(mocks.successResponse).toHaveBeenCalledWith(createdPub, 201)
    })
  })

  // ─── PUBLISH PLATFORM ─────────────────────────────────────

  describe('POST /api/listings/[id]/platforms/[platform]/publish', () => {
    it('should return 404 when listing not found', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'EBAY',
      )
      mocks.getOwnedListing.mockResolvedValue(null)

      await publishPlatformHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Annuncio non trovato', 404)
    })

    it('should return 404 when platform publication does not exist', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'FACEBOOK',
      )
      mocks.getOwnedListing.mockResolvedValue(baseListing)

      await publishPlatformHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Piattaforma non trovata', 404)
    })

    it('should return 400 when platform is already PUBLISHED', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'VINTED',
      )
      mocks.getOwnedListing.mockResolvedValue(baseListing)

      await publishPlatformHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Piattaforma già pubblicata', 400)
    })

    it('should update publication to PUBLISHED with publishedAt', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'EBAY',
      )
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.platformPublication.update.mockResolvedValue({ id: 'pub-1', status: 'PUBLISHED' })

      await publishPlatformHandler(mockEvent)

      expect(mockTx.platformPublication.update).toHaveBeenCalledWith({
        where: { id: 'pub-1' },
        data: {
          status: 'PUBLISHED',
          publishedAt: expect.any(Date),
          lastError: null,
        },
      })
    })

    it('should promote listing from DRAFT to ACTIVE', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'EBAY',
      )
      mocks.getOwnedListing.mockResolvedValue({ ...baseListing, status: 'DRAFT' })
      mockTx.platformPublication.update.mockResolvedValue({ id: 'pub-1' })

      await publishPlatformHandler(mockEvent)

      expect(mockTx.listing.update).toHaveBeenCalledWith({
        where: { id: 'listing-1' },
        data: { status: 'ACTIVE' },
      })
    })

    it('should NOT promote listing if already ACTIVE', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'EBAY',
      )
      mocks.getOwnedListing.mockResolvedValue({ ...baseListing, status: 'ACTIVE' })
      mockTx.platformPublication.update.mockResolvedValue({ id: 'pub-1' })

      await publishPlatformHandler(mockEvent)

      expect(mockTx.listing.update).not.toHaveBeenCalled()
    })

    it('should create PUBLISHED activity log with platform', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'EBAY',
      )
      mocks.getOwnedListing.mockResolvedValue(baseListing)
      mockTx.platformPublication.update.mockResolvedValue({ id: 'pub-1' })

      await publishPlatformHandler(mockEvent)

      expect(mockTx.activityLog.create).toHaveBeenCalledWith({
        data: {
          listingId: 'listing-1',
          action: 'PUBLISHED',
          description: 'Pubblicato su EBAY',
          platform: 'EBAY',
        },
      })
    })
  })

  // ─── REMOVE PLATFORM ──────────────────────────────────────

  describe('DELETE /api/listings/[id]/platforms/[platform]', () => {
    it('should return 404 when listing not found', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'EBAY',
      )
      mocks.getOwnedListing.mockResolvedValue(null)

      await removePlatformHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Annuncio non trovato', 404)
    })

    it('should return 404 when platform publication does not exist', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'FACEBOOK',
      )
      mocks.getOwnedListing.mockResolvedValue(baseListing)

      await removePlatformHandler(mockEvent)

      expect(mocks.errorResponse).toHaveBeenCalledWith(mockEvent, 'Piattaforma non trovata', 404)
    })

    it('should set publication status to REMOVED', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'EBAY',
      )
      mocks.getOwnedListing.mockResolvedValue(baseListing)

      await removePlatformHandler(mockEvent)

      expect(mockTx.platformPublication.update).toHaveBeenCalledWith({
        where: { id: 'pub-1' },
        data: { status: 'REMOVED' },
      })
    })

    it('should create PLATFORM_REMOVED activity log', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'EBAY',
      )
      mocks.getOwnedListing.mockResolvedValue(baseListing)

      await removePlatformHandler(mockEvent)

      expect(mockTx.activityLog.create).toHaveBeenCalledWith({
        data: {
          listingId: 'listing-1',
          action: 'PLATFORM_REMOVED',
          description: 'Rimosso da EBAY',
          platform: 'EBAY',
        },
      })
    })

    it('should revert listing to DRAFT when all platforms are REMOVED or DRAFT', async () => {
      const listingAllDraft = {
        ...baseListing,
        status: 'ACTIVE',
        platformPublications: [
          { id: 'pub-1', platform: 'EBAY', status: 'PUBLISHED' },
          { id: 'pub-2', platform: 'VINTED', status: 'REMOVED' },
        ],
      }
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'EBAY',
      )
      mocks.getOwnedListing.mockResolvedValue(listingAllDraft)

      await removePlatformHandler(mockEvent)

      // After removing EBAY, only VINTED (REMOVED) remains → all inactive → revert to DRAFT
      expect(mockTx.listing.update).toHaveBeenCalledWith({
        where: { id: 'listing-1' },
        data: { status: 'DRAFT' },
      })
    })

    it('should NOT revert listing when other platforms are still PUBLISHED', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'EBAY',
      )
      // VINTED is still PUBLISHED
      mocks.getOwnedListing.mockResolvedValue(baseListing)

      await removePlatformHandler(mockEvent)

      expect(mockTx.listing.update).not.toHaveBeenCalled()
    })

    it('should return success message', async () => {
      mocks.getRouterParam.mockImplementation((_, key: string) =>
        key === 'id' ? 'listing-1' : 'EBAY',
      )
      mocks.getOwnedListing.mockResolvedValue(baseListing)

      await removePlatformHandler(mockEvent)

      expect(mocks.successResponse).toHaveBeenCalledWith({ message: 'Rimosso da EBAY' })
    })
  })
})
