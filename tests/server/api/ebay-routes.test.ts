// --- Mock Nuxt/Nitro auto-imports BEFORE route handler modules are loaded ---
const mocks = vi.hoisted(() => {
  const getQuery = vi.fn()
  const getCookie = vi.fn()
  const setCookie = vi.fn()
  const deleteCookie = vi.fn()
  const sendRedirect = vi.fn()
  const exchangeCodeForToken = vi.fn()
  const getConsentUrl = vi.fn()

  const successResponse = vi.fn((data: any, statusCode = 200) => ({
    success: true,
    data,
    statusCode,
  }))

  const findUnique = vi.fn()
  const upsert = vi.fn()
  const deleteMany = vi.fn()

  // Nitro compiler macros
  ;(globalThis as any).defineEventHandler = (fn: any) => fn

  // h3 helpers
  ;(globalThis as any).getQuery = getQuery
  ;(globalThis as any).getCookie = getCookie
  ;(globalThis as any).setCookie = setCookie
  ;(globalThis as any).deleteCookie = deleteCookie
  ;(globalThis as any).sendRedirect = sendRedirect

  // Server utils (auto-imported by Nuxt)
  ;(globalThis as any).exchangeCodeForToken = exchangeCodeForToken
  ;(globalThis as any).getConsentUrl = getConsentUrl
  ;(globalThis as any).successResponse = successResponse
  ;(globalThis as any).prisma = {
    ebayToken: { findUnique, upsert, deleteMany },
  }

  return {
    getQuery, getCookie, setCookie, deleteCookie, sendRedirect,
    exchangeCodeForToken, getConsentUrl, successResponse,
    findUnique, upsert, deleteMany,
  }
})

// Mock DEV_USER_ID
vi.mock('~/server/utils/auth', () => ({
  DEV_USER_ID: vi.fn().mockResolvedValue('user-123'),
}))

// --- Import handlers ---
import authHandler from '~/server/api/ebay/auth.get'
import callbackHandler from '~/server/api/ebay/callback.get'
import statusHandler from '~/server/api/ebay/status.get'
import disconnectHandler from '~/server/api/ebay/disconnect.post'

const mockEvent = {} as any

beforeEach(() => {
  vi.clearAllMocks()
})

// --- GET /api/ebay/auth ---

describe('GET /api/ebay/auth', () => {
  it('sets state cookie and redirects to eBay consent URL', async () => {
    mocks.getConsentUrl.mockReturnValue('https://auth.sandbox.ebay.com/oauth2/authorize?...')

    await authHandler(mockEvent)

    expect(mocks.setCookie).toHaveBeenCalledWith(
      mockEvent,
      'ebay_oauth_state',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        maxAge: 600,
        path: '/',
      })
    )
    expect(mocks.sendRedirect).toHaveBeenCalledWith(
      mockEvent,
      'https://auth.sandbox.ebay.com/oauth2/authorize?...'
    )
  })
})

// --- GET /api/ebay/callback ---

describe('GET /api/ebay/callback', () => {
  it('redirects with error when eBay returns an error', async () => {
    mocks.getQuery.mockReturnValue({ error: 'access_denied' })

    await callbackHandler(mockEvent)

    expect(mocks.sendRedirect).toHaveBeenCalledWith(
      mockEvent,
      expect.stringContaining('/settings?ebay=error&message=access_denied')
    )
  })

  it('redirects with error when state does not match', async () => {
    mocks.getQuery.mockReturnValue({ code: 'auth-code', state: 'state-1' })
    mocks.getCookie.mockReturnValue('different-state')

    await callbackHandler(mockEvent)

    expect(mocks.deleteCookie).toHaveBeenCalledWith(mockEvent, 'ebay_oauth_state')
    expect(mocks.sendRedirect).toHaveBeenCalledWith(
      mockEvent,
      '/settings?ebay=error&message=Richiesta+non+valida'
    )
  })

  it('redirects with error when state is missing', async () => {
    mocks.getQuery.mockReturnValue({ code: 'auth-code' })
    mocks.getCookie.mockReturnValue('saved-state')

    await callbackHandler(mockEvent)

    expect(mocks.sendRedirect).toHaveBeenCalledWith(
      mockEvent,
      '/settings?ebay=error&message=Richiesta+non+valida'
    )
  })

  it('redirects with error when code is missing', async () => {
    mocks.getQuery.mockReturnValue({ state: 'state-1' })
    mocks.getCookie.mockReturnValue('state-1')

    await callbackHandler(mockEvent)

    expect(mocks.sendRedirect).toHaveBeenCalledWith(
      mockEvent,
      '/settings?ebay=error&message=Codice+di+autorizzazione+mancante'
    )
  })

  it('exchanges code for tokens and saves to database', async () => {
    mocks.getQuery.mockReturnValue({ code: 'auth-code-xyz', state: 'valid-state' })
    mocks.getCookie.mockReturnValue('valid-state')
    mocks.exchangeCodeForToken.mockResolvedValue({
      accessToken: 'access-123',
      expiresIn: 7200,
      refreshToken: 'refresh-456',
      refreshTokenExpiresIn: 47304000,
    })
    mocks.upsert.mockResolvedValue({})

    await callbackHandler(mockEvent)

    expect(mocks.exchangeCodeForToken).toHaveBeenCalledWith('auth-code-xyz')
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-123' },
        create: expect.objectContaining({
          userId: 'user-123',
          accessToken: 'access-123',
          refreshToken: 'refresh-456',
        }),
        update: expect.objectContaining({
          accessToken: 'access-123',
          refreshToken: 'refresh-456',
        }),
      })
    )
    expect(mocks.sendRedirect).toHaveBeenCalledWith(mockEvent, '/settings?ebay=success')
  })

  it('redirects with error when token exchange fails', async () => {
    mocks.getQuery.mockReturnValue({ code: 'bad-code', state: 'valid-state' })
    mocks.getCookie.mockReturnValue('valid-state')
    mocks.exchangeCodeForToken.mockRejectedValue(new Error('Invalid code'))

    await callbackHandler(mockEvent)

    expect(mocks.sendRedirect).toHaveBeenCalledWith(
      mockEvent,
      '/settings?ebay=error&message=Autorizzazione+fallita'
    )
  })
})

// --- GET /api/ebay/status ---

describe('GET /api/ebay/status', () => {
  it('returns connected: false when no token exists', async () => {
    mocks.findUnique.mockResolvedValue(null)

    await statusHandler(mockEvent)

    expect(mocks.successResponse).toHaveBeenCalledWith({ connected: false })
  })

  it('returns connected: true with token info when token exists', async () => {
    const expiresAt = new Date('2026-06-01')
    const refreshExpiresAt = new Date('2027-09-01')
    mocks.findUnique.mockResolvedValue({
      ebayUsername: 'seller123',
      accessTokenExpiresAt: expiresAt,
      refreshTokenExpiresAt: refreshExpiresAt,
    })

    await statusHandler(mockEvent)

    expect(mocks.successResponse).toHaveBeenCalledWith({
      connected: true,
      ebayUsername: 'seller123',
      tokenExpiresAt: expiresAt,
      refreshTokenExpiresAt: refreshExpiresAt,
    })
  })
})

// --- POST /api/ebay/disconnect ---

describe('POST /api/ebay/disconnect', () => {
  it('deletes eBay token and returns success', async () => {
    mocks.deleteMany.mockResolvedValue({ count: 1 })

    await disconnectHandler(mockEvent)

    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
    })
    expect(mocks.successResponse).toHaveBeenCalledWith({
      message: 'Account eBay scollegato',
    })
  })
})
