export default defineEventHandler(async (event) => {
  const state = crypto.randomUUID()

  setCookie(event, 'ebay_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    path: '/',
  })

  const consentUrl = getConsentUrl(state)
  return sendRedirect(event, consentUrl)
})
