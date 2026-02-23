/**
 * Low-level API wrapper around $fetch.
 * Unwraps the backend `{ success, data }` envelope.
 * Used internally by other composables — pages should NOT import this directly.
 */
export function useApi() {
  async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await $fetch<{ success: boolean; data: T }>(url, { params })
    return response.data
  }

  async function post<T>(url: string, body?: any): Promise<T> {
    const response = await $fetch<{ success: boolean; data: T }>(url, { method: 'POST', body })
    return response.data
  }

  async function put<T>(url: string, body?: any): Promise<T> {
    const response = await $fetch<{ success: boolean; data: T }>(url, { method: 'PUT', body })
    return response.data
  }

  async function del<T>(url: string): Promise<T> {
    const response = await $fetch<{ success: boolean; data: T }>(url, { method: 'DELETE' })
    return response.data
  }

  async function uploadPhotos(listingId: string, files: File[]) {
    const formData = new FormData()
    files.forEach((file) => formData.append('photos', file))
    const response = await $fetch<{ success: boolean; data: any }>(
      `/api/listings/${listingId}/photos`,
      {
        method: 'POST',
        body: formData,
      },
    )
    return response.data
  }

  return { get, post, put, del, uploadPhotos }
}
