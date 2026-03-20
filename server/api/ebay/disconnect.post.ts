import { DEV_USER_ID } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = await DEV_USER_ID()

  await prisma.ebayToken.deleteMany({
    where: { userId },
  })

  return successResponse({ message: 'Account eBay scollegato' })
})
