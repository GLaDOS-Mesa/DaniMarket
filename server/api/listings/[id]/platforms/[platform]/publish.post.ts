import { DEV_USER_ID } from '~/server/utils/auth'
import { ebayApiFetch } from '~/server/utils/ebay-api'
import { listingToEbayInventoryItem, listingToEbayOffer, type EbayPolicies } from '~/server/utils/ebay-mapping'

const VALID_PLATFORMS = ['EBAY', 'VINTED', 'SUBITO', 'FACEBOOK']

defineRouteMeta({
  openAPI: {
    tags: ['Platform Actions'],
    summary: 'Pubblica su singola piattaforma',
    description: 'Publish a listing on a specific platform',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Listing ID' },
      { name: 'platform', in: 'path', required: true, schema: { type: 'string', enum: ['EBAY', 'VINTED', 'SUBITO', 'FACEBOOK'] }, description: 'Platform name' },
    ],
    responses: {
      200: { description: 'Platform publication updated to PUBLISHED' },
      400: { description: 'Already published or invalid platform' },
      404: { description: 'Listing or platform publication not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const platform = getRouterParam(event, 'platform')

    if (!id || !platform) {
      return errorResponse(event, 'ID annuncio o piattaforma mancante', 400)
    }

    if (!VALID_PLATFORMS.includes(platform)) {
      return errorResponse(event, 'Piattaforma non valida', 400)
    }

    const listing = await getOwnedListing(id)
    if (!listing) {
      return errorResponse(event, 'Annuncio non trovato', 404)
    }

    // Find the platform publication
    const publication = listing.platformPublications.find(
      (p) => p.platform === platform,
    )
    if (!publication) {
      return errorResponse(event, 'Piattaforma non trovata', 404)
    }

    // Check publication is not already PUBLISHED
    if (publication.status === 'PUBLISHED') {
      return errorResponse(event, 'Piattaforma già pubblicata', 400)
    }

    // eBay: real publishing via Inventory API
    if (platform === 'EBAY') {
      const userId = await DEV_USER_ID()
      const ebayToken = await prisma.ebayToken.findUnique({ where: { userId } })

      if (!ebayToken) {
        return errorResponse(event, 'Account eBay non collegato', 400)
      }

      try {
        // 1. Check setup status
        const setupStatus = await ebayApiFetch<{ fulfillmentPolicies?: { fulfillmentPolicyId: string }[] }>(
          userId,
          '/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_IT'
        )
        const returnStatus = await ebayApiFetch<{ returnPolicies?: { returnPolicyId: string }[] }>(
          userId,
          '/sell/account/v1/return_policy?marketplace_id=EBAY_IT'
        )
        const paymentStatus = await ebayApiFetch<{ paymentPolicies?: { paymentPolicyId: string }[] }>(
          userId,
          '/sell/account/v1/payment_policy?marketplace_id=EBAY_IT'
        )

        const policies: EbayPolicies = {
          fulfillmentPolicyId: setupStatus.fulfillmentPolicies?.[0]?.fulfillmentPolicyId || '',
          returnPolicyId: returnStatus.returnPolicies?.[0]?.returnPolicyId || '',
          paymentPolicyId: paymentStatus.paymentPolicies?.[0]?.paymentPolicyId || '',
        }

        if (!policies.fulfillmentPolicyId || !policies.returnPolicyId || !policies.paymentPolicyId) {
          return errorResponse(event, 'Business policies eBay non configurate. Configura spedizione, reso e pagamento su eBay.', 400)
        }

        const locationKey = ebayToken.ebayLocationKey
        if (!locationKey) {
          return errorResponse(event, 'Location eBay non configurata. Crea una location dalle Impostazioni.', 400)
        }

        // 2. Create/replace inventory item
        const sku = `DM-${id}`
        const inventoryItem = listingToEbayInventoryItem(listing)
        await ebayApiFetch(userId, `/sell/inventory/v1/inventory_item/${sku}`, {
          method: 'PUT',
          body: inventoryItem,
        })

        // 3. Create offer
        const offer = listingToEbayOffer(listing, sku, policies, locationKey)
        const offerResponse = await ebayApiFetch<{ offerId: string }>(
          userId,
          '/sell/inventory/v1/offer',
          { method: 'POST', body: offer }
        )

        // 4. Publish offer
        const publishResponse = await ebayApiFetch<{ listingId: string }>(
          userId,
          `/sell/inventory/v1/offer/${offerResponse.offerId}/publish`,
          { method: 'POST' }
        )

        // 5. Build listing URL
        const config = useRuntimeConfig()
        const isSandbox = config.ebayEnv === 'sandbox'
        const ebayListingUrl = isSandbox
          ? `https://www.sandbox.ebay.it/itm/${publishResponse.listingId}`
          : `https://www.ebay.it/itm/${publishResponse.listingId}`

        // 6. Update database
        const updated = await prisma.$transaction(async (tx) => {
          const updatedPub = await tx.platformPublication.update({
            where: { id: publication.id },
            data: {
              status: 'PUBLISHED',
              publishedAt: new Date(),
              lastError: null,
              platformListingId: publishResponse.listingId,
              platformListingUrl: ebayListingUrl,
              platformOfferId: offerResponse.offerId,
            },
          })

          if (listing.status === 'DRAFT') {
            await tx.listing.update({
              where: { id },
              data: { status: 'ACTIVE' },
            })
          }

          await tx.activityLog.create({
            data: {
              listingId: id,
              action: 'PUBLISHED',
              description: `Pubblicato su eBay`,
              platform: 'EBAY',
            },
          })

          return updatedPub
        })

        return successResponse(updated)
      } catch (ebayError: any) {
        // Save error to publication
        await prisma.platformPublication.update({
          where: { id: publication.id },
          data: {
            status: 'ERROR',
            lastError: ebayError.message || 'Errore durante la pubblicazione su eBay',
          },
        })

        await prisma.activityLog.create({
          data: {
            listingId: id,
            action: 'PUBLISHED',
            description: `Errore pubblicazione su eBay: ${ebayError.message}`,
            platform: 'EBAY',
          },
        })

        return errorResponse(event, ebayError.message || 'Errore pubblicazione su eBay', 500)
      }
    }

    // Other platforms: local status change only
    const updated = await prisma.$transaction(async (tx) => {
      const updatedPub = await tx.platformPublication.update({
        where: { id: publication.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          lastError: null,
        },
      })

      if (listing.status === 'DRAFT') {
        await tx.listing.update({
          where: { id },
          data: { status: 'ACTIVE' },
        })
      }

      await tx.activityLog.create({
        data: {
          listingId: id,
          action: 'PUBLISHED',
          description: `Pubblicato su ${platform}`,
          platform,
        },
      })

      return updatedPub
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nella pubblicazione della piattaforma', 500)
  }
})
