<template>
  <section
    class="bg-white rounded-xl shadow-sm p-6"
    aria-labelledby="shipping-heading"
  >
    <h2
      id="shipping-heading"
      class="text-lg font-semibold text-gray-900 mb-4"
    >
      Spedizione e ritiro
    </h2>

    <!-- Edit Mode -->
    <div
      v-if="isEditMode"
      class="space-y-6"
    >
      <!-- City with autocomplete -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="relative">
          <label
            for="edit-city"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Comune <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              id="edit-city"
              v-model="cityQuery"
              type="text"
              autocomplete="off"
              class="w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="getCityFieldClasses()"
              placeholder="Inizia a digitare..."
              :aria-invalid="!!errors?.city"
              :aria-describedby="errors?.city ? 'city-error' : 'city-hint'"
              :aria-expanded="showSuggestions"
              aria-autocomplete="list"
              aria-controls="city-suggestions"
              @focus="onCityFocus"
              @blur="onCityBlur"
              @keydown.down.prevent="navigateSuggestions(1)"
              @keydown.up.prevent="navigateSuggestions(-1)"
              @keydown.enter.prevent="selectHighlightedCity"
              @keydown.escape="closeSuggestions"
            >
            <span
              v-if="isLoadingCities"
              class="absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <svg
                class="animate-spin h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          </div>

          <!-- Autocomplete dropdown -->
          <Transition name="fade">
            <ul
              v-if="showSuggestions && citySuggestions.length > 0"
              id="city-suggestions"
              class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
              role="listbox"
            >
              <li
                v-for="(cityItem, index) in citySuggestions"
                :key="`${cityItem.nome}-${cityItem.sigla}`"
                class="px-4 py-2.5 cursor-pointer transition-colors"
                :class="index === highlightedIndex ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'"
                role="option"
                :aria-selected="index === highlightedIndex"
                @mousedown.prevent="selectCity(cityItem)"
                @mouseenter="highlightedIndex = index"
              >
                <span class="font-medium">{{ cityItem.nome }}</span>
                <span class="text-gray-500"> ({{ cityItem.sigla }}) - {{ cityItem.regione }}</span>
              </li>
            </ul>
          </Transition>

          <p
            v-if="errors?.city"
            id="city-error"
            class="mt-1 text-sm text-red-600"
            role="alert"
          >
            {{ errors.city }}
          </p>
          <p
            v-else
            id="city-hint"
            class="mt-1 text-sm text-gray-500"
          >
            Cerca il tuo comune
          </p>
        </div>

        <!-- Province (readonly, auto-filled) -->
        <div>
          <label
            for="edit-province"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Provincia
          </label>
          <input
            id="edit-province"
            :value="workingProvince"
            type="text"
            readonly
            class="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 transition-all duration-200"
            :class="isFieldModified('province') ? 'ring-2 ring-amber-300 border-amber-400' : 'border-gray-300'"
            placeholder="Compilato automaticamente"
          >
          <p class="mt-1 text-sm text-gray-500">
            Si compila selezionando il comune
          </p>
        </div>
      </div>

      <!-- Shipping toggle -->
      <div
        class="flex items-center justify-between p-4 rounded-lg transition-all duration-200"
        :class="isFieldModified('shippingAvailable') ? 'bg-amber-50 ring-2 ring-amber-300' : 'bg-gray-50'"
      >
        <div>
          <span class="font-medium text-gray-900">Disponibile per spedizione</span>
          <p class="text-sm text-gray-500">L'acquirente può ricevere l'articolo a casa</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="workingShippingAvailable"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="workingShippingAvailable ? 'bg-primary-600' : 'bg-gray-200'"
          @click="toggleShipping"
        >
          <span class="sr-only">Abilita spedizione</span>
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform"
            :class="workingShippingAvailable ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Shipping options (shown when shipping is enabled) -->
      <Transition name="slide-fade">
        <div
          v-if="workingShippingAvailable"
          class="space-y-6 pl-4 border-l-2 border-primary-200"
        >
          <!-- Package size -->
          <fieldset>
            <legend class="block text-sm font-medium text-gray-700 mb-3">
              Dimensione pacco <span class="text-red-500">*</span>
            </legend>
            <div
              class="grid grid-cols-1 sm:grid-cols-3 gap-3"
              role="radiogroup"
            >
              <label
                v-for="(label, key) in packageSizeLabels"
                :key="key"
                class="relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200"
                :class="getPackageSizeClasses(key as PackageSize)"
              >
                <input
                  type="radio"
                  :value="key"
                  :checked="workingPackageSize === key"
                  class="sr-only"
                  :aria-describedby="`package-${key}-desc`"
                  @change="$emit('update', 'packageSize', key)"
                >
                <div class="flex-1">
                  <span
                    class="block font-medium"
                    :class="workingPackageSize === key ? 'text-primary-700' : 'text-gray-900'"
                  >
                    {{ getPackageSizeName(key as PackageSize) }}
                  </span>
                  <span
                    :id="`package-${key}-desc`"
                    class="block text-sm"
                    :class="workingPackageSize === key ? 'text-primary-600' : 'text-gray-500'"
                  >
                    {{ getPackageSizeWeight(key as PackageSize) }}
                  </span>
                </div>
                <span
                  v-if="workingPackageSize === key"
                  class="ml-2 text-primary-600"
                  aria-hidden="true"
                >
                  <svg
                    class="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              </label>
            </div>
            <p
              v-if="errors?.packageSize"
              class="mt-2 text-sm text-red-600"
              role="alert"
            >
              {{ errors.packageSize }}
            </p>
          </fieldset>

          <!-- Shipping cost -->
          <div>
            <label
              for="edit-shippingCost"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Costo spedizione
              <span class="text-gray-400 font-normal">(facoltativo)</span>
            </label>
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-hidden="true"
              >
                €
              </span>
              <input
                id="edit-shippingCost"
                :value="workingShippingCost"
                type="number"
                min="0"
                step="0.01"
                class="w-full pl-8 pr-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                :class="isFieldModified('shippingCost') ? 'ring-2 ring-amber-300 border-amber-400' : 'border-gray-300'"
                placeholder="Gratuita se vuoto"
                @input="$emit('update', 'shippingCost', parseFloat(($event.target as HTMLInputElement).value) || null)"
              >
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Lascia vuoto per spedizione gratuita
            </p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- View Mode -->
    <dl
      v-else
      class="space-y-3"
    >
      <!-- Location -->
      <div class="flex items-start gap-3">
        <svg
          class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
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
        <div>
          <dt class="text-sm text-gray-500">Località</dt>
          <dd class="text-gray-900 font-medium">{{ city }}, {{ province }}</dd>
        </div>
      </div>

      <!-- Shipping availability -->
      <div class="flex items-start gap-3">
        <svg
          class="w-5 h-5 mt-0.5 flex-shrink-0"
          :class="shippingAvailable ? 'text-green-500' : 'text-gray-400'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            v-if="shippingAvailable"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <div>
          <dt class="text-sm text-gray-500">Spedizione</dt>
          <dd class="text-gray-900 font-medium">
            <template v-if="shippingAvailable">
              Disponibile
              <span
                v-if="shippingCost"
                class="text-gray-500"
              >
                ({{ formattedShippingCost }})
              </span>
            </template>
            <template v-else>
              Solo ritiro in zona
            </template>
          </dd>
        </div>
      </div>

      <!-- Package size (conditional) -->
      <div
        v-if="shippingAvailable && packageSize"
        class="flex items-start gap-3"
      >
        <svg
          class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <div>
          <dt class="text-sm text-gray-500">Dimensione pacco</dt>
          <dd class="text-gray-900 font-medium">{{ packageSizeLabels[packageSize] }}</dd>
        </div>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { packageSizeLabels, PackageSize } from '~/types/listing'
