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
            <!-- Photo Gallery (placeholder for Sprint 3) -->
            <section
              class="bg-white rounded-xl shadow-sm p-6"
              aria-labelledby="gallery-heading"
            >
              <h2
                id="gallery-heading"
                class="text-lg font-semibold text-gray-900 mb-4"
              >
                Foto ({{ listing.images.length }})
              </h2>
              <div
                v-if="listing.images.length"
                class="space-y-4"
              >
                <!-- Main image -->
                <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    :src="listing.images[selectedImageIndex]"
                    :alt="`Foto principale di ${listing.title}`"
                    class="w-full h-full object-cover"
                  />
                </div>
                <!-- Thumbnails -->
                <div
                  v-if="listing.images.length > 1"
                  class="flex gap-2 overflow-x-auto pb-2"
                >
                  <button
                    v-for="(image, index) in listing.images"
                    :key="index"
                    type="button"
                    class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
                    :class="selectedImageIndex === index ? 'ring-2 ring-primary-500 ring-offset-2' : 'opacity-70 hover:opacity-100'"
                    :aria-label="`Visualizza foto ${index + 1}`"
                    :aria-current="selectedImageIndex === index ? 'true' : undefined"
                    @click="selectedImageIndex = index"
                  >
                    <img
                      :src="image"
                      :alt="`Foto ${index + 1} di ${listing.title}`"
                      class="w-full h-full object-cover"
                    />
                  </button>
                </div>
              </div>
              <div
                v-else
                class="aspect-square rounded-lg bg-gray-100 flex items-center justify-center"
              >
                <div class="text-center text-gray-400">
                  <svg
                    class="w-16 h-16 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>Nessuna foto</p>
                </div>
              </div>
            </section>

            <!-- Basic Info Card -->
            <section
              class="bg-white rounded-xl shadow-sm p-6"
              aria-labelledby="info-heading"
            >
              <h2
                id="info-heading"
                class="text-lg font-semibold text-gray-900 mb-4"
              >
                Informazioni
              </h2>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <dt class="text-sm text-gray-500">Categoria</dt>
                  <dd class="text-gray-900 font-medium">{{ categoryLabel }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="text-sm text-gray-500">Condizione</dt>
                  <dd class="text-gray-900 font-medium">{{ conditionLabel }}</dd>
                </div>
                <div
                  v-if="listing.brand"
                  class="flex flex-col"
                >
                  <dt class="text-sm text-gray-500">Brand</dt>
                  <dd class="text-gray-900 font-medium">{{ listing.brand }}</dd>
                </div>
                <div
                  v-if="listing.size"
                  class="flex flex-col"
                >
                  <dt class="text-sm text-gray-500">Taglia</dt>
                  <dd class="text-gray-900 font-medium">{{ listing.size }}</dd>
                </div>
                <div
                  v-if="listing.colors.length"
                  class="flex flex-col sm:col-span-2"
                >
                  <dt class="text-sm text-gray-500 mb-1">Colori</dt>
                  <dd class="flex flex-wrap gap-2">
                    <span
                      v-for="color in listing.colors"
                      :key="color"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {{ colorLabels[color] }}
                    </span>
                  </dd>
                </div>
                <div
                  v-if="listing.material"
                  class="flex flex-col"
                >
                  <dt class="text-sm text-gray-500">Materiale</dt>
                  <dd class="text-gray-900 font-medium">{{ listing.material }}</dd>
                </div>
              </dl>
            </section>

            <!-- Description Card -->
            <section
              class="bg-white rounded-xl shadow-sm p-6"
              aria-labelledby="description-heading"
            >
              <h2
                id="description-heading"
                class="text-lg font-semibold text-gray-900 mb-4"
              >
                Descrizione
              </h2>
              <p class="text-gray-600 whitespace-pre-line leading-relaxed">
                {{ listing.description }}
              </p>
            </section>

            <!-- Shipping Card -->
            <section
              class="bg-white rounded-xl shadow-sm p-6"
              aria-labelledby="shipping-heading"
            >
              <h2
                id="shipping-heading"
                class="text-lg font-semibold text-gray-900 mb-4"
              >
                Spedizione e ritiro
              </h2>
              <dl class="space-y-3">
                <div class="flex items-start gap-3">
                  <svg
                    class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <dt class="text-sm text-gray-500">Località</dt>
                    <dd class="text-gray-900 font-medium">{{ listing.city }}, {{ listing.province }}</dd>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <svg
                    class="w-5 h-5 mt-0.5 flex-shrink-0"
                    :class="listing.shippingAvailable ? 'text-green-500' : 'text-gray-400'"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      v-if="listing.shippingAvailable"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                    <path
                      v-else
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <div>
                    <dt class="text-sm text-gray-500">Spedizione</dt>
                    <dd class="text-gray-900 font-medium">
                      <template v-if="listing.shippingAvailable">
                        Disponibile
                        <span v-if="listing.shippingCost" class="text-gray-500">
                          ({{ formattedShippingCost }})
                        </span>
                      </template>
                      <template v-else>
                        Solo ritiro in zona
                      </template>
                    </dd>
                  </div>
                </div>
                <div
                  v-if="listing.shippingAvailable && listing.packageSize"
                  class="flex items-start gap-3"
                >
                  <svg
                    class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <div>
                    <dt class="text-sm text-gray-500">Dimensione pacco</dt>
                    <dd class="text-gray-900 font-medium">{{ packageSizeLabels[listing.packageSize] }}</dd>
                  </div>
                </div>
              </dl>
            </section>
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
  categoryLabels,
  conditionLabels,
  colorLabels,
  platformLabels,
  packageSizeLabels,
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
const selectedImageIndex = ref(0)

// Load listing on mount
onMounted(async () => {
  const id = route.params.id as string
  const response = await getById(id)
  listing.value = response.data
  isLoading.value = false
})

// Computed values
const categoryLabel = computed(() => {
  if (!listing.value) return ''
  return categoryLabels[listing.value.category]
})

const conditionLabel = computed(() => {
  if (!listing.value) return ''
  return conditionLabels[listing.value.condition]
})

const formattedShippingCost = computed(() => {
  if (!listing.value?.shippingCost) return ''
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: listing.value.currency || 'EUR',
  }).format(listing.value.shippingCost)
})

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
