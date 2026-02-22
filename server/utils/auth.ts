// TODO: Replace with real authentication
// Uses the seed user for development
export const DEV_USER_ID = async () => {
  const user = await prisma.user.findFirst()
  if (!user) throw new Error('Nessun utente trovato. Esegui il seed: npm run db:seed')
  return user.id
}