import type { ItalianCity } from '~/types/listing'
import { useItalianCities } from '~/composables/useItalianCities'

const props = defineProps<{
  city: string
  province: string
  shippingAvailable: boolean
  shippingCost: number | null
  packageSize: PackageSize | null
  // Edit mode props
  isEditMode?: boolean
  workingCity?: string
  workingProvince?: string
  workingShippingAvailable?: boolean
  workingShippingCost?: number | null
  workingPackageSize?: PackageSize | null
  modifiedFields?: Set<string>
  errors?: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update', field: string, value: unknown): void
}>()

// City autocomplete
const { searchCities, isLoading: isLoadingCities } = useItalianCities()
const cityQuery = ref(props.workingCity || props.city)
const allCities = ref<ItalianCity[]>([])
const citySuggestions = ref<ItalianCity[]>([])
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)
const hasLoadedCities = ref(false)

// Watch for workingCity changes (when entering edit mode)
watch(() => props.workingCity, (newValue) => {
  if (newValue !== undefined && newValue !== cityQuery.value) {
    cityQuery.value = newValue
  }
})

// Filter cities locally
const filterCitiesLocally = (query: string) => {
  const normalizedQuery = query.toLowerCase().trim()
  const filtered = allCities.value.filter((city) =>
    city.nome.toLowerCase().includes(normalizedQuery) ||
    city.provincia.toLowerCase().includes(normalizedQuery) ||
    city.sigla.toLowerCase() === normalizedQuery
  )
  citySuggestions.value = filtered.slice(0, 10)
  showSuggestions.value = filtered.length > 0
}

