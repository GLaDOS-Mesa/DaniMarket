import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Nuxt auto-imports (prisma, DEV_USER_ID) as globals
const mockFindUnique = vi.fn()
const mockDEV_USER_ID = vi.fn()

vi.stubGlobal('prisma', {
  listing: { findUnique: mockFindUnique },
})
vi.stubGlobal('DEV_USER_ID', mockDEV_USER_ID)

import { getOwnedListing } from '~/server/utils/listing'

const MOCK_USER_ID = 'user-123'

const mockListing = {
  id: 'listing-1',
  userId: MOCK_USER_ID,
  title: 'Test Listing',
  status: 'DRAFT',
  photos: [
    { id: 'photo-1', order: 0 },
    { id: 'photo-2', order: 1 },
  ],
  platformPublications: [
    { id: 'pub-1', platform: 'EBAY', status: 'DRAFT' },
  ],
  activityLog: [
    { id: 'log-1', action: 'CREATED', createdAt: new Date() },
  ],
}

describe('getOwnedListing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDEV_USER_ID.mockResolvedValue(MOCK_USER_ID)
  })

  it('should return listing when found and owned by current user', async () => {
    mockFindUnique.mockResolvedValue(mockListing)

    const result = await getOwnedListing('listing-1')

    expect(result).toEqual(mockListing)
  })

  it('should return null when listing is not found', async () => {
    mockFindUnique.mockResolvedValue(null)

    const result = await getOwnedListing('nonexistent-id')

    expect(result).toBeNull()
  })

  it('should return null when listing belongs to a different user', async () => {
    mockFindUnique.mockResolvedValue({
      ...mockListing,
      userId: 'other-user-456',
    })

    const result = await getOwnedListing('listing-1')

    expect(result).toBeNull()
  })

  it('should call DEV_USER_ID to get the current user', async () => {
    mockFindUnique.mockResolvedValue(mockListing)

    await getOwnedListing('listing-1')

    expect(mockDEV_USER_ID).toHaveBeenCalledOnce()
  })

  it('should query with the correct listing ID', async () => {
    mockFindUnique.mockResolvedValue(null)

    await getOwnedListing('my-listing-id')

    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'my-listing-id' },
      }),
    )
  })

  it('should include photos ordered by order ascending', async () => {
    mockFindUnique.mockResolvedValue(mockListing)

    await getOwnedListing('listing-1')

    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          photos: { orderBy: { order: 'asc' } },
        }),
      }),
    )
  })

  it('should include platformPublications', async () => {
    mockFindUnique.mockResolvedValue(mockListing)

    await getOwnedListing('listing-1')

    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          platformPublications: true,
        }),
      }),
    )
  })

  it('should include activityLog ordered by createdAt descending', async () => {
    mockFindUnique.mockResolvedValue(mockListing)

    await getOwnedListing('listing-1')

    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          activityLog: { orderBy: { createdAt: 'desc' } },
        }),
      }),
    )
  })
})
