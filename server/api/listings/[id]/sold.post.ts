defineRouteMeta({
  openAPI: {
    tags: ['Listing Actions'],
    summary: 'Segna come venduto',
    description: 'Mark a listing as SOLD, optionally specifying the platform',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Listing ID' },
    ],
    requestBody: {
      required: false,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              platform: { type: 'string', enum: ['EBAY', 'VINTED', 'SUBITO', 'FACEBOOK'] },
            },
          },
          example: { platform: 'EBAY' },
        },
      },
    },
    responses: {
      200: { description: 'Listing marked as sold' },
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

    const body = await readBody(event).catch(() => null)
    const platform = body?.platform || null

    const updated = await prisma.$transaction(async (tx) => {
      await tx.listing.update({
        where: { id },
        data: { status: 'SOLD' },
      })

      await tx.activityLog.create({
        data: {
          listingId: id,
          action: 'SOLD',
          description: platform
            ? `Venduto tramite ${platform}`
            : 'Segnato come venduto',
          platform: platform || undefined,
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
    return errorResponse(event, error.message || 'Errore nel segnare come venduto', 500)
  }
})
