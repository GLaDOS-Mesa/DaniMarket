// TODO: Replace with real authentication
// Uses the first user found, or auto-creates a default one
export const DEV_USER_ID = async () => {
  const user = await prisma.user.findFirst()
  if (user) return user.id

  const created = await prisma.user.create({
    data: {
      email: 'dev@danimarket.local',
      name: 'Utente',
    },
  })
  return created.id
}
