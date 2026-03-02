// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
  },

  nitro: {
    preset: 'node-server',
    experimental: {
      openAPI: true,
    },
    openAPI: {
      meta: {
        title: 'DaniMarket API',
        description: 'API REST per la gestione degli annunci DaniMarket',
        version: '1.0.0',
      },
    },
    // Uploaded files are served dynamically via server/middleware/uploads.ts
    // (publicAssets only serves files present at build time, not runtime uploads)
  },

  runtimeConfig: {
    // Server-side only
    databaseUrl: process.env.DATABASE_URL,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    // Public (exposed to client)
    public: {
      appName: 'DaniMarket',
    },
  },
})
