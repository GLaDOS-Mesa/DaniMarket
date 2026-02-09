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
      v-if="publications.length"
      class="space-y-3"
    >
      <li
        v-for="pub in publications"
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
          :class="statusClasses(pub.status)"
        >
          {{ publicationStatusLabels[pub.status] }}
        </span>
      </li>
    </ul>

    <!-- Empty state -->
    <div
      v-else
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
      <p class="text-gray-500 text-sm mb-3">
        Nessuna piattaforma selezionata
      </p>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        @click="$emit('addPlatform')"
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

defineProps<{
  publications: PlatformPublication[]
}>()

defineEmits<{
  (e: 'addPlatform'): void
}>()

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
