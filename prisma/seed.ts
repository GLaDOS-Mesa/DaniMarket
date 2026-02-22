import 'dotenv/config'
import PrismaClientPkg from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const { PrismaClient } = PrismaClientPkg

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(12, 0, 0, 0)
  return date
}

async function main() {
  // Clean existing data
  await prisma.activityLog.deleteMany()
  await prisma.platformPublication.deleteMany()
  await prisma.listingPhoto.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Database cleaned')

  // Create user
  const user = await prisma.user.create({
    data: {
      email: 'enrica@danimarket.test',
      name: 'Enrica',
    },
  })

  console.log(`👤 User created: ${user.name} (${user.email})`)

  // ============ Annuncio 1 — Giacca di pelle nera ============

  const listing1 = await prisma.listing.create({
    data: {
      userId: user.id,
      status: 'ACTIVE',
      title: 'Giacca di pelle nera',
      description:
        'Giacca in vera pelle nera, taglia M. Indossata poche volte, in buone condizioni. Perfetta per la mezza stagione.',
      price: 85.0,
      category: 'CLOTHING',
      condition: 'GOOD',
      brand: 'Zara',
      size: 'M',
      colors: ['BLACK'],
      material: 'Pelle',
      city: 'Bologna',
      province: 'BO',
      shippingAvailable: true,
      packageSize: 'MEDIUM',
      shippingCost: 6.9,
      photos: {
        create: [
          { url: 'https://placehold.co/600x600/eee/999?text=Giacca+1', filename: 'giacca-1.jpg', order: 0 },
          { url: 'https://placehold.co/600x600/eee/999?text=Giacca+2', filename: 'giacca-2.jpg', order: 1 },
          { url: 'https://placehold.co/600x600/eee/999?text=Giacca+3', filename: 'giacca-3.jpg', order: 2 },
        ],
      },
      platformPublications: {
        create: [
          {
            platform: 'EBAY',
            status: 'PUBLISHED',
            publishedAt: daysAgo(5),
          },
          {
            platform: 'VINTED',
            status: 'PUBLISHED',
            publishedAt: daysAgo(5),
          },
        ],
      },
      activityLog: {
        create: [
          {
            action: 'CREATED',
            description: 'Annuncio creato',
            createdAt: daysAgo(7),
          },
          {
            action: 'PUBLISHED',
            description: 'Pubblicato su eBay',
            platform: 'EBAY',
            createdAt: daysAgo(5),
          },
          {
            action: 'PUBLISHED',
            description: 'Pubblicato su Vinted',
            platform: 'VINTED',
            createdAt: daysAgo(5),
          },
        ],
      },
    },
  })

  console.log(`📦 Listing 1 created: ${listing1.title}`)

  // ============ Annuncio 2 — iPhone 13 128GB ============

  const listing2 = await prisma.listing.create({
    data: {
      userId: user.id,
      status: 'DRAFT',
      title: 'iPhone 13 128GB',
      description:
        'iPhone 13 128GB bianco, come nuovo. Batteria al 92%, sempre usato con cover e pellicola. Completo di scatola e caricatore.',
      price: 450.0,
      category: 'ELECTRONICS',
      condition: 'LIKE_NEW',
      brand: 'Apple',
      colors: ['WHITE'],
      city: 'Bologna',
      province: 'BO',
      shippingAvailable: true,
      packageSize: 'SMALL',
      shippingCost: 8.5,
      photos: {
        create: [
          { url: 'https://placehold.co/600x600/eee/999?text=iPhone+1', filename: 'iphone-1.jpg', order: 0 },
          { url: 'https://placehold.co/600x600/eee/999?text=iPhone+2', filename: 'iphone-2.jpg', order: 1 },
        ],
      },
      activityLog: {
        create: [
          {
            action: 'CREATED',
            description: 'Annuncio creato',
            createdAt: daysAgo(2),
          },
        ],
      },
    },
  })

  console.log(`📦 Listing 2 created: ${listing2.title}`)

  // ============ Annuncio 3 — Scarpe Nike Air Max ============

  const listing3 = await prisma.listing.create({
    data: {
      userId: user.id,
      status: 'SOLD',
      title: 'Scarpe Nike Air Max',
      description:
        'Nike Air Max bianche e rosse, taglia 42. Usate ma in buone condizioni, suola ancora integra.',
      price: 60.0,
      category: 'SHOES',
      condition: 'GOOD',
      brand: 'Nike',
      size: '42',
      colors: ['WHITE', 'RED'],
      city: 'Bologna',
      province: 'BO',
      shippingAvailable: true,
      packageSize: 'MEDIUM',
      shippingCost: 7.5,
      photos: {
        create: [
          { url: 'https://placehold.co/600x600/eee/999?text=Nike+1', filename: 'nike-1.jpg', order: 0 },
          { url: 'https://placehold.co/600x600/eee/999?text=Nike+2', filename: 'nike-2.jpg', order: 1 },
        ],
      },
      platformPublications: {
        create: [
          {
            platform: 'EBAY',
            status: 'PUBLISHED',
            publishedAt: daysAgo(15),
          },
          {
            platform: 'SUBITO',
            status: 'PUBLISHED',
            publishedAt: daysAgo(15),
          },
          {
            platform: 'FACEBOOK',
            status: 'PUBLISHED',
            publishedAt: daysAgo(15),
          },
        ],
      },
      activityLog: {
        create: [
          {
            action: 'CREATED',
            description: 'Annuncio creato',
            createdAt: daysAgo(20),
          },
          {
            action: 'PUBLISHED',
            description: 'Pubblicato su eBay, Subito, Facebook Marketplace',
            createdAt: daysAgo(15),
          },
          {
            action: 'SOLD',
            description: 'Venduto tramite Subito',
            platform: 'SUBITO',
            createdAt: daysAgo(3),
          },
        ],
      },
    },
  })

  console.log(`📦 Listing 3 created: ${listing3.title}`)

  console.log('\n✅ Seed completed successfully!')
  console.log(`   - 1 user`)
  console.log(`   - 3 listings with photos, publications, and activity logs`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
