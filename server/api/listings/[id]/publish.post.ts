defineRouteMeta({
  openAPI: {
    tags: ['Listing Actions'],
    summary: 'Pubblica annuncio',
    description: 'Publish a listing: sets status to ACTIVE and publications to PUBLISHED',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Listing ID' },
    ],
    responses: {
      200: { description: 'Listing published with updated publications' },
      400: { description: 'Missing platforms or photos' },
      404: { description: 'Listing not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      return errorResponse(event, 'ID annuncio mancante', 400)
    }

    const listing = await getOwnedListing(id)
    if (!listing) {
      return errorResponse(event, 'Annuncio non trovato', 404)
    }

    // Verify at least one platform publication exists
    if (!listing.platformPublications || listing.platformPublications.length === 0) {
      return errorResponse(event, 'Seleziona almeno una piattaforma', 400)
    }

    // Verify at least one photo exists
    if (!listing.photos || listing.photos.length === 0) {
      return errorResponse(event, 'Aggiungi almeno una foto', 400)
    }

    // Get platforms being published (DRAFT or ERROR)
    const publishablePubs = listing.platformPublications.filter(
      (p) => p.status === 'DRAFT' || p.status === 'ERROR',
    )
    const platformNames = publishablePubs.map((p) => p.platform)

    const updated = await prisma.$transaction(async (tx) => {
      // Set listing status to ACTIVE
      await tx.listing.update({
        where: { id },
        data: { status: 'ACTIVE' },
      })

      // Update DRAFT/ERROR publications to PUBLISHED
      if (publishablePubs.length > 0) {
        await tx.platformPublication.updateMany({
          where: {
            listingId: id,
            status: { in: ['DRAFT', 'ERROR'] },
          },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          },
        })
      }

      // Create activity log
      const allPlatforms = listing.platformPublications.map((p) => p.platform)
      await tx.activityLog.create({
        data: {
          listingId: id,
          action: 'PUBLISHED',
          description: `Pubblicato su ${allPlatforms.join(', ')}`,
          metadata: { platforms: allPlatforms },
        },
      })

      return tx.listing.findUnique({
        where: { id },
        include: {
          photos: { orderBy: { order: 'asc' } },
          platformPublications: true,
          activityLog: { orderBy: { createdAt: 'desc' } },
        },
      })
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nella pubblicazione dell\'annuncio', 500)
  }
})
