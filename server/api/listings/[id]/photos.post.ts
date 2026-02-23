import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

defineRouteMeta({
  openAPI: {
    tags: ['Photos'],
    summary: 'Upload foto',
    description: 'Upload one or more photos for a listing (max 6 total)',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Listing ID' },
    ],
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              photos: { type: 'array', items: { type: 'string', format: 'binary' } },
            },
          },
        },
      },
    },
    responses: {
      201: { description: 'Photos uploaded successfully' },
      400: { description: 'Validation error' },
      404: { description: 'Listing not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  try {
    const userId = await DEV_USER_ID()
    const id = getRouterParam(event, 'id')

    if (!id) {
      return errorResponse(event, 'ID annuncio mancante', 400)
    }

    // Verify listing ownership
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing || listing.userId !== userId) {
      return errorResponse(event, 'Annuncio non trovato', 404)
    }

    // Read multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      return errorResponse(event, 'Nessun file inviato', 400)
    }

    // Filter only file parts (with data)
    const files = formData.filter((part) => part.filename && part.data)
    if (files.length === 0) {
      return errorResponse(event, 'Nessun file valido inviato', 400)
    }

    // Check total photos limit
    const existingCount = await prisma.listingPhoto.count({ where: { listingId: id } })
    if (existingCount + files.length > MAX_FILES) {
      return errorResponse(
        event,
        `Limite foto superato: ${existingCount} esistenti + ${files.length} nuove = ${existingCount + files.length}. Massimo ${MAX_FILES}.`,
        400,
      )
    }

    // Validate each file
    for (const file of files) {
      const error = validateFile({
        type: file.type,
        size: file.data.length,
        name: file.filename,
      })
      if (error) {
        return errorResponse(event, error, 400)
      }
    }

    // Create upload directory
    const uploadDir = getUploadDir(id)
    await mkdir(uploadDir, { recursive: true })

    // Save files and create DB records
    const createdPhotos = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filename = generateFilename(id, file.filename!)
      const filePath = join(uploadDir, filename)

      await writeFile(filePath, file.data)

      const photo = await prisma.listingPhoto.create({
        data: {
          listingId: id,
          url: `/uploads/listings/${id}/${filename}`,
          filename,
          order: existingCount + i,
        },
      })

      createdPhotos.push(photo)
    }

    return successResponse(createdPhotos, 201)
  } catch (error: any) {
    return errorResponse(event, error.message || 'Errore durante l\'upload delle foto', 500)
  }
})
