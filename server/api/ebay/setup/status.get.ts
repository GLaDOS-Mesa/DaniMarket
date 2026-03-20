import { DEV_USER_ID } from '~/server/utils/auth'
import { ebayApiFetch } from '~/server/utils/ebay-api'

export default defineEventHandler(async (event) => {
  const userId = await DEV_USER_ID()

  const checks: Record<string, { ok: boolean; policyId?: string; merchantLocationKey?: string; error?: string }> = {
    token: { ok: false },
    fulfillmentPolicy: { ok: false },
    returnPolicy: { ok: false },
    paymentPolicy: { ok: false },
    location: { ok: false },
  }

  // Check token
  const ebayToken = await prisma.ebayToken.findUnique({ where: { userId } })
  if (!ebayToken || ebayToken.refreshTokenExpiresAt < new Date()) {
    checks.token = { ok: false, error: 'Token eBay mancante o scaduto' }
    return successResponse({ ready: false, checks })
  }
  checks.token = { ok: true }

  // Check fulfillment policy
  try {
    const fulfillment = await ebayApiFetch<{ fulfillmentPolicies?: { fulfillmentPolicyId: string }[] }>(
      userId,
      '/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_IT'
    )
    if (fulfillment.fulfillmentPolicies?.length) {
      checks.fulfillmentPolicy = { ok: true, policyId: fulfillment.fulfillmentPolicies[0].fulfillmentPolicyId }
    } else {
      checks.fulfillmentPolicy = { ok: false, error: 'Nessuna policy di spedizione configurata' }
    }
  } catch {
    checks.fulfillmentPolicy = { ok: false, error: 'Errore verifica policy spedizione' }
  }

  // Check return policy
  try {
    const returns = await ebayApiFetch<{ returnPolicies?: { returnPolicyId: string }[] }>(
      userId,
      '/sell/account/v1/return_policy?marketplace_id=EBAY_IT'
    )
    if (returns.returnPolicies?.length) {
      checks.returnPolicy = { ok: true, policyId: returns.returnPolicies[0].returnPolicyId }
    } else {
      checks.returnPolicy = { ok: false, error: 'Nessuna policy di reso configurata' }
    }
  } catch {
    checks.returnPolicy = { ok: false, error: 'Errore verifica policy reso' }
  }

  // Check payment policy
  try {
    const payment = await ebayApiFetch<{ paymentPolicies?: { paymentPolicyId: string }[] }>(
      userId,
      '/sell/account/v1/payment_policy?marketplace_id=EBAY_IT'
    )
    if (payment.paymentPolicies?.length) {
      checks.paymentPolicy = { ok: true, policyId: payment.paymentPolicies[0].paymentPolicyId }
    } else {
      checks.paymentPolicy = { ok: false, error: 'Nessuna policy di pagamento configurata' }
    }
  } catch {
    checks.paymentPolicy = { ok: false, error: 'Errore verifica policy pagamento' }
  }

  // Check inventory location
  try {
    if (ebayToken.ebayLocationKey) {
      checks.location = { ok: true, merchantLocationKey: ebayToken.ebayLocationKey }
    } else {
      const locations = await ebayApiFetch<{ locations?: { merchantLocationKey: string }[] }>(
        userId,
        '/sell/inventory/v1/location'
      )
      if (locations.locations?.length) {
        const key = locations.locations[0].merchantLocationKey
        // Save for future use
        await prisma.ebayToken.update({
          where: { userId },
          data: { ebayLocationKey: key },
        })
        checks.location = { ok: true, merchantLocationKey: key }
      } else {
        checks.location = { ok: false, error: 'Nessuna location configurata' }
      }
    }
  } catch {
    checks.location = { ok: false, error: 'Errore verifica location' }
  }

  const ready = Object.values(checks).every((c) => c.ok)
  return successResponse({ ready, checks })
})
