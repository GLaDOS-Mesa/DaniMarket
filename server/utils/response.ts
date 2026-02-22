import { H3Event } from 'h3'

export function successResponse(data: any, statusCode = 200) {
  return { success: true, data, statusCode }
}

export function errorResponse(event: H3Event, message: string, statusCode = 400) {
  setResponseStatus(event, statusCode)
  return { success: false, error: message, statusCode }
}
