<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Spedizione e località</h2>
    <p class="text-gray-500 mb-6">Indica dove si trova l'articolo e le opzioni di spedizione.</p>

    <div class="space-y-6">
      <!-- Comune with autocomplete -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="relative">
          <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
            Comune <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <div class="relative">
            <input
              id="city"
              v-model="cityQuery"
              type="text"
              autocomplete="off"
              class="w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              :class="errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'"
              placeholder="Inizia a digitare..."
              :aria-invalid="!!errors.city"
              :aria-describedby="errors.city ? 'city-error' : 'city-hint'"
              :aria-expanded="showSuggestions"
              aria-autocomplete="list"
              aria-controls="city-suggestions"
              @focus="onCityFocus"
              @blur="onCityBlur"
              @keydown.down.prevent="navigateSuggestions(1)"
              @keydown.up.prevent="navigateSuggestions(-1)"
              @keydown.enter.prevent="selectHighlightedCity"
              @keydown.escape="closeSuggestions"
            />
            <span
              v-if="isLoadingCities"
              class="absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
          </div>

          <!-- Autocomplete suggestions dropdown -->
          <Transition name="fade">
            <ul
              v-if="showSuggestions && citySuggestions.length > 0"
              id="city-suggestions"
              class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
              role="listbox"
            >
              <li
                v-for="(city, index) in citySuggestions"
                :key="`${city.nome}-${city.sigla}`"
                class="px-4 py-2.5 cursor-pointer transition-colors"
                :class="index === highlightedIndex ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'"
                role="option"
                :aria-selected="index === highlightedIndex"
                @mousedown.prevent="selectCity(city)"
                @mouseenter="highlightedIndex = index"
              >
                <span class="font-medium">{{ city.nome }}</span>
                <span class="text-gray-500"> ({{ city.sigla }}) - {{ city.regione }}</span>
              </li>
            </ul>
          </Transition>

          <p v-if="errors.city" id="city-error" class="mt-1 text-sm text-red-600" role="alert">
            {{ errors.city }}
          </p>
          <p v-else id="city-hint" class="mt-1 text-sm text-gray-500">
            Cerca il tuo comune
          </p>
        </div>

        <!-- Province (auto-filled) -->
        <div>
          <label for="province" class="block text-sm font-medium text-gray-700 mb-1">
            Provincia <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="province"
            :value="provinceDisplay"
            type="text"
            readonly
            class="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-gray-700"
            :class="errors.province ? 'border-red-300' : 'border-gray-300'"
            placeholder="Compilato automaticamente"
            :aria-invalid="!!errors.province"
            :aria-describedby="errors.province ? 'province-error' : 'province-hint'"
          />
          <p v-if="errors.province" id="province-error" class="mt-1 text-sm text-red-600" role="alert">
            {{ errors.province }}
          </p>
          <p v-else id="province-hint" class="mt-1 text-sm text-gray-500">
            Si compila selezionando il comune
          </p>
        </div>
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
import { useItalianCities } from '~/composables/useItalianCities'
import { PackageSize, packageSizeLabels } from '~/types/listing'
import type { ItalianCity } from '~/types/listing'

const { formData, stepValidation } = useListingForm()
const { searchCities, isLoading: isLoadingCities } = useItalianCities()

const touchedFields = ref<Set<string>>(new Set())

// Autocomplete state
const cityQuery = ref(formData.value.city)
const provinceDisplay = ref(formData.value.province) // Full display name for readonly field
const allCities = ref<ItalianCity[]>([]) // All results from API
const citySuggestions = ref<ItalianCity[]>([]) // Filtered results for display
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)
const hasLoadedCities = ref(false) // Track if API was called

// Watch for external changes to formData.city (e.g., from draft restore)
watch(() => formData.value.city, (newValue) => {
  if (newValue !== cityQuery.value) {
    cityQuery.value = newValue
  }
})

// Filter cities locally based on query
const filterCitiesLocally = (query: string) => {
  const normalizedQuery = query.toLowerCase().trim()
  const filtered = allCities.value.filter((city) =>
    city.nome.toLowerCase().includes(normalizedQuery) ||
    city.provincia.toLowerCase().includes(normalizedQuery) ||
    city.sigla.toLowerCase() === normalizedQuery
  )
  citySuggestions.value = filtered.slice(0, 10) // Limit to 10 results
  showSuggestions.value = filtered.length > 0
}

// Watch cityQuery for changes
watch(cityQuery, async (newQuery) => {
  highlightedIndex.value = -1

  // If user is typing something different from selected value, clear form
  if (formData.value.city && newQuery !== formData.value.city) {
    formData.value.city = ''
    formData.value.province = ''
    provinceDisplay.value = ''
  }

  // If less than 3 characters, reset everything
  if (newQuery.length < 3) {
    citySuggestions.value = []
    showSuggestions.value = false
    // Reset API flag if user clears the field
    if (newQuery.length === 0) {
      hasLoadedCities.value = false
      allCities.value = []
    }
    return
  }

  // If API not yet called, fetch cities
  if (!hasLoadedCities.value) {
    const results = await searchCities(newQuery)
    allCities.value = results
    hasLoadedCities.value = true
    filterCitiesLocally(newQuery)
  } else {
    // Filter locally
    filterCitiesLocally(newQuery)
  }
})

const onCityFocus = () => {
  if (citySuggestions.value.length > 0) {
    showSuggestions.value = true
  }
}

const onCityBlur = () => {
  // Delay to allow click on suggestion
  setTimeout(() => {
    showSuggestions.value = false
    touchedFields.value.add('city')
  }, 200)
}

const selectCity = (city: ItalianCity) => {
  formData.value.city = city.nome
  formData.value.province = city.sigla
  provinceDisplay.value = `${city.provincia} (${city.sigla})`
  cityQuery.value = city.nome
  showSuggestions.value = false
  citySuggestions.value = []
  allCities.value = []
  hasLoadedCities.value = false
  highlightedIndex.value = -1
}

const navigateSuggestions = (direction: number) => {
  if (!showSuggestions.value || citySuggestions.value.length === 0) return

  const newIndex = highlightedIndex.value + direction
  if (newIndex >= 0 && newIndex < citySuggestions.value.length) {
    highlightedIndex.value = newIndex
  }
}

const selectHighlightedCity = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < citySuggestions.value.length) {
    selectCity(citySuggestions.value[highlightedIndex.value])
  }
}

const closeSuggestions = () => {
  showSuggestions.value = false
  highlightedIndex.value = -1
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
