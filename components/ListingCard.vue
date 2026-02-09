<template>
  <NuxtLink
    :to="`/listings/${listing.id}`"
    class="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    :aria-label="`${listing.title} - ${formatPrice(listing.price, listing.currency)} - ${statusLabel}`"
  >
    <!-- Image -->
    <div class="aspect-square bg-gray-100 relative">
      <img
        v-if="listing.images?.length"
        :src="listing.images[0]"
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
        {{ formatPrice(listing.price, listing.currency) }}
      </p>

      <!-- Platform indicators -->
      <div v-if="listing.publications?.length" class="flex gap-1.5 mt-3">
        <PlatformLogo
          v-for="pub in listing.publications"
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
import type { Listing } from '~/types/listing'
import { listingStatusLabels, ListingStatus, Platform, PlatformPublicationStatus } from '~/types/listing'

// PlatformLogo expects uppercase values, our enums use lowercase
type LogoPlatform = 'EBAY' | 'VINTED' | 'SUBITO' | 'FACEBOOK_MARKETPLACE'
type LogoStatus = 'PENDING' | 'PUBLISHED' | 'ERROR' | 'REMOVED'

const props = defineProps<{
  listing: Listing
}>()

// Map our Platform enum to PlatformLogo expected values
const mapPlatformToLogo = (platform: Platform): LogoPlatform => {
  const mapping: Record<Platform, LogoPlatform> = {
    [Platform.EBAY]: 'EBAY',
    [Platform.VINTED]: 'VINTED',
    [Platform.SUBITO]: 'SUBITO',
    [Platform.FACEBOOK]: 'FACEBOOK_MARKETPLACE',
  }
  return mapping[platform]
}

// Map our PlatformPublicationStatus enum to PlatformLogo expected values
const mapStatusToLogo = (status: PlatformPublicationStatus): LogoStatus => {
  const mapping: Record<PlatformPublicationStatus, LogoStatus> = {
    [PlatformPublicationStatus.DRAFT]: 'PENDING',
    [PlatformPublicationStatus.PUBLISHED]: 'PUBLISHED',
    [PlatformPublicationStatus.ERROR]: 'ERROR',
    [PlatformPublicationStatus.REMOVED]: 'REMOVED',
  }
  return mapping[status]
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

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency || 'EUR',
  }).format(price)
}
</script>
