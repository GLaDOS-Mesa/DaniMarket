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

    <p
      v-else
      class="text-gray-500 text-sm"
    >
      Nessuna piattaforma selezionata
    </p>
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
