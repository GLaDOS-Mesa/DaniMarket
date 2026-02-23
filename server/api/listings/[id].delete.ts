import { rm } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

defineRouteMeta({
  openAPI: {
    tags: ['Listings'],
    summary: 'Elimina annuncio',
    description: 'Elimina un annuncio e le sue foto dal filesystem',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID annuncio' },
    ],
    responses: {
      200: { description: 'Annuncio eliminato' },
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

    // Delete photos folder from filesystem
    const uploadDir = join(process.cwd(), 'uploads', 'listings', id)
    if (existsSync(uploadDir)) {
      await rm(uploadDir, { recursive: true })
    }

    // Delete listing (cascades to relations)
    await prisma.listing.delete({ where: { id } })

    return successResponse({ message: 'Annuncio eliminato' })
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nell\'eliminazione dell\'annuncio', 500)
  }
})
