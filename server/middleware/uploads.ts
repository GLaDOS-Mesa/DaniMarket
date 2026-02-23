import { createReadStream, existsSync, statSync } from 'fs'
import { join, extname } from 'path'
import { sendStream, setResponseHeader, setResponseStatus } from 'h3'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

/**
 * Middleware to serve uploaded files from the /uploads directory.
 * Handles requests matching /uploads/* and serves the corresponding file
 * from the filesystem with proper content-type headers.
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Only handle /uploads/* requests
  if (!pathname.startsWith('/uploads/')) {
    return
  }

  // Extract the relative path after /uploads/
  const relativePath = pathname.slice('/uploads/'.length)

  // Prevent directory traversal attacks
  if (relativePath.includes('..') || relativePath.includes('\0') || !relativePath) {
    setResponseStatus(event, 400)
    return 'Invalid path'
  }

  // Only serve allowed image types
  const ext = extname(relativePath).toLowerCase()
  const contentType = MIME_TYPES[ext]
  if (!contentType) {
    setResponseStatus(event, 415)
    return 'Unsupported file type'
  }

  const filePath = join(process.cwd(), 'uploads', relativePath)

  if (!existsSync(filePath)) {
    setResponseStatus(event, 404)
    return 'File not found'
  }

  const stat = statSync(filePath)

  setResponseHeader(event, 'Content-Type', contentType)
  setResponseHeader(event, 'Content-Length', stat.size)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=604800')

  return sendStream(event, createReadStream(filePath))
})
