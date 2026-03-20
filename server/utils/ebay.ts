import { prisma } from './prisma'

type EbayTokenResponse = {
  accessToken: string
  expiresIn: number
  refreshToken?: string
  refreshTokenExpiresIn?: number
}

/**
 * Returns eBay config from Nuxt runtimeConfig.
 */
function getEbayConfig() {
  const config = useRuntimeConfig()
  return {
    clientId: config.ebayClientId,
    clientSecret: config.ebayClientSecret,
    redirectUri: config.ebayRedirectUri,
    apiUrl: config.ebayApiUrl,
    authUrl: config.ebayAuthUrl,
  }
}

/**
 * Generates the eBay OAuth consent URL for user authorization.
 */
export function getConsentUrl(state: string): string {
  const { clientId, redirectUri, authUrl } = getEbayConfig()

  const scopes = [
    'https://api.ebay.com/oauth/api_scope/sell.inventory',
    'https://api.ebay.com/oauth/api_scope/sell.account',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes,
    state,
  })

  return `${authUrl}/oauth2/authorize?${params.toString()}`
}

/**
 * Exchanges an authorization code for access and refresh tokens.
 */
export async function exchangeCodeForToken(authorizationCode: string): Promise<EbayTokenResponse> {
  const { clientId, clientSecret, redirectUri, apiUrl } = getEbayConfig()

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await $fetch<{
    access_token: string
    expires_in: number
    refresh_token: string
    refresh_token_expires_in: number
  }>(`${apiUrl}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: redirectUri,
    }).toString(),
  })

  return {
    accessToken: response.access_token,
    expiresIn: response.expires_in,
    refreshToken: response.refresh_token,
    refreshTokenExpiresIn: response.refresh_token_expires_in,
  }
}

/**
 * Refreshes the access token using a refresh token.
 * The refresh token itself is NOT renewed by this call.
 */
export async function refreshAccessToken(refreshToken: string): Promise<EbayTokenResponse> {
  const { clientId, clientSecret, apiUrl } = getEbayConfig()

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const scopes = [
    'https://api.ebay.com/oauth/api_scope/sell.inventory',
    'https://api.ebay.com/oauth/api_scope/sell.account',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
  ].join(' ')

  const response = await $fetch<{
    access_token: string
    expires_in: number
  }>(`${apiUrl}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: scopes,
    }).toString(),
  })

  return {
    accessToken: response.access_token,
    expiresIn: response.expires_in,
  }
}

/**
 * Returns a valid access token for the user.
 * Automatically refreshes if expired or expiring within 5 minutes.
 * Returns null if refresh token is expired (user must re-authorize).
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const ebayToken = await prisma.ebayToken.findUnique({
    where: { userId },
  })

  if (!ebayToken) return null

  // Check if refresh token is expired
  if (ebayToken.refreshTokenExpiresAt < new Date()) {
    return null
  }

  // Check if access token is still valid (with 5 min buffer)
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
  if (ebayToken.accessTokenExpiresAt > fiveMinutesFromNow) {
    return ebayToken.accessToken
  }

  // Refresh the access token
  const refreshed = await refreshAccessToken(ebayToken.refreshToken)

  await prisma.ebayToken.update({
    where: { userId },
    data: {
      accessToken: refreshed.accessToken,
      accessTokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
    },
  })

  return refreshed.accessToken
}
