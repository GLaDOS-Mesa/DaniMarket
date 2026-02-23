const VALID_PLATFORMS = ['EBAY', 'VINTED', 'SUBITO', 'FACEBOOK']

defineRouteMeta({
  openAPI: {
    tags: ['Platform Actions'],
    summary: 'Rimuovi da piattaforma',
    description: 'Remove a listing from a specific platform (sets status to REMOVED)',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Listing ID' },
      { name: 'platform', in: 'path', required: true, schema: { type: 'string', enum: ['EBAY', 'VINTED', 'SUBITO', 'FACEBOOK'] }, description: 'Platform name' },
    ],
    responses: {
      200: { description: 'Platform publication removed' },
      404: { description: 'Listing or platform publication not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const platform = getRouterParam(event, 'platform')

    if (!id || !platform) {
      return errorResponse(event, 'ID annuncio o piattaforma mancante', 400)
    }

    if (!VALID_PLATFORMS.includes(platform)) {
      return errorResponse(event, 'Piattaforma non valida', 400)
    }

    const listing = await getOwnedListing(id)
    if (!listing) {
      return errorResponse(event, 'Annuncio non trovato', 404)
    }

    // Find the platform publication
    const publication = listing.platformPublications.find(
      (p) => p.platform === platform,
    )
    if (!publication) {
      return errorResponse(event, 'Piattaforma non trovata', 404)
    }

    await prisma.$transaction(async (tx) => {
      await tx.platformPublication.update({
        where: { id: publication.id },
        data: { status: 'REMOVED' },
      })

      await tx.activityLog.create({
        data: {
          listingId: id,
          action: 'PLATFORM_REMOVED',
          description: `Rimosso da ${platform}`,
          platform,
        },
      })

      // If all platforms are now REMOVED or DRAFT, revert listing to DRAFT
      const otherPubs = listing.platformPublications.filter(
        (p) => p.platform !== platform,
      )
      const allInactive = otherPubs.every(
        (p) => p.status === 'REMOVED' || p.status === 'DRAFT',
      )
      if (allInactive) {
        await tx.listing.update({
          where: { id },
          data: { status: 'DRAFT' },
        })
      }
    })

    return successResponse({ message: `Rimosso da ${platform}` })
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nella rimozione dalla piattaforma', 500)
  }
})
