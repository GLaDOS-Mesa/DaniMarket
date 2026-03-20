import { rm } from 'fs/promises'
import { existsSync } from 'fs'
import { withdrawFromEbay } from '~/server/utils/ebay-sync'
import { ebayApiFetch } from '~/server/utils/ebay-api'
import { DEV_USER_ID } from '~/server/utils/auth'

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

    // Remove from eBay before deleting locally
    const ebayPub = listing.platformPublications.find(
      (p) => p.platform === 'EBAY' && p.status === 'PUBLISHED'
    )
    if (ebayPub) {
      try {
        await withdrawFromEbay(id)
        const userId = await DEV_USER_ID()
        const sku = `DM-${id}`
        await ebayApiFetch(userId, `/sell/inventory/v1/inventory_item/${sku}`, {
          method: 'DELETE',
        })
      } catch (e) {
        console.error('Errore rimozione da eBay:', e)
      }
    }

    // Delete photos folder from filesystem
    const uploadDir = getUploadDir(id)
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
