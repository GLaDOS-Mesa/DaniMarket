import { syncListingToEbay } from '~/server/utils/ebay-sync'

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

    const ebayPub = listing.platformPublications.find(
      (p) => p.platform === 'EBAY' && p.status === 'PUBLISHED'
    )
    if (!ebayPub) {
      return errorResponse(event, 'Annuncio non pubblicato su eBay', 400)
    }

    await syncListingToEbay(id)

    // Return updated publication
    const updated = await prisma.platformPublication.findUnique({
      where: { id: ebayPub.id },
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore sincronizzazione', 500)
  }
})
