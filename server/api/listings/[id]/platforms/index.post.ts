const VALID_PLATFORMS = ['EBAY', 'VINTED', 'SUBITO', 'FACEBOOK']

defineRouteMeta({
  openAPI: {
    tags: ['Platform Actions'],
    summary: 'Aggiungi piattaforma',
    description: 'Add a platform publication to a listing',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Listing ID' },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['platform'],
            properties: {
              platform: { type: 'string', enum: ['EBAY', 'VINTED', 'SUBITO', 'FACEBOOK'] },
            },
          },
          example: { platform: 'SUBITO' },
        },
      },
    },
    responses: {
      201: { description: 'Platform publication created' },
      400: { description: 'Invalid platform or already added' },
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

    const body = await readBody(event)
    const platform = body?.platform

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return errorResponse(event, 'Piattaforma non valida', 400)
    }

    // Check if platform already exists
    const alreadyAdded = listing.platformPublications.some(
      (p) => p.platform === platform,
    )
    if (alreadyAdded) {
      return errorResponse(event, 'Piattaforma già aggiunta', 400)
    }

    const publication = await prisma.$transaction(async (tx) => {
      const created = await tx.platformPublication.create({
        data: {
          listingId: id,
          platform,
          status: 'DRAFT',
        },
      })

      await tx.activityLog.create({
        data: {
          listingId: id,
          action: 'PLATFORM_ADDED',
          description: `Piattaforma ${platform} aggiunta`,
          platform,
        },
      })

      return created
    })

    return successResponse(publication, 201)
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nell\'aggiunta della piattaforma', 500)
  }
})
