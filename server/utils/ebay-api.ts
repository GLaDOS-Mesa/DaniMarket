import { getValidAccessToken } from './ebay'

type EbayApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

/**
 * Executes a call to eBay APIs with automatic auth and marketplace headers.
 * Throws a specific error if the token is expired and not renewable.
 */
export async function ebayApiFetch<T = any>(
  userId: string,
  path: string,
  options: EbayApiOptions = {}
): Promise<T> {
  const config = useRuntimeConfig()
  const baseUrl = config.ebayApiUrl

  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) {
    throw new Error('Token eBay scaduto. Ricollega il tuo account eBay dalle Impostazioni.')
  }

  const { method = 'GET', body, headers = {} } = options

  const response = await $fetch<T>(`${baseUrl}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Language': 'it-IT',
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_IT',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  return response
}