// Watch cityQuery for autocomplete
watch(cityQuery, async (newQuery) => {
  if (!props.isEditMode) return

  highlightedIndex.value = -1

  // If user types something different, clear the selection
  if (props.workingCity && newQuery !== props.workingCity) {
    emit('update', 'city', newQuery)
    emit('update', 'province', '')
  }

  if (newQuery.length < 3) {
    citySuggestions.value = []
    showSuggestions.value = false
    if (newQuery.length === 0) {
      hasLoadedCities.value = false
      allCities.value = []
    }
    return
  }

  if (!hasLoadedCities.value) {
    const results = await searchCities(newQuery)
    allCities.value = results
    hasLoadedCities.value = true
    filterCitiesLocally(newQuery)
  } else {
    filterCitiesLocally(newQuery)
  }
})

const onCityFocus = () => {
  if (citySuggestions.value.length > 0) {
    showSuggestions.value = true
  }
}

const onCityBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const selectCity = (city: ItalianCity) => {
  emit('update', 'city', city.nome)
  emit('update', 'province', city.sigla)
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

const toggleShipping = () => {
  const newValue = !props.workingShippingAvailable
  emit('update', 'shippingAvailable', newValue)
  // Clear shipping-related fields if disabling
  if (!newValue) {
    emit('update', 'packageSize', null)
    emit('update', 'shippingCost', null)
  }
}

// Helper functions
const isFieldModified = (field: string): boolean => {
  return props.modifiedFields?.has(field) ?? false
}

const getCityFieldClasses = (): string => {
  if (props.errors?.city) {
    return 'border-red-500 ring-1 ring-red-500'
  }
  if (isFieldModified('city')) {
    return 'ring-2 ring-amber-300 border-amber-400'
  }
  return 'border-gray-300'
}

const getPackageSizeClasses = (size: PackageSize): string => {
  const isSelected = props.workingPackageSize === size
  const isModified = isFieldModified('packageSize')

  if (isSelected && isModified) {
    return 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
  }
  if (isSelected) {
    return 'bg-primary-50 border-primary-500'
  }
  return 'bg-white border-gray-300 hover:bg-gray-50'
}

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

const formattedShippingCost = computed(() => {
  if (!props.shippingCost) return ''
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(props.shippingCost)
})
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
