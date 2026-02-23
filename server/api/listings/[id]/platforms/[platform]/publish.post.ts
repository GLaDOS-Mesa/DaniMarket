const VALID_PLATFORMS = ['EBAY', 'VINTED', 'SUBITO', 'FACEBOOK']

defineRouteMeta({
  openAPI: {
    tags: ['Platform Actions'],
    summary: 'Pubblica su singola piattaforma',
    description: 'Publish a listing on a specific platform',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Listing ID' },
      { name: 'platform', in: 'path', required: true, schema: { type: 'string', enum: ['EBAY', 'VINTED', 'SUBITO', 'FACEBOOK'] }, description: 'Platform name' },
    ],
    responses: {
      200: { description: 'Platform publication updated to PUBLISHED' },
      400: { description: 'Already published or invalid platform' },
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

    // Check publication is not already PUBLISHED
    if (publication.status === 'PUBLISHED') {
      return errorResponse(event, 'Piattaforma già pubblicata', 400)
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedPub = await tx.platformPublication.update({
        where: { id: publication.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          lastError: null,
        },
      })

      // If listing is DRAFT, promote to ACTIVE
      if (listing.status === 'DRAFT') {
        await tx.listing.update({
          where: { id },
          data: { status: 'ACTIVE' },
        })
      }

      await tx.activityLog.create({
        data: {
          listingId: id,
          action: 'PUBLISHED',
          description: `Pubblicato su ${platform}`,
          platform,
        },
      })

      return updatedPub
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nella pubblicazione della piattaforma', 500)
  }
})
