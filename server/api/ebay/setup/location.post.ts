import { DEV_USER_ID } from '~/server/utils/auth'
import { ebayApiFetch } from '~/server/utils/ebay-api'

export default defineEventHandler(async (event) => {
  const userId = await DEV_USER_ID()

  const ebayToken = await prisma.ebayToken.findUnique({ where: { userId } })
  if (!ebayToken) {
    return errorResponse(event, 'Account eBay non collegato', 400)
  }

  if (ebayToken.ebayLocationKey) {
    return successResponse({ merchantLocationKey: ebayToken.ebayLocationKey })
  }

  const locationKey = 'danimarket-default'

  try {
    await ebayApiFetch(
      userId,
      `/sell/inventory/v1/location/${locationKey}`,
      {
        method: 'PUT',
        body: {
          location: {
            address: {
              city: 'Bologna',
              stateOrProvince: 'BO',
              postalCode: '40100',
              country: 'IT',
            },
          },
          name: 'DaniMarket Default',
          merchantLocationStatus: 'ENABLED',
          locationTypes: ['WAREHOUSE'],
        },
      }
    )
  } catch (err: any) {
    // eBay returns 409 if location already exists — that's fine
    if (err?.statusCode !== 409) {
      return errorResponse(event, err?.message || 'Errore creazione location su eBay', 500)
    }
  }

  // Save location key
  await prisma.ebayToken.update({
    where: { userId },
    data: { ebayLocationKey: locationKey },
  })

  return successResponse({ merchantLocationKey: locationKey })
})
