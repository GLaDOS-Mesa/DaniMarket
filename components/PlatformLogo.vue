<template>
  <div
    class="flex items-center justify-center overflow-hidden bg-white"
    :class="[sizeClasses, statusClasses, roundedClasses]"
    role="img"
    :aria-label="`${platformLabel}: ${statusLabel}`"
  >
    <img
      :src="logoSrc"
      :alt="platformLabel"
      class="w-full h-full object-contain"
      :class="imgPadding"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
type Platform = 'EBAY' | 'VINTED' | 'SUBITO' | 'FACEBOOK_MARKETPLACE'
type PublicationStatus = 'PENDING' | 'PUBLISHED' | 'ERROR' | 'REMOVED'

const props = withDefaults(
  defineProps<{
    platform: Platform
    status?: PublicationStatus
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    status: 'PENDING',
    size: 'md',
  }
)

const logoSrc = computed(() => {
  const logos: Record<Platform, string> = {
    EBAY: '/logos/ebay.svg',
    VINTED: '/logos/vinted.jpg',
    SUBITO: '/logos/subito.png',
    FACEBOOK_MARKETPLACE: '/logos/facebook-marketplace.svg',
  }
  return logos[props.platform]
})

const sizeClasses = computed(() => {
  return {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  }[props.size]
})

const roundedClasses = computed(() => {
  if (props.platform === 'EBAY') return 'rounded-full'
  return 'rounded-xl'
})

const imgPadding = computed(() => {
  if (props.platform === 'EBAY') return 'p-1'
  return ''
})

const statusClasses = computed(() => {
  if (props.status === 'ERROR') return 'ring-2 ring-red-500 ring-offset-1'
  if (props.status === 'PENDING') return 'opacity-50 grayscale'
  if (props.status === 'REMOVED') return 'opacity-30'
  return ''
})

const platformLabel = computed(() => {
  const labels: Record<Platform, string> = {
    EBAY: 'eBay',
    VINTED: 'Vinted',
    SUBITO: 'Subito',
    FACEBOOK_MARKETPLACE: 'Facebook Marketplace',
  }
  return labels[props.platform] || props.platform
})

const statusLabel = computed(() => {
  const labels: Record<PublicationStatus, string> = {
    PENDING: 'In attesa',
    PUBLISHED: 'Pubblicato',
    ERROR: 'Errore',
    REMOVED: 'Rimosso',
  }
  return labels[props.status] || props.status
})
</script>
