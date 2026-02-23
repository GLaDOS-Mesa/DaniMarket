<template>
  <NuxtLink
    :to="`/listings/${listing.id}`"
    class="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    :aria-label="`${listing.title} - ${formattedPrice} - ${statusLabel}`"
  >
    <!-- Image -->
    <div class="aspect-square bg-gray-100 relative">
      <img
        v-if="listing.coverPhoto"
        :src="listing.coverPhoto"
        :alt="`Foto di ${listing.title}`"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400" aria-hidden="true">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <!-- Status badge -->
      <span
        class="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full"
        :class="statusClasses"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="font-medium text-gray-900 truncate">{{ listing.title }}</h3>
      <p class="text-lg font-bold text-primary-600 mt-1">
        {{ formattedPrice }}
      </p>

      <!-- Platform indicators -->
      <div v-if="listing.platforms?.length" class="flex gap-1.5 mt-3">
        <PlatformLogo
          v-for="pub in listing.platforms"
          :key="pub.platform"
          :platform="mapPlatformToLogo(pub.platform)"
          :status="mapStatusToLogo(pub.status)"
          size="sm"
        />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ListingSummary } from '~/types/listing'
import { listingStatusLabels, ListingStatus } from '~/types/listing'

type LogoPlatform = 'EBAY' | 'VINTED' | 'SUBITO' | 'FACEBOOK_MARKETPLACE'
type LogoStatus = 'PENDING' | 'PUBLISHED' | 'ERROR' | 'REMOVED'

const props = defineProps<{
  listing: ListingSummary
}>()

const mapPlatformToLogo = (platform: string): LogoPlatform => {
  const mapping: Record<string, LogoPlatform> = {
    EBAY: 'EBAY',
    VINTED: 'VINTED',
    SUBITO: 'SUBITO',
    FACEBOOK: 'FACEBOOK_MARKETPLACE',
  }
  return mapping[platform] || 'EBAY'
}

const mapStatusToLogo = (status: string): LogoStatus => {
  const mapping: Record<string, LogoStatus> = {
    DRAFT: 'PENDING',
    PUBLISHED: 'PUBLISHED',
    ERROR: 'ERROR',
    REMOVED: 'REMOVED',
  }
  return mapping[status] || 'PENDING'
}

const statusClasses = computed(() => {
  const classes: Record<ListingStatus, string> = {
    [ListingStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [ListingStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [ListingStatus.SOLD]: 'bg-blue-100 text-blue-800',
    [ListingStatus.ARCHIVED]: 'bg-yellow-100 text-yellow-800',
  }
  return classes[props.listing.status] || 'bg-gray-100 text-gray-800'
})

const statusLabel = computed(() => {
  return listingStatusLabels[props.listing.status] || props.listing.status
})

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(props.listing.price)
})
</script>
