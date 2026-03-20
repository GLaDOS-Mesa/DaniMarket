import { DEV_USER_ID } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { code, state, error: ebayError } = query

  // eBay returned an error
  if (ebayError) {
    return sendRedirect(event, `/settings?ebay=error&message=${encodeURIComponent(String(ebayError))}`)
  }

  // Verify CSRF state
  const savedState = getCookie(event, 'ebay_oauth_state')
  deleteCookie(event, 'ebay_oauth_state')

  if (!state || state !== savedState) {
    return sendRedirect(event, '/settings?ebay=error&message=Richiesta+non+valida')
  }

  if (!code || typeof code !== 'string') {
    return sendRedirect(event, '/settings?ebay=error&message=Codice+di+autorizzazione+mancante')
  }

  try {
    const tokens = await exchangeCodeForToken(code)
    const userId = await DEV_USER_ID()

    const now = new Date()
    await prisma.ebayToken.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: new Date(now.getTime() + tokens.expiresIn * 1000),
        refreshToken: tokens.refreshToken!,
        refreshTokenExpiresAt: new Date(now.getTime() + tokens.refreshTokenExpiresIn! * 1000),
      },
      update: {
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: new Date(now.getTime() + tokens.expiresIn * 1000),
        refreshToken: tokens.refreshToken!,
        refreshTokenExpiresAt: new Date(now.getTime() + tokens.refreshTokenExpiresIn! * 1000),
      },
    })

    return sendRedirect(event, '/settings?ebay=success')
  } catch (err) {
    console.error('eBay token exchange failed:', err)
    return sendRedirect(event, '/settings?ebay=error&message=Autorizzazione+fallita')
  }
})
