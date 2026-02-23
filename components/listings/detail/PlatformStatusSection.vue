<template>
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
      v-if="activePublications.length"
      class="space-y-3"
    >
      <li
        v-for="pub in activePublications"
        :key="pub.id"
        class="flex items-center justify-between p-3 rounded-lg bg-gray-50 group"
      >
        <div class="flex items-center gap-3">
          <PlatformLogo
            :platform="mapPlatformToLogo(pub.platform)"
            :status="mapPublicationStatusToLogo(pub.status)"
            size="sm"
          />
          <span class="font-medium text-gray-900">{{ platformLabels[pub.platform] }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="px-2.5 py-1 rounded-full text-xs font-medium"
            :class="statusClasses(pub.status)"
          >
            {{ publicationStatusLabels[pub.status] }}
          </span>
          <!-- Publish button (shown for DRAFT and ERROR) -->
          <button
            v-if="pub.status === PlatformPublicationStatus.DRAFT || pub.status === PlatformPublicationStatus.ERROR"
            type="button"
            class="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            :aria-label="`Pubblica su ${platformLabels[pub.platform]}`"
            @click="emit('publishPlatform', pub.platform)"
          >
            Pubblica
          </button>
          <!-- Remove button -->
          <button
            type="button"
            class="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            :aria-label="`Rimuovi ${platformLabels[pub.platform]}`"
            @click="emit('removePlatform', pub.platform)"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </li>
    </ul>

    <!-- Add platform button -->
    <div
      v-if="availablePlatforms.length > 0"
      class="mt-4"
    >
      <!-- Platform picker -->
      <div
        v-if="showPicker"
        class="space-y-2"
      >
        <p class="text-sm text-gray-600 font-medium">Seleziona piattaforma:</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="platform in availablePlatforms"
            :key="platform"
            type="button"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            :aria-label="`Aggiungi ${platformLabels[platform]}`"
            @click="handleSelectPlatform(platform)"
          >
            <PlatformLogo
              :platform="mapPlatformToLogo(platform)"
              status="PENDING"
              size="sm"
            />
            {{ platformLabels[platform] }}
          </button>
        </div>
        <button
          type="button"
          class="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-1 py-0.5"
          @click="showPicker = false"
        >
          Annulla
        </button>
      </div>

      <!-- Toggle button -->
      <button
        v-else
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        @click="showPicker = true"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Aggiungi piattaforma
      </button>
    </div>

    <!-- Empty state (no active publications AND no platforms available) -->
    <div
      v-if="activePublications.length === 0 && availablePlatforms.length === 0"
      class="text-center py-4"
    >
      <p class="text-gray-500 text-sm">
        Tutte le piattaforme sono già state aggiunte.
      </p>
    </div>

    <!-- Empty state (no active publications but platforms available) -->
    <div
      v-else-if="activePublications.length === 0 && !showPicker"
      class="text-center py-4"
    >
      <div
        class="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          class="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      </div>
      <p class="text-gray-500 text-sm">
        Nessuna piattaforma selezionata
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Platform,
  PlatformPublicationStatus,
  publicationStatusLabels,
  platformLabels,
} from '~/types/listing'
import type { PlatformPublication } from '~/types/listing'

// PlatformLogo type mappings
type LogoPlatform = 'EBAY' | 'VINTED' | 'SUBITO' | 'FACEBOOK_MARKETPLACE'
type LogoStatus = 'PENDING' | 'PUBLISHED' | 'ERROR' | 'REMOVED'

const props = defineProps<{
  publications: PlatformPublication[]
}>()

const emit = defineEmits<{
  (e: 'addPlatform', platform: Platform): void
  (e: 'removePlatform', platform: Platform): void
  (e: 'publishPlatform', platform: Platform): void
}>()

const showPicker = ref(false)

// Active publications (exclude REMOVED)
const activePublications = computed(() => {
  return props.publications.filter(p => p.status !== PlatformPublicationStatus.REMOVED)
})

// Platforms not yet added (or removed) — available for (re-)adding
const availablePlatforms = computed(() => {
  const activePlatforms = new Set(activePublications.value.map(p => p.platform))
  return Object.values(Platform).filter(p => !activePlatforms.has(p))
})

const handleSelectPlatform = (platform: Platform) => {
  emit('addPlatform', platform)
  showPicker.value = false
}

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

const statusClasses = (status: PlatformPublicationStatus): string => {
  const classes: Record<PlatformPublicationStatus, string> = {
    [PlatformPublicationStatus.DRAFT]: 'bg-gray-100 text-gray-700',
    [PlatformPublicationStatus.PUBLISHED]: 'bg-green-100 text-green-700',
    [PlatformPublicationStatus.ERROR]: 'bg-red-100 text-red-700',
    [PlatformPublicationStatus.REMOVED]: 'bg-orange-100 text-orange-700',
  }
  return classes[status]
}
</script>
