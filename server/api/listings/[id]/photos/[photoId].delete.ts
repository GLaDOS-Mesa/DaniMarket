import { rm } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

defineRouteMeta({
  openAPI: {
    tags: ['Photos'],
    summary: 'Elimina foto',
    description: 'Delete a photo and reorder remaining photos',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Listing ID' },
      { name: 'photoId', in: 'path', required: true, schema: { type: 'string' }, description: 'Photo ID' },
    ],
    responses: {
      200: { description: 'Photo deleted' },
      404: { description: 'Photo or listing not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  try {
    const userId = await DEV_USER_ID()
    const id = getRouterParam(event, 'id')
    const photoId = getRouterParam(event, 'photoId')

    if (!id || !photoId) {
      return errorResponse(event, 'ID annuncio o foto mancante', 400)
    }

    // Verify photo belongs to user's listing
    const photo = await prisma.listingPhoto.findUnique({
      where: { id: photoId },
      include: { listing: { select: { userId: true } } },
    })

    if (!photo || photo.listingId !== id || photo.listing.userId !== userId) {
      return errorResponse(event, 'Foto non trovata', 404)
    }

    // Delete file from filesystem (don't fail if missing)
    const filePath = join(getUploadDir(id), photo.filename)
    if (existsSync(filePath)) {
      await rm(filePath)
    }

    // Delete DB record
    await prisma.listingPhoto.delete({ where: { id: photoId } })

    // Reorder remaining photos
    const remainingPhotos = await prisma.listingPhoto.findMany({
      where: { listingId: id },
      orderBy: { order: 'asc' },
    })

    await Promise.all(
      remainingPhotos.map((p, index) =>
        prisma.listingPhoto.update({
          where: { id: p.id },
          data: { order: index },
        }),
      ),
    )

    return successResponse({ message: 'Foto eliminata' })
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore nell\'eliminazione della foto', 500)
  }
})
