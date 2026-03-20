import { DEV_USER_ID } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await DEV_USER_ID()

  const ebayToken = await prisma.ebayToken.findUnique({
    where: { userId },
    select: {
      ebayUsername: true,
      accessTokenExpiresAt: true,
      refreshTokenExpiresAt: true,
    },
  })

  if (!ebayToken) {
    return successResponse({ connected: false })
  }

  return successResponse({
    connected: true,
    ebayUsername: ebayToken.ebayUsername,
    tokenExpiresAt: ebayToken.accessTokenExpiresAt,
    refreshTokenExpiresAt: ebayToken.refreshTokenExpiresAt,
  })
})
