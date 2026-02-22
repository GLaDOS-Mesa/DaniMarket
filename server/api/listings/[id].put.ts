const VALID_CATEGORIES = [
  'CLOTHING', 'SHOES', 'ACCESSORIES', 'ELECTRONICS',
  'HOME', 'SPORTS', 'BOOKS_MEDIA', 'GAMES', 'OTHER',
]

const VALID_CONDITIONS = [
  'NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'LIKE_NEW',
  'GOOD', 'FAIR', 'DAMAGED',
]

const VALID_PACKAGE_SIZES = ['SMALL', 'MEDIUM', 'LARGE']

// Fields not editable via PUT
const READONLY_FIELDS = ['id', 'userId', 'createdAt', 'updatedAt', 'status']

// Editable fields with Italian labels for activity log
const FIELD_LABELS: Record<string, string> = {
  title: 'titolo',
  description: 'descrizione',
  price: 'prezzo',
  category: 'categoria',
  condition: 'condizioni',
  brand: 'marca',
  size: 'taglia',
  colors: 'colori',
  material: 'materiale',
  city: 'comune',
  province: 'provincia',
  shippingAvailable: 'spedizione disponibile',
  packageSize: 'dimensione pacco',
  shippingCost: 'costo spedizione',
}

function valuesAreEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null && b == null) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, i) => item === b[i])
  }
  return String(a) === String(b)
}

defineRouteMeta({
  openAPI: {
    tags: ['Listings'],
    summary: 'Aggiorna annuncio',
    description: 'Update parziale: invia solo i campi da modificare',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID annuncio' },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
              category: { type: 'string' },
              condition: { type: 'string' },
              city: { type: 'string' },
              province: { type: 'string' },
              brand: { type: 'string' },
              size: { type: 'string' },
              colors: { type: 'array', items: { type: 'string' } },
              material: { type: 'string' },
              shippingAvailable: { type: 'boolean' },
              packageSize: { type: 'string', enum: ['SMALL', 'MEDIUM', 'LARGE'] },
              shippingCost: { type: 'number' },
            },
          },
          example: { title: 'Titolo aggiornato', price: 30.0 },
        },
      },
    },
    responses: {
      200: { description: 'Annuncio aggiornato con activity log' },
      400: { description: 'Errore di validazione' },
      404: { description: 'Annuncio non trovato' },
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

    const body = await readBody(event)

    // Block readonly fields
    for (const field of READONLY_FIELDS) {
      if (field in body) {
        return errorResponse(event, `Il campo '${field}' non può essere modificato`, 400)
      }
    }

    // Conditional validation (only if field is present)
    if (body.title !== undefined) {
      if (!body.title?.trim()) return errorResponse(event, 'Il titolo non può essere vuoto', 400)
      if (body.title.length > 100) return errorResponse(event, 'Il titolo non può superare 100 caratteri', 400)
    }

    if (body.description !== undefined) {
      if (!body.description?.trim()) return errorResponse(event, 'La descrizione non può essere vuota', 400)
      if (body.description.length > 2000) return errorResponse(event, 'La descrizione non può superare 2000 caratteri', 400)
    }

    if (body.price !== undefined && (body.price === null || body.price <= 0)) {
      return errorResponse(event, 'Il prezzo deve essere un numero positivo', 400)
    }

    if (body.category !== undefined && !VALID_CATEGORIES.includes(body.category)) {
      return errorResponse(event, 'Categoria non valida', 400)
    }

    if (body.condition !== undefined && !VALID_CONDITIONS.includes(body.condition)) {
      return errorResponse(event, 'Condizione non valida', 400)
    }

    if (body.city !== undefined && !body.city?.trim()) {
      return errorResponse(event, 'Il comune non può essere vuoto', 400)
    }

    if (body.province !== undefined && (!body.province?.trim() || body.province.trim().length !== 2)) {
      return errorResponse(event, 'La provincia deve essere una sigla di 2 lettere', 400)
    }

    if (body.packageSize !== undefined && body.packageSize !== null && !VALID_PACKAGE_SIZES.includes(body.packageSize)) {
      return errorResponse(event, 'Dimensione pacco non valida', 400)
    }

    // Transaction: read, compare, update, log
    const listing = await prisma.$transaction(async (tx) => {
      const current = await tx.listing.findUnique({ where: { id } })

      if (!current || current.userId !== userId) {
        throw new Error('NOT_FOUND')
      }

      // Build update data and track changes
      const updateData: Record<string, any> = {}
      const changedFields: Record<string, { from: unknown; to: unknown }> = {}

      for (const [field, label] of Object.entries(FIELD_LABELS)) {
        if (!(field in body)) continue

        let newValue = body[field]
        if (typeof newValue === 'string') newValue = newValue.trim()
        if (field === 'province' && typeof newValue === 'string') newValue = newValue.toUpperCase()

        const oldValue = (current as any)[field]

        if (!valuesAreEqual(oldValue, newValue)) {
          updateData[field] = newValue
          changedFields[field] = { from: oldValue, to: newValue }
        }
      }

      if (Object.keys(updateData).length === 0) {
        // No actual changes, return current listing
        return tx.listing.findUnique({
          where: { id },
          include: {
            photos: { orderBy: { order: 'asc' } },
            platformPublications: true,
            activityLog: { orderBy: { createdAt: 'desc' } },
          },
        })
      }

      await tx.listing.update({ where: { id }, data: updateData })

      // Activity log with changed fields detail
      const changedLabels = Object.keys(changedFields).map((f) => FIELD_LABELS[f])
      await tx.activityLog.create({
        data: {
          listingId: id,
          action: 'UPDATED',
          description: `Aggiornati: ${changedLabels.join(', ')}`,
          metadata: { changedFields },
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

    return successResponse(listing)
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return errorResponse(event, 'Annuncio non trovato', 404)
    }
    return errorResponse(event, error.message || 'Errore nell\'aggiornamento dell\'annuncio', 500)
  }
})
