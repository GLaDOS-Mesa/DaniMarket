import { describe, it, expect } from 'vitest'
import { getUploadDir, generateFilename, validateFile, MAX_FILES, ALLOWED_TYPES, MAX_FILE_SIZE } from '~/server/utils/upload'

describe('upload utility', () => {
  describe('getUploadDir', () => {
    it('should return absolute path with listing ID', () => {
      const dir = getUploadDir('abc123')
      expect(dir).toContain('uploads')
      expect(dir).toContain('listings')
      expect(dir).toContain('abc123')
    })

    it('should include process.cwd() as base', () => {
      const dir = getUploadDir('test-id')
      expect(dir.startsWith(process.cwd())).toBe(true)
    })
  })

  describe('generateFilename', () => {
    it('should include listing ID in filename', () => {
      const name = generateFilename('listing123', 'photo.jpg')
      expect(name).toContain('listing123')
    })

    it('should preserve the file extension', () => {
      expect(generateFilename('id', 'photo.jpg')).toMatch(/\.jpg$/)
      expect(generateFilename('id', 'image.png')).toMatch(/\.png$/)
      expect(generateFilename('id', 'pic.webp')).toMatch(/\.webp$/)
    })

    it('should lowercase the extension', () => {
      const name = generateFilename('id', 'PHOTO.JPG')
      expect(name).toMatch(/\.jpg$/)
    })

    it('should use last segment after dot as extension', () => {
      // 'noext' has no dot, so split('.').pop() returns 'noext' itself
      const name = generateFilename('id', 'noext')
      expect(name).toMatch(/\.noext$/)
    })

    it('should generate unique filenames', () => {
      const name1 = generateFilename('id', 'photo.jpg')
      const name2 = generateFilename('id', 'photo.jpg')
      expect(name1).not.toBe(name2)
    })

    it('should include timestamp', () => {
      const before = Date.now()
      const name = generateFilename('id', 'photo.jpg')
      const after = Date.now()

      // Extract timestamp from filename: id_TIMESTAMP_random.ext
      const parts = name.split('_')
      const timestamp = parseInt(parts[1])
      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('validateFile', () => {
    it('should accept JPEG files', () => {
      expect(validateFile({ type: 'image/jpeg', size: 1000, name: 'photo.jpg' })).toBeNull()
    })

    it('should accept JPG files', () => {
      expect(validateFile({ type: 'image/jpg', size: 1000, name: 'photo.jpg' })).toBeNull()
    })

    it('should accept PNG files', () => {
      expect(validateFile({ type: 'image/png', size: 1000, name: 'photo.png' })).toBeNull()
    })

    it('should accept WebP files', () => {
      expect(validateFile({ type: 'image/webp', size: 1000, name: 'photo.webp' })).toBeNull()
    })

    it('should reject unsupported formats', () => {
      const error = validateFile({ type: 'text/plain', size: 100, name: 'file.txt' })
      expect(error).not.toBeNull()
      expect(error).toContain('Formato non supportato')
      expect(error).toContain('text/plain')
    })

    it('should reject GIF files', () => {
      const error = validateFile({ type: 'image/gif', size: 1000, name: 'anim.gif' })
      expect(error).not.toBeNull()
    })

    it('should reject files without type', () => {
      const error = validateFile({ size: 1000, name: 'unknown' })
      expect(error).not.toBeNull()
    })

    it('should reject files exceeding max size', () => {
      const error = validateFile({ type: 'image/jpeg', size: MAX_FILE_SIZE + 1, name: 'big.jpg' })
      expect(error).not.toBeNull()
      expect(error).toContain('troppo grande')
    })

    it('should accept files at exactly max size', () => {
      expect(validateFile({ type: 'image/jpeg', size: MAX_FILE_SIZE, name: 'max.jpg' })).toBeNull()
    })

    it('should accept files without size (skip size check)', () => {
      expect(validateFile({ type: 'image/jpeg', name: 'no-size.jpg' })).toBeNull()
    })
  })

  describe('constants', () => {
    it('should have MAX_FILES set to 6', () => {
      expect(MAX_FILES).toBe(6)
    })

    it('should have MAX_FILE_SIZE set to 5MB', () => {
      expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024)
    })

    it('should allow jpeg, jpg, png, and webp', () => {
      expect(ALLOWED_TYPES).toContain('image/jpeg')
      expect(ALLOWED_TYPES).toContain('image/jpg')
      expect(ALLOWED_TYPES).toContain('image/png')
      expect(ALLOWED_TYPES).toContain('image/webp')
      expect(ALLOWED_TYPES).toHaveLength(4)
    })
  })
})
