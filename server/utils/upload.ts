import { join } from 'path'
import { randomBytes } from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_LISTING || '6')

export function getUploadDir(listingId: string): string {
  return join(process.cwd(), 'uploads', 'listings', listingId)
}

export function generateFilename(listingId: string, originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const random = randomBytes(4).toString('hex')
  return `${listingId}_${Date.now()}_${random}.${ext}`
}

export function validateFile(file: { type?: string; size?: number; name?: string }): string | null {
  if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
    return `Formato non supportato: ${file.type}. Usa JPG, PNG o WebP.`
  }
  if (file.size && file.size > MAX_FILE_SIZE) {
    return `File troppo grande: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max ${MAX_FILE_SIZE / 1024 / 1024}MB.`
  }
  return null
}

export { MAX_FILES, ALLOWED_TYPES, MAX_FILE_SIZE }
