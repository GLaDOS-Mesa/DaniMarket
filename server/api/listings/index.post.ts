const VALID_CATEGORIES = [
  'CLOTHING', 'SHOES', 'ACCESSORIES', 'ELECTRONICS',
  'HOME', 'SPORTS', 'BOOKS_MEDIA', 'GAMES', 'OTHER',
]

const VALID_CONDITIONS = [
  'NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'LIKE_NEW',
  'GOOD', 'FAIR', 'DAMAGED',
]

const VALID_PLATFORMS = ['EBAY', 'VINTED', 'SUBITO', 'FACEBOOK']

const VALID_PACKAGE_SIZES = ['SMALL', 'MEDIUM', 'LARGE']

defineRouteMeta({
  openAPI: {
    tags: ['Listings'],
    summary: 'Crea annuncio',
    description: 'Crea un nuovo annuncio in stato DRAFT',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['title', 'description', 'price', 'category', 'condition', 'city', 'province'],
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
              category: { type: 'string', enum: ['CLOTHING', 'SHOES', 'ACCESSORIES', 'ELECTRONICS', 'HOME', 'SPORTS', 'BOOKS_MEDIA', 'GAMES', 'OTHER'] },
              condition: { type: 'string', enum: ['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'LIKE_NEW', 'GOOD', 'FAIR', 'DAMAGED'] },
              city: { type: 'string' },
              province: { type: 'string' },
              brand: { type: 'string' },
              size: { type: 'string' },
              colors: { type: 'array', items: { type: 'string' } },
              material: { type: 'string' },
              shippingAvailable: { type: 'boolean' },
              packageSize: { type: 'string', enum: ['SMALL', 'MEDIUM', 'LARGE'] },
              shippingCost: { type: 'number' },
              platforms: { type: 'array', items: { type: 'string', enum: ['EBAY', 'VINTED', 'SUBITO', 'FACEBOOK'] } },
            },
          },
          example: {
            title: 'Test annuncio',
            description: 'Descrizione di test',
            price: 25.0,
            category: 'OTHER',
            condition: 'GOOD',
            city: 'Bologna',
            province: 'BO',
            platforms: ['EBAY'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Annuncio creato (DRAFT) con relazioni' },
      400: { description: 'Errore di validazione' },
    },
  },
})

export default defineEventHandler(async (event) => {
  try {
    const userId = await DEV_USER_ID()
    const body = await readBody(event)

    // Validate required fields
    const errors: string[] = []

    if (!body.title?.trim()) {
      errors.push('Il titolo è obbligatorio')
    } else if (body.title.length > 100) {
      errors.push('Il titolo non può superare 100 caratteri')
    }

    if (!body.description?.trim()) {
      errors.push('La descrizione è obbligatoria')
    } else if (body.description.length > 2000) {
      errors.push('La descrizione non può superare 2000 caratteri')
    }

    if (body.price === undefined || body.price === null || body.price <= 0) {
      errors.push('Il prezzo deve essere un numero positivo')
    }

    if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
      errors.push('Categoria non valida')
    }

    if (!body.condition || !VALID_CONDITIONS.includes(body.condition)) {
      errors.push('Condizione non valida')
    }

    if (!body.city?.trim()) {
      errors.push('Il comune è obbligatorio')
    }

    if (!body.province?.trim() || body.province.trim().length !== 2) {
      errors.push('La provincia è obbligatoria (sigla 2 lettere)')
    }

    if (errors.length > 0) {
      return errorResponse(event, errors.join('; '), 400)
    }

    // Validate optional fields
    const platforms: string[] = body.platforms ?? []
    for (const p of platforms) {
      if (!VALID_PLATFORMS.includes(p)) {
        return errorResponse(event, `Piattaforma non valida: ${p}`, 400)
      }
    }

    if (body.packageSize && !VALID_PACKAGE_SIZES.includes(body.packageSize)) {
      return errorResponse(event, 'Dimensione pacco non valida', 400)
    }

    // Transaction: create listing + publications + activity log
    const listing = await prisma.$transaction(async (tx) => {
      const created = await tx.listing.create({
        data: {
          userId,
          status: 'DRAFT',
          title: body.title.trim(),
          description: body.description.trim(),
          price: body.price,
          category: body.category,
          condition: body.condition,
          city: body.city.trim(),
          province: body.province.trim().toUpperCase(),
          brand: body.brand?.trim() || null,
          size: body.size?.trim() || null,
          colors: body.colors ?? [],
          material: body.material?.trim() || null,
          shippingAvailable: body.shippingAvailable ?? true,
          packageSize: body.packageSize || null,
          shippingCost: body.shippingCost ?? null,
        },
      })

      // Create PlatformPublication for each platform
      for (const platform of platforms) {
        await tx.platformPublication.create({
          data: {
            listingId: created.id,
            platform: platform as any,
            status: 'DRAFT',
          },
        })
      }

      // Create ActivityLog
      await tx.activityLog.create({
        data: {
          listingId: created.id,
          action: 'CREATED',
          description: 'Annuncio creato',
        },
      })

      // Return with relations
      return tx.listing.findUnique({
        where: { id: created.id },
        include: {
          photos: { orderBy: { order: 'asc' } },
          platformPublications: true,
          activityLog: { orderBy: { createdAt: 'desc' } },
        },
      })
    })

    return successResponse(listing, 201)
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nella creazione dell\'annuncio', 500)
  }
})
