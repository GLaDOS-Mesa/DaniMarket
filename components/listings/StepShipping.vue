<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Spedizione e località</h2>
    <p class="text-gray-500 mb-6">Indica dove si trova l'articolo e le opzioni di spedizione.</p>

    <div class="space-y-6">
      <!-- Location -->
      <div>
        <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
          Località <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="location"
          v-model="formData.location"
          type="text"
          class="w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          :class="errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          placeholder="es. Milano, 20121"
          :aria-invalid="!!errors.location"
          :aria-describedby="errors.location ? 'location-error' : 'location-hint'"
          @blur="touchField('location')"
        />
        <p v-if="errors.location" id="location-error" class="mt-1 text-sm text-red-600" role="alert">
          {{ errors.location }}
        </p>
        <p v-else id="location-hint" class="mt-1 text-sm text-gray-500">
          Inserisci la città o il CAP
        </p>
      </div>

      <!-- Shipping toggle -->
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <span class="font-medium text-gray-900">Disponibile per spedizione</span>
          <p class="text-sm text-gray-500">L'acquirente può ricevere l'articolo a casa</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="formData.shippingAvailable"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="formData.shippingAvailable ? 'bg-primary-600' : 'bg-gray-200'"
          @click="formData.shippingAvailable = !formData.shippingAvailable"
        >
          <span class="sr-only">Abilita spedizione</span>
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform"
            :class="formData.shippingAvailable ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Shipping options (shown when shipping is enabled) -->
      <Transition name="slide-fade">
        <div v-if="formData.shippingAvailable" class="space-y-6 pl-4 border-l-2 border-primary-200">
          <!-- Package size -->
          <fieldset>
            <legend class="block text-sm font-medium text-gray-700 mb-3">
              Dimensione pacco <span class="text-red-500" aria-hidden="true">*</span>
            </legend>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup">
              <label
                v-for="(label, key) in packageSizeLabels"
                :key="key"
                class="relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors"
                :class="
                  formData.packageSize === key
                    ? 'bg-primary-50 border-primary-500'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                "
              >
                <input
                  type="radio"
                  :value="key"
                  :checked="formData.packageSize === key"
                  class="sr-only"
                  :aria-describedby="`package-${key}-desc`"
                  @change="formData.packageSize = key as PackageSize"
                />
                <div class="flex-1">
                  <span
                    class="block font-medium"
                    :class="formData.packageSize === key ? 'text-primary-700' : 'text-gray-900'"
                  >
                    {{ getPackageSizeName(key as PackageSize) }}
                  </span>
                  <span
                    :id="`package-${key}-desc`"
                    class="block text-sm"
                    :class="formData.packageSize === key ? 'text-primary-600' : 'text-gray-500'"
                  >
                    {{ getPackageSizeWeight(key as PackageSize) }}
                  </span>
                </div>
                <span
                  v-if="formData.packageSize === key"
                  class="ml-2 text-primary-600"
                  aria-hidden="true"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              </label>
            </div>
            <p v-if="errors.packageSize" class="mt-2 text-sm text-red-600" role="alert">
              {{ errors.packageSize }}
            </p>
          </fieldset>

          <!-- Shipping cost -->
          <div>
            <label for="shippingCost" class="block text-sm font-medium text-gray-700 mb-1">
              Costo spedizione
              <span class="text-gray-400 font-normal">(facoltativo)</span>
            </label>
            <div class="relative">
              <span
                class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium"
                aria-hidden="true"
              >
                €
              </span>
              <input
                id="shippingCost"
                v-model.number="formData.shippingCost"
                type="number"
                min="0"
                step="0.01"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Gratuita se vuoto"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Lascia vuoto per spedizione gratuita
            </p>
          </div>
        </div>
      </Transition>

      <!-- Info about pickup -->
      <div class="flex items-start gap-3 p-4 bg-blue-50 rounded-lg" role="note">
        <svg
          class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
        <p class="text-sm text-blue-700">
          Il ritiro di persona nella tua località è sempre disponibile. L'acquirente potrà scegliere
          tra spedizione e ritiro al momento dell'acquisto.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListingForm } from '~/composables/useListingForm'
import { PackageSize, packageSizeLabels } from '~/types/listing'

const { formData, stepValidation } = useListingForm()

const touchedFields = ref<Set<string>>(new Set())

const touchField = (field: string) => {
  touchedFields.value.add(field)
}

const errors = computed(() => {
  const result: Record<string, string> = {}

  for (const [field, error] of Object.entries(stepValidation.value.errors)) {
    if (touchedFields.value.has(field)) {
      result[field] = error
    }
  }

  return result
})

const getPackageSizeName = (size: PackageSize): string => {
  const names: Record<PackageSize, string> = {
    [PackageSize.SMALL]: 'Piccolo',
    [PackageSize.MEDIUM]: 'Medio',
    [PackageSize.LARGE]: 'Grande',
  }
  return names[size]
}

const getPackageSizeWeight = (size: PackageSize): string => {
  const weights: Record<PackageSize, string> = {
    [PackageSize.SMALL]: '< 2 kg',
    [PackageSize.MEDIUM]: '2-5 kg',
    [PackageSize.LARGE]: '5-15 kg',
  }
  return weights[size]
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
