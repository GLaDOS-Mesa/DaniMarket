// Mock Nuxt auto-imports before module loading
const mocks = vi.hoisted(() => {
  const useRuntimeConfig = vi.fn(() => ({
    ebayClientId: 'test-client-id',
    ebayClientSecret: 'test-client-secret',
    ebayRedirectUri: 'test-RuName',
    ebayApiUrl: 'https://api.sandbox.ebay.com',
    ebayAuthUrl: 'https://auth.sandbox.ebay.com',
  }))

  const $fetch = vi.fn()

  const findUnique = vi.fn()
  const update = vi.fn()

  ;(globalThis as any).useRuntimeConfig = useRuntimeConfig
  ;(globalThis as any).$fetch = $fetch
  ;(globalThis as any).prisma = {
    ebayToken: { findUnique, update },
  }

  return { useRuntimeConfig, $fetch, findUnique, update }
})

vi.mock('~/server/utils/prisma', () => ({
  prisma: (globalThis as any).prisma,
}))

import { getConsentUrl, exchangeCodeForToken, refreshAccessToken, getValidAccessToken } from '~/server/utils/ebay'

beforeEach(() => {
  vi.clearAllMocks()
})

// --- getConsentUrl ---

describe('getConsentUrl', () => {
  it('generates correct eBay authorization URL', () => {
    const url = getConsentUrl('test-state-123')

    expect(url).toContain('https://auth.sandbox.ebay.com/oauth2/authorize')
    expect(url).toContain('client_id=test-client-id')
    expect(url).toContain('response_type=code')
    expect(url).toContain('redirect_uri=test-RuName')
    expect(url).toContain('state=test-state-123')
  })

  it('includes required OAuth scopes', () => {
    const url = getConsentUrl('state')

    expect(url).toContain('sell.inventory')
    expect(url).toContain('sell.account')
    expect(url).toContain('sell.fulfillment')
  })
})

// --- exchangeCodeForToken ---

describe('exchangeCodeForToken', () => {
  it('exchanges authorization code for tokens', async () => {
    mocks.$fetch.mockResolvedValueOnce({
      access_token: 'access-123',
      expires_in: 7200,
      refresh_token: 'refresh-456',
      refresh_token_expires_in: 47304000,
    })

    const result = await exchangeCodeForToken('auth-code-xyz')

    expect(result).toEqual({
      accessToken: 'access-123',
      expiresIn: 7200,
      refreshToken: 'refresh-456',
      refreshTokenExpiresIn: 47304000,
    })
  })

  it('calls eBay token endpoint with correct params', async () => {
    mocks.$fetch.mockResolvedValueOnce({
      access_token: 'a',
      expires_in: 1,
      refresh_token: 'r',
      refresh_token_expires_in: 1,
    })

    await exchangeCodeForToken('my-code')

    expect(mocks.$fetch).toHaveBeenCalledWith(
      'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from('test-client-id:test-client-secret').toString('base64')}`,
        }),
      })
    )

    const body = mocks.$fetch.mock.calls[0][1].body
    expect(body).toContain('grant_type=authorization_code')
    expect(body).toContain('code=my-code')
    expect(body).toContain('redirect_uri=test-RuName')
  })
})

// --- refreshAccessToken ---

describe('refreshAccessToken', () => {
  it('refreshes access token using refresh token', async () => {
    mocks.$fetch.mockResolvedValueOnce({
      access_token: 'new-access-789',
      expires_in: 7200,
    })

    const result = await refreshAccessToken('refresh-456')

    expect(result).toEqual({
      accessToken: 'new-access-789',
      expiresIn: 7200,
    })
  })

  it('calls eBay token endpoint with refresh_token grant type', async () => {
    mocks.$fetch.mockResolvedValueOnce({
      access_token: 'a',
      expires_in: 1,
    })

    await refreshAccessToken('my-refresh-token')

    const body = mocks.$fetch.mock.calls[0][1].body
    expect(body).toContain('grant_type=refresh_token')
    expect(body).toContain('refresh_token=my-refresh-token')
    expect(body).toContain('scope=')
  })
})

// --- getValidAccessToken ---

describe('getValidAccessToken', () => {
  it('returns null when no token exists', async () => {
    mocks.findUnique.mockResolvedValueOnce(null)

    const result = await getValidAccessToken('user-1')

    expect(result).toBeNull()
  })

  it('returns null when refresh token is expired', async () => {
    mocks.findUnique.mockResolvedValueOnce({
      accessToken: 'access',
      accessTokenExpiresAt: new Date(Date.now() + 3600000),
      refreshToken: 'refresh',
      refreshTokenExpiresAt: new Date(Date.now() - 1000), // expired
    })

    const result = await getValidAccessToken('user-1')

    expect(result).toBeNull()
  })

  it('returns existing token when still valid', async () => {
    mocks.findUnique.mockResolvedValueOnce({
      accessToken: 'valid-access-token',
      accessTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      refreshToken: 'refresh',
      refreshTokenExpiresAt: new Date(Date.now() + 86400000),
    })

    const result = await getValidAccessToken('user-1')

    expect(result).toBe('valid-access-token')
    expect(mocks.$fetch).not.toHaveBeenCalled()
  })

  it('refreshes token when expiring within 5 minutes', async () => {
    mocks.findUnique.mockResolvedValueOnce({
      accessToken: 'old-token',
      accessTokenExpiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 min from now
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: new Date(Date.now() + 86400000),
    })

    mocks.$fetch.mockResolvedValueOnce({
      access_token: 'refreshed-token',
      expires_in: 7200,
    })

    mocks.update.mockResolvedValueOnce({})

    const result = await getValidAccessToken('user-1')

    expect(result).toBe('refreshed-token')
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        data: expect.objectContaining({
          accessToken: 'refreshed-token',
        }),
      })
    )
  })
})
