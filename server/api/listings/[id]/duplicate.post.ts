defineRouteMeta({
  openAPI: {
    tags: ['Listing Actions'],
    summary: 'Duplica annuncio',
    description: 'Duplicate a listing as a new DRAFT without photos or platform publications',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Source listing ID' },
    ],
    responses: {
      201: { description: 'New duplicated listing in DRAFT status' },
      404: { description: 'Source listing not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      return errorResponse(event, 'ID annuncio mancante', 400)
    }

    const source = await getOwnedListing(id)
    if (!source) {
      return errorResponse(event, 'Annuncio non trovato', 404)
    }

    const newListing = await prisma.$transaction(async (tx) => {
      // Create new listing copying fields from source
      const created = await tx.listing.create({
        data: {
          userId: source.userId,
          title: `Copia di — ${source.title}`,
          description: source.description,
          price: source.price,
          category: source.category,
          condition: source.condition,
          brand: source.brand,
          size: source.size,
          colors: source.colors,
          material: source.material,
          city: source.city,
          province: source.province,
          shippingAvailable: source.shippingAvailable,
          packageSize: source.packageSize,
          shippingCost: source.shippingCost,
          status: 'DRAFT',
        },
      })

      // Activity log on the new listing
      await tx.activityLog.create({
        data: {
          listingId: created.id,
          action: 'CREATED',
          description: `Duplicato da ${source.title}`,
          metadata: { duplicatedFrom: id },
        },
      })

      return tx.listing.findUnique({
        where: { id: created.id },
        include: {
          photos: { orderBy: { order: 'asc' } },
          platformPublications: true,
          activityLog: { orderBy: { createdAt: 'desc' } },
        },
      })
    })

    return successResponse(newListing, 201)
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nella duplicazione dell\'annuncio', 500)
  }
})
