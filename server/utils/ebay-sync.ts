import { ebayApiFetch } from './ebay-api'
import { listingToEbayInventoryItem, listingToEbayOffer, type EbayPolicies } from './ebay-mapping'
import { prisma } from './prisma'
import { DEV_USER_ID } from './auth'

/**
 * Propagates listing changes to eBay.
 * Called after a local update. Does not throw — logs and saves errors to DB.
 */
export async function syncListingToEbay(listingId: string): Promise<void> {
  const userId = await DEV_USER_ID()

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      photos: { orderBy: { order: 'asc' } },
      platformPublications: true,
    },
  })

  if (!listing) return

  const ebayPub = listing.platformPublications.find(
    (p) => p.platform === 'EBAY' && p.status === 'PUBLISHED'
  )

  if (!ebayPub || !ebayPub.platformListingId) return

  const sku = `DM-${listingId}`

  try {
    // Update inventory item
    const inventoryItem = listingToEbayInventoryItem(listing as any)
    await ebayApiFetch(userId, `/sell/inventory/v1/inventory_item/${sku}`, {
      method: 'PUT',
      body: inventoryItem,
    })

    // Update offer (need policies)
    if (ebayPub.platformOfferId) {
      const ebayToken = await prisma.ebayToken.findUnique({ where: { userId } })
      if (!ebayToken?.ebayLocationKey) return

      // Fetch current policies
      const [fulfillment, returns, payment] = await Promise.all([
        ebayApiFetch<{ fulfillmentPolicies?: { fulfillmentPolicyId: string }[] }>(
          userId, '/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_IT'
        ),
        ebayApiFetch<{ returnPolicies?: { returnPolicyId: string }[] }>(
          userId, '/sell/account/v1/return_policy?marketplace_id=EBAY_IT'
        ),
        ebayApiFetch<{ paymentPolicies?: { paymentPolicyId: string }[] }>(
          userId, '/sell/account/v1/payment_policy?marketplace_id=EBAY_IT'
        ),
      ])

      const policies: EbayPolicies = {
        fulfillmentPolicyId: fulfillment.fulfillmentPolicies?.[0]?.fulfillmentPolicyId || '',
        returnPolicyId: returns.returnPolicies?.[0]?.returnPolicyId || '',
        paymentPolicyId: payment.paymentPolicies?.[0]?.paymentPolicyId || '',
      }

      const offer = listingToEbayOffer(listing as any, sku, policies, ebayToken.ebayLocationKey)
      await ebayApiFetch(userId, `/sell/inventory/v1/offer/${ebayPub.platformOfferId}`, {
        method: 'PUT',
        body: offer,
      })
    }

    // Clear any previous error
    await prisma.platformPublication.update({
      where: { id: ebayPub.id },
      data: { lastError: null },
    })

    await prisma.activityLog.create({
      data: {
        listingId,
        action: 'UPDATED',
        description: 'Aggiornamento sincronizzato su eBay',
        platform: 'EBAY',
      },
    })
  } catch (err: any) {
    console.error('eBay sync failed:', err.message)

    await prisma.platformPublication.update({
      where: { id: ebayPub.id },
      data: { lastError: err.message || 'Errore sincronizzazione con eBay' },
    })

    await prisma.activityLog.create({
      data: {
        listingId,
        action: 'UPDATED',
        description: `Aggiornamento su eBay fallito: ${err.message}`,
        platform: 'EBAY',
      },
    })
  }
}

/**
 * Withdraws the eBay offer for a listing.
 * Does not throw — logs errors.
 */
export async function withdrawFromEbay(listingId: string): Promise<void> {
  const userId = await DEV_USER_ID()

  const publication = await prisma.platformPublication.findFirst({
    where: {
      listingId,
      platform: 'EBAY',
      status: 'PUBLISHED',
    },
  })

  if (!publication?.platformOfferId) return

  try {
    await ebayApiFetch(
      userId,
      `/sell/inventory/v1/offer/${publication.platformOfferId}/withdraw`,
      { method: 'POST' }
    )

    await prisma.platformPublication.update({
      where: { id: publication.id },
      data: {
        status: 'REMOVED',
        platformOfferId: null,
        lastError: null,
      },
    })
  } catch (err: any) {
    console.error('eBay withdraw failed:', err.message)
    await prisma.platformPublication.update({
      where: { id: publication.id },
      data: { lastError: err.message || 'Errore ritiro da eBay' },
    })
  }
}

/**
 * Marks a listing as sold on eBay by withdrawing the offer.
 * eBay has no "sold" API concept — the offer is simply ended.
 */
export async function markSoldOnEbay(listingId: string): Promise<void> {
  await withdrawFromEbay(listingId)
}
