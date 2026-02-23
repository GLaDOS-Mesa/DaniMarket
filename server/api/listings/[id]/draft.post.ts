defineRouteMeta({
  openAPI: {
    tags: ['Listing Actions'],
    summary: 'Riporta in bozza',
    description: 'Revert a listing to DRAFT status',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Listing ID' },
    ],
    responses: {
      200: { description: 'Listing reverted to draft' },
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

    const updated = await prisma.$transaction(async (tx) => {
      await tx.listing.update({
        where: { id },
        data: { status: 'DRAFT' },
      })

      await tx.activityLog.create({
        data: {
          listingId: id,
          action: 'DRAFTED',
          description: 'Salvato come bozza',
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
    return errorResponse(event, error.message || 'Errore nel salvataggio come bozza', 500)
  }
})
