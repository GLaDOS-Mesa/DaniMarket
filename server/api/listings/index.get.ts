defineRouteMeta({
  openAPI: {
    tags: ['Listings'],
    summary: 'Lista annunci',
    description: 'Recupera tutti gli annunci con filtri opzionali',
    parameters: [
      { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'SOLD', 'ARCHIVED'] }, description: 'Filtra per stato' },
      { name: 'category', in: 'query', schema: { type: 'string', enum: ['CLOTHING', 'SHOES', 'ACCESSORIES', 'ELECTRONICS', 'HOME', 'SPORTS', 'BOOKS_MEDIA', 'GAMES', 'OTHER'] }, description: 'Filtra per categoria' },
      { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Ricerca nel titolo (case-insensitive)' },
    ],
    responses: {
      200: { description: 'Lista annunci con coverPhoto e platforms' },
    },
  },
})

export default defineEventHandler(async (event) => {
  try {
    const userId = await DEV_USER_ID()
    const query = getQuery(event)

    const where: any = { userId }

    if (query.status) {
      where.status = String(query.status)
    }

    if (query.category) {
      where.category = String(query.category)
    }

    if (query.search) {
      where.title = { contains: String(query.search), mode: 'insensitive' }
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        photos: {
          where: { order: 0 },
          take: 1,
        },
        platformPublications: {
          select: { platform: true, status: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const data = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      status: listing.status,
      category: listing.category,
      condition: listing.condition,
      coverPhoto: listing.photos[0]?.url ?? null,
      platforms: listing.platformPublications.map((p) => ({
        platform: p.platform,
        status: p.status,
      })),
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    }))

    return successResponse(data)
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nel recupero degli annunci', 500)
  }
})
