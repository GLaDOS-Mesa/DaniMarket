import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useToast } from '~/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Clear any existing toasts - need to get fresh reference and clear all
    const { toasts, removeToast } = useToast()
    // Copy IDs to avoid mutation during iteration
    const ids = toasts.value.map((t) => t.id)
    ids.forEach((id) => removeToast(id))
  })

  afterEach(() => {
    // Also clear toasts after each test
    const { toasts, removeToast } = useToast()
    const ids = toasts.value.map((t) => t.id)
    ids.forEach((id) => removeToast(id))
    vi.useRealTimers()
  })

  describe('showToast', () => {
    it('should add a toast to the list', () => {
      const { toasts, showToast } = useToast()
      showToast('success', 'Test message')
      expect(toasts.value.length).toBe(1)
      expect(toasts.value[0].message).toBe('Test message')
      expect(toasts.value[0].type).toBe('success')
    })

    it('should return a unique id', () => {
      const { showToast } = useToast()
      const id1 = showToast('success', 'Message 1')
      const id2 = showToast('success', 'Message 2')
      expect(id1).not.toBe(id2)
    })

    it('should auto-remove toast after duration', () => {
      const { toasts, showToast } = useToast()
      showToast('success', 'Test', 3000)
      expect(toasts.value.length).toBe(1)

      vi.advanceTimersByTime(3000)
      expect(toasts.value.length).toBe(0)
    })

    it('should not auto-remove toast with duration 0', () => {
      const { toasts, showToast } = useToast()
      showToast('success', 'Persistent', 0)
      expect(toasts.value.length).toBe(1)

      vi.advanceTimersByTime(10000)
      expect(toasts.value.length).toBe(1)
    })
  })

  describe('removeToast', () => {
    it('should remove toast by id', () => {
      const { toasts, showToast, removeToast } = useToast()
      const id = showToast('success', 'Test', 0)
      expect(toasts.value.length).toBe(1)

      removeToast(id)
      expect(toasts.value.length).toBe(0)
    })

    it('should not fail when removing non-existent id', () => {
      const { removeToast } = useToast()
      expect(() => removeToast(99999)).not.toThrow()
    })
  })

  describe('convenience methods', () => {
    it('should create success toast', () => {
      const { toasts, success } = useToast()
      success('Success!')
      expect(toasts.value[0].type).toBe('success')
    })

    it('should create error toast', () => {
      const { toasts, error } = useToast()
      error('Error!')
      expect(toasts.value[0].type).toBe('error')
    })

    it('should create warning toast', () => {
      const { toasts, warning } = useToast()
      warning('Warning!')
      expect(toasts.value[0].type).toBe('warning')
    })

    it('should create info toast', () => {
      const { toasts, info } = useToast()
      info('Info!')
      expect(toasts.value[0].type).toBe('info')
    })
  })

  describe('toast properties', () => {
    it('should include all expected properties', () => {
      const { toasts, showToast } = useToast()
      showToast('warning', 'Test message', 4000)

      const toast = toasts.value[0]
      expect(toast).toHaveProperty('id')
      expect(toast).toHaveProperty('type', 'warning')
      expect(toast).toHaveProperty('message', 'Test message')
      expect(toast).toHaveProperty('duration', 4000)
    })
  })
})
