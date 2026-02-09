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
            <section
              class="bg-white rounded-xl shadow-sm p-6"
              aria-labelledby="platforms-heading"
            >
              <h2
                id="platforms-heading"
                class="text-lg font-semibold text-gray-900 mb-4"
              >
                Piattaforme
              </h2>
              <ul
                v-if="listing.publications.length"
                class="space-y-3"
              >
                <li
                  v-for="pub in listing.publications"
                  :key="pub.id"
                  class="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div class="flex items-center gap-3">
                    <PlatformLogo
                      :platform="mapPlatformToLogo(pub.platform)"
                      :status="mapPublicationStatusToLogo(pub.status)"
                      size="sm"
                    />
                    <span class="font-medium text-gray-900">{{ platformLabels[pub.platform] }}</span>
                  </div>
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="publicationStatusClasses(pub.status)"
                  >
                    {{ publicationStatusLabels[pub.status] }}
                  </span>
                </li>
              </ul>
              <p
                v-else
                class="text-gray-500 text-sm"
              >
                Nessuna piattaforma selezionata
              </p>
            </section>

            <!-- Stats placeholder (Sprint 5) -->
            <section
              class="bg-white rounded-xl shadow-sm p-6"
              aria-labelledby="stats-heading"
            >
              <h2
                id="stats-heading"
                class="text-lg font-semibold text-gray-900 mb-4"
              >
                Statistiche
              </h2>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-gray-900">{{ listing.stats.totalViews ?? '—' }}</p>
                  <p class="text-xs text-gray-500">Visualizzazioni</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-gray-900">{{ listing.stats.favorites ?? '—' }}</p>
                  <p class="text-xs text-gray-500">Preferiti</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-gray-900">{{ listing.stats.messages ?? '—' }}</p>
                  <p class="text-xs text-gray-500">Messaggi</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-gray-900">{{ listing.stats.daysOnline ?? '—' }}</p>
                  <p class="text-xs text-gray-500">Giorni online</p>
                </div>
              </div>
            </section>

            <!-- Activity Log placeholder (Sprint 5) -->
            <section
              class="bg-white rounded-xl shadow-sm p-6"
              aria-labelledby="activity-heading"
            >
              <h2
                id="activity-heading"
                class="text-lg font-semibold text-gray-900 mb-4"
              >
                Attività recenti
              </h2>
              <ul
                v-if="listing.activityLog.length"
                class="space-y-3"
              >
                <li
                  v-for="activity in listing.activityLog.slice(0, 5)"
                  :key="activity.id"
                  class="flex items-start gap-3 text-sm"
                >
                  <span
                    class="flex-shrink-0 text-lg"
                    aria-hidden="true"
                  >
                    {{ activityActionIcons[activity.action] }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-gray-900">{{ activity.description }}</p>
                    <p class="text-gray-500 text-xs">{{ formatRelativeDate(activity.timestamp) }}</p>
                  </div>
                </li>
              </ul>
              <p
                v-else
                class="text-gray-500 text-sm"
              >
                Nessuna attività registrata
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Platform,
  PlatformPublicationStatus,
  publicationStatusLabels,
  platformLabels,
  activityActionIcons,
} from '~/types/listing'
import type { Listing } from '~/types/listing'
import { useListingsApi } from '~/composables/useListingsApi'

// PlatformLogo type mappings
type LogoPlatform = 'EBAY' | 'VINTED' | 'SUBITO' | 'FACEBOOK_MARKETPLACE'
type LogoStatus = 'PENDING' | 'PUBLISHED' | 'ERROR' | 'REMOVED'

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

// Platform logo mappings
const mapPlatformToLogo = (platform: Platform): LogoPlatform => {
  const mapping: Record<Platform, LogoPlatform> = {
    [Platform.EBAY]: 'EBAY',
    [Platform.VINTED]: 'VINTED',
    [Platform.SUBITO]: 'SUBITO',
    [Platform.FACEBOOK]: 'FACEBOOK_MARKETPLACE',
  }
  return mapping[platform]
}

const mapPublicationStatusToLogo = (status: PlatformPublicationStatus): LogoStatus => {
  const mapping: Record<PlatformPublicationStatus, LogoStatus> = {
    [PlatformPublicationStatus.DRAFT]: 'PENDING',
    [PlatformPublicationStatus.PUBLISHED]: 'PUBLISHED',
    [PlatformPublicationStatus.ERROR]: 'ERROR',
    [PlatformPublicationStatus.REMOVED]: 'REMOVED',
  }
  return mapping[status]
}

const publicationStatusClasses = (status: PlatformPublicationStatus): string => {
  const classes: Record<PlatformPublicationStatus, string> = {
    [PlatformPublicationStatus.DRAFT]: 'bg-gray-100 text-gray-700',
    [PlatformPublicationStatus.PUBLISHED]: 'bg-green-100 text-green-700',
    [PlatformPublicationStatus.ERROR]: 'bg-red-100 text-red-700',
    [PlatformPublicationStatus.REMOVED]: 'bg-orange-100 text-orange-700',
  }
  return classes[status]
}

// Date formatting
const formatRelativeDate = (date: Date): string => {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Adesso'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min fa`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ore fa`
  if (diffInSeconds < 172800) return 'Ieri'
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} giorni fa`

  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
    year: then.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(then)
}

// Page meta
useHead({
  title: computed(() => listing.value?.title || 'Caricamento...'),
})
</script>
