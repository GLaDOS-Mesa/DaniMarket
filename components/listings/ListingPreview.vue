<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Image -->
    <div class="aspect-square bg-gray-100 relative">
      <img
        v-if="previewImageUrl"
        :src="previewImageUrl"
        alt="Anteprima foto"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400" aria-hidden="true">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <!-- Status badge -->
      <span class="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Bozza
      </span>

      <!-- Photo count -->
      <span
        v-if="formData.photos.length > 1"
        class="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-black bg-opacity-60 text-white"
      >
        +{{ formData.photos.length - 1 }} foto
      </span>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="font-medium text-gray-900 truncate">
        {{ formData.title || 'Titolo annuncio' }}
      </h3>

      <p class="text-lg font-bold text-primary-600 mt-1">
        {{ formattedPrice }}
      </p>

      <!-- Category and condition -->
      <div class="flex flex-wrap gap-2 mt-3">
        <span
          v-if="categoryLabel"
          class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
        >
          {{ categoryLabel }}
        </span>
        <span
          v-if="conditionLabel"
          class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
        >
          {{ conditionLabel }}
        </span>
      </div>

      <!-- Location -->
      <div v-if="formData.location" class="flex items-center gap-1 mt-3 text-sm text-gray-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
        {{ formData.location }}
      </div>

      <!-- Shipping badge -->
      <div v-if="formData.shippingAvailable" class="flex items-center gap-1 mt-2 text-sm text-green-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        {{ shippingLabel }}
      </div>

      <!-- Platform logos -->
      <div v-if="formData.platforms.length > 0" class="flex gap-1.5 mt-4 pt-4 border-t border-gray-100">
        <PlatformLogo
          v-for="platform in formData.platforms"
          :key="platform"
          :platform="getPlatformLogoName(platform)"
          status="PENDING"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListingForm } from '~/composables/useListingForm'
import { Platform, categoryLabels, conditionLabels } from '~/types/listing'

const { formData } = useListingForm()

const previewImageUrl = computed(() => {
  if (formData.value.photos.length > 0) {
    return URL.createObjectURL(formData.value.photos[0])
  }
  return null
})

const formattedPrice = computed(() => {
  if (formData.value.price !== null && formData.value.price > 0) {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(formData.value.price)
  }
  return '€ 0,00'
})

const categoryLabel = computed(() => {
  if (formData.value.category) {
    return categoryLabels[formData.value.category]
  }
  return null
})

const conditionLabel = computed(() => {
  if (formData.value.condition) {
    return conditionLabels[formData.value.condition]
  }
  return null
})

const shippingLabel = computed(() => {
  if (formData.value.shippingCost !== null && formData.value.shippingCost > 0) {
    return `Spedizione: €${formData.value.shippingCost.toFixed(2)}`
  }
  return 'Spedizione gratuita'
})

const getPlatformLogoName = (platform: Platform): 'EBAY' | 'VINTED' | 'SUBITO' | 'FACEBOOK_MARKETPLACE' => {
  const mapping: Record<Platform, 'EBAY' | 'VINTED' | 'SUBITO' | 'FACEBOOK_MARKETPLACE'> = {
    [Platform.EBAY]: 'EBAY',
    [Platform.VINTED]: 'VINTED',
    [Platform.SUBITO]: 'SUBITO',
    [Platform.FACEBOOK]: 'FACEBOOK_MARKETPLACE',
  }
  return mapping[platform]
}

// Clean up object URL when component unmounts
onUnmounted(() => {
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
  }
})
</script>
