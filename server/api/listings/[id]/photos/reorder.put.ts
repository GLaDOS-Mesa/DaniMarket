defineRouteMeta({
  openAPI: {
    tags: ['Photos'],
    summary: 'Riordina foto',
    description: 'Reorder photos by providing an array of photo IDs in the desired order',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Listing ID' },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['photoIds'],
            properties: {
              photoIds: { type: 'array', items: { type: 'string' } },
            },
          },
          example: { photoIds: ['id3', 'id1', 'id2'] },
        },
      },
    },
    responses: {
      200: { description: 'Photos reordered' },
      400: { description: 'Validation error' },
      404: { description: 'Listing not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  try {
    const userId = await DEV_USER_ID()
    const id = getRouterParam(event, 'id')

    if (!id) {
      return errorResponse(event, 'ID annuncio mancante', 400)
    }

    // Verify listing ownership
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing || listing.userId !== userId) {
      return errorResponse(event, 'Annuncio non trovato', 404)
    }

    const body = await readBody(event)
    const photoIds: string[] = body?.photoIds

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return errorResponse(event, 'photoIds deve essere un array non vuoto', 400)
    }

    // Verify all IDs belong to this listing
    const existingPhotos = await prisma.listingPhoto.findMany({
      where: { listingId: id },
      select: { id: true },
    })

    const existingIds = new Set(existingPhotos.map((p) => p.id))

    if (photoIds.length !== existingIds.size) {
      return errorResponse(event, `Numero di foto non corrispondente: inviati ${photoIds.length}, esistenti ${existingIds.size}`, 400)
    }

    for (const photoId of photoIds) {
      if (!existingIds.has(photoId)) {
        return errorResponse(event, `Foto non trovata: ${photoId}`, 400)
      }
    }

    // Update order in transaction
    await prisma.$transaction(
      photoIds.map((photoId, index) =>
        prisma.listingPhoto.update({
          where: { id: photoId },
          data: { order: index },
        }),
      ),
    )

    // Return reordered photos
    const reordered = await prisma.listingPhoto.findMany({
      where: { listingId: id },
      orderBy: { order: 'asc' },
    })

    return successResponse(reordered)
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nel riordino delle foto', 500)
  }
})
