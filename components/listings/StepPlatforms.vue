<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Piattaforme e riepilogo</h2>
    <p class="text-gray-500 mb-6">Seleziona dove vuoi pubblicare il tuo annuncio.</p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Platform selection -->
      <div>
        <fieldset>
          <legend class="block text-sm font-medium text-gray-700 mb-3">
            Piattaforme target <span class="text-red-500" aria-hidden="true">*</span>
          </legend>
          <div class="space-y-3" role="group">
            <label
              v-for="platform in availablePlatforms"
              :key="platform.value"
              class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors"
              :class="
                formData.platforms.includes(platform.value)
                  ? 'bg-primary-50 border-primary-500'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              "
            >
              <input
                type="checkbox"
                :value="platform.value"
                :checked="formData.platforms.includes(platform.value)"
                class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                @change="togglePlatform(platform.value)"
              />

              <!-- Platform logo -->
              <div class="flex-shrink-0">
                <PlatformLogo :platform="getPlatformLogoName(platform.value)" status="PUBLISHED" size="sm" />
              </div>

              <div class="flex-1 min-w-0">
                <span class="block font-medium text-gray-900">{{ platform.label }}</span>
              </div>

              <!-- Readiness badge -->
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="
                  getPlatformReadiness(platform.value).ready
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                "
              >
                {{ getPlatformReadiness(platform.value).ready ? 'Pronto' : 'Campi mancanti' }}
              </span>
            </label>
          </div>
          <p v-if="errors.platforms" class="mt-2 text-sm text-red-600" role="alert">
            {{ errors.platforms }}
          </p>
        </fieldset>

        <!-- Missing fields info -->
        <div v-if="selectedPlatformsWithMissingFields.length > 0" class="mt-4 p-4 bg-orange-50 rounded-lg">
          <h4 class="font-medium text-orange-800 mb-2">Campi mancanti per alcune piattaforme:</h4>
          <ul class="text-sm text-orange-700 space-y-1">
            <li v-for="platform in selectedPlatformsWithMissingFields" :key="platform.value">
              <strong>{{ platform.label }}:</strong>
              {{ platform.missingFields.map(getFieldLabel).join(', ') }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Preview -->
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-3">Anteprima annuncio</h3>
        <ListingsListingPreview />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListingForm } from '~/composables/useListingForm'
import { Platform, platformLabels } from '~/types/listing'

const { formData, stepValidation, getPlatformReadiness } = useListingForm()

const errors = computed(() => stepValidation.value.errors)

const availablePlatforms = computed(() => {
  return Object.entries(platformLabels).map(([value, label]) => ({
    value: value as Platform,
    label,
  }))
})

const togglePlatform = (platform: Platform) => {
  const index = formData.value.platforms.indexOf(platform)
  if (index === -1) {
    formData.value.platforms.push(platform)
  } else {
    formData.value.platforms.splice(index, 1)
  }
}

const getPlatformLogoName = (platform: Platform): 'EBAY' | 'VINTED' | 'SUBITO' | 'FACEBOOK_MARKETPLACE' => {
  const mapping: Record<Platform, 'EBAY' | 'VINTED' | 'SUBITO' | 'FACEBOOK_MARKETPLACE'> = {
    [Platform.EBAY]: 'EBAY',
    [Platform.VINTED]: 'VINTED',
    [Platform.SUBITO]: 'SUBITO',
    [Platform.FACEBOOK]: 'FACEBOOK_MARKETPLACE',
  }
  return mapping[platform]
}

const selectedPlatformsWithMissingFields = computed(() => {
  return formData.value.platforms
    .map((platform) => {
      const readiness = getPlatformReadiness(platform)
      return {
        value: platform,
        label: platformLabels[platform],
        missingFields: readiness.missingFields,
      }
    })
    .filter((p) => p.missingFields.length > 0)
})

const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    title: 'titolo',
    photos: 'foto',
    description: 'descrizione',
    price: 'prezzo',
    category: 'categoria',
    condition: 'condizioni',
    brand: 'marca',
    size: 'taglia',
    city: 'comune',
    province: 'provincia',
  }
  return labels[field] || field
}
</script>
