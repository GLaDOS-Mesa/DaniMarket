<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Skip link for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      Vai al contenuto principale
    </a>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center min-h-[50vh]"
        role="status"
        aria-live="polite"
      >
        <div class="text-center">
          <div
            class="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"
            aria-hidden="true"
          />
          <p class="text-gray-500">Caricamento annuncio...</p>
        </div>
      </div>

      <!-- Error state: listing not found -->
      <div
        v-else-if="!listing"
        class="text-center py-16"
        role="alert"
      >
        <div
          class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          <svg
            class="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Annuncio non trovato</h1>
        <p class="text-gray-500 mb-6">L'annuncio che stai cercando non esiste o è stato eliminato.</p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg px-2 py-1"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Torna alla dashboard
        </NuxtLink>
      </div>

      <!-- Main content -->
      <main
        v-else
        id="main-content"
      >
        <!-- Header -->
        <ListingsDetailListingHeader :listing="listing" />

        <!-- Two-column layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left column (2/3 width on desktop) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Photo Gallery -->
            <ListingsDetailListingGallery
              :images="listing.images"
              :title="listing.title"
              @open-lightbox="handleOpenLightbox"
            />

            <!-- Basic Info Card -->
            <ListingsDetailListingBasicInfo :listing="listing" />

            <!-- Description Card -->
            <ListingsDetailListingDetails :description="listing.description" />

            <!-- Shipping Card -->
            <ListingsDetailListingShipping
              :city="listing.city"
              :province="listing.province"
              :shipping-available="listing.shippingAvailable"
              :shipping-cost="listing.shippingCost"
              :package-size="listing.packageSize"
              :currency="listing.currency"
            />
          </div>

          <!-- Right column (1/3 width on desktop) -->
          <div class="space-y-6">
            <!-- Platforms Card -->
            <ListingsDetailPlatformStatusSection :publications="listing.publications" />

            <!-- Stats Card -->
            <ListingsDetailStatsOverview :stats="listing.stats" />

            <!-- Activity Timeline -->
            <ListingsDetailActivityTimeline :activities="listing.activityLog" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Listing } from '~/types/listing'
import { useListingsApi } from '~/composables/useListingsApi'

const route = useRoute()
const { getById } = useListingsApi()

const listing = ref<Listing | null>(null)
const isLoading = ref(true)

// Load listing on mount
onMounted(async () => {
  const id = route.params.id as string
  const response = await getById(id)
  listing.value = response.data
  isLoading.value = false
})

// Lightbox handler (placeholder for future implementation)
const handleOpenLightbox = (index: number) => {
  // TODO: Implement lightbox modal in future sprint
  console.log('Open lightbox at index:', index)
}

// Page meta
useHead({
  title: computed(() => listing.value?.title || 'Caricamento...'),
})
</script>
