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
        <!-- Back link -->
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg px-2 py-1 -ml-2"
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

        <!-- Temporary: Raw data display for Sprint 1 -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ listing.title }}</h1>

          <!-- Status badge -->
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6"
            :class="statusClasses"
          >
            {{ statusLabel }}
          </span>

          <!-- Basic info grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 mb-3">Informazioni</h2>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt class="text-gray-500">Prezzo</dt>
                  <dd class="font-medium text-gray-900">{{ formattedPrice }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">Categoria</dt>
                  <dd class="text-gray-900">{{ categoryLabel }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">Condizione</dt>
                  <dd class="text-gray-900">{{ conditionLabel }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">Brand</dt>
                  <dd class="text-gray-900">{{ listing.brand || '—' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">Località</dt>
                  <dd class="text-gray-900">{{ listing.city }}, {{ listing.province }}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 class="text-lg font-semibold text-gray-900 mb-3">Piattaforme</h2>
              <ul class="space-y-2">
                <li
                  v-for="pub in listing.publications"
                  :key="pub.id"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="text-gray-700">{{ platformLabels[pub.platform] }}</span>
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="publicationStatusClasses(pub.status)"
                  >
                    {{ publicationStatusLabels[pub.status] }}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Description -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Descrizione</h2>
            <p class="text-gray-600 whitespace-pre-line">{{ listing.description }}</p>
          </div>

          <!-- Images preview -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Foto ({{ listing.images.length }})</h2>
            <div class="flex gap-2 overflow-x-auto pb-2">
              <img
                v-for="(image, index) in listing.images"
                :key="index"
                :src="image"
                :alt="`Foto ${index + 1} di ${listing.title}`"
                class="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
            </div>
          </div>

          <!-- Debug info -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <details class="text-xs text-gray-400">
              <summary class="cursor-pointer hover:text-gray-600">Debug: Raw JSON</summary>
              <pre class="mt-2 p-4 bg-gray-50 rounded-lg overflow-auto max-h-96">{{ JSON.stringify(listing, null, 2) }}</pre>
            </details>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ListingStatus,
  PlatformPublicationStatus,
  listingStatusLabels,
  publicationStatusLabels,
  categoryLabels,
  conditionLabels,
  platformLabels,
} from '~/types/listing'
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

// Computed values
const statusLabel = computed(() => {
  if (!listing.value) return ''
  return listingStatusLabels[listing.value.status]
})

const statusClasses = computed(() => {
  if (!listing.value) return ''
  const classes: Record<ListingStatus, string> = {
    [ListingStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [ListingStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [ListingStatus.SOLD]: 'bg-blue-100 text-blue-800',
    [ListingStatus.ARCHIVED]: 'bg-orange-100 text-orange-800',
  }
  return classes[listing.value.status]
})

const formattedPrice = computed(() => {
  if (!listing.value) return ''
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: listing.value.currency,
  }).format(listing.value.price)
})

const categoryLabel = computed(() => {
  if (!listing.value) return ''
  return categoryLabels[listing.value.category]
})

const conditionLabel = computed(() => {
  if (!listing.value) return ''
  return conditionLabels[listing.value.condition]
})

const publicationStatusClasses = (status: PlatformPublicationStatus): string => {
  const classes: Record<PlatformPublicationStatus, string> = {
    [PlatformPublicationStatus.DRAFT]: 'bg-gray-100 text-gray-700',
    [PlatformPublicationStatus.PUBLISHED]: 'bg-green-100 text-green-700',
    [PlatformPublicationStatus.ERROR]: 'bg-red-100 text-red-700',
    [PlatformPublicationStatus.REMOVED]: 'bg-orange-100 text-orange-700',
  }
  return classes[status]
}

// Page meta
useHead({
  title: computed(() => listing.value?.title || 'Caricamento...'),
})
</script>
