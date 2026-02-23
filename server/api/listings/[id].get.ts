defineRouteMeta({
  openAPI: {
    tags: ['Listings'],
    summary: 'Dettaglio annuncio',
    description: 'Recupera un annuncio per ID con photos, publications e activityLog',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID annuncio' },
    ],
    responses: {
      200: { description: 'Annuncio con photos, publications, activityLog' },
      404: { description: 'Annuncio non trovato' },
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

    return successResponse(listing)
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nel recupero dell\'annuncio', 500)
  }
})
