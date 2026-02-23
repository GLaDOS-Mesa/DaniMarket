/**
 * Verify that a listing exists and belongs to the current user.
 * Returns the listing with relations or null if not found/not owned.
 */
export async function getOwnedListing(listingId: string) {
  const userId = await DEV_USER_ID()
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      photos: { orderBy: { order: 'asc' } },
      platformPublications: true,
      activityLog: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!listing || listing.userId !== userId) {
    return null
  }

  return listing
}
