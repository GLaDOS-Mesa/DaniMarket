defineRouteMeta({
  openAPI: {
    tags: ['System'],
    summary: 'Healthcheck',
    responses: {
      200: {
        description: 'Server attivo',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
  },
})

export default defineEventHandler(async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})
