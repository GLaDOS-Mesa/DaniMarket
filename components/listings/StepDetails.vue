<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Dettagli articolo</h2>
    <p class="text-gray-500 mb-6">Aggiungi informazioni specifiche per migliorare la visibilità.</p>

    <div class="space-y-6">
      <!-- Brand -->
      <Transition name="slide-fade">
        <div v-if="showBrand">
          <label for="brand" class="block text-sm font-medium text-gray-700 mb-1">
            Marca / Brand
            <span v-if="isBrandRequired" class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="brand"
            v-model="formData.brand"
            type="text"
            class="w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :class="errors.brand ? 'border-red-300 bg-red-50' : 'border-gray-300'"
            placeholder="es. Nike, Apple, IKEA..."
            :aria-invalid="!!errors.brand"
            :aria-describedby="errors.brand ? 'brand-error' : 'brand-hint'"
            @blur="touchField('brand')"
          />
          <p v-if="errors.brand" id="brand-error" class="mt-1 text-sm text-red-600" role="alert">
            {{ errors.brand }}
          </p>
          <p v-else id="brand-hint" class="mt-1 text-sm text-gray-500">
            Indica la marca per facilitare la ricerca
          </p>
        </div>
      </Transition>

      <!-- Size -->
      <Transition name="slide-fade">
        <div v-if="showSize">
          <label for="size" class="block text-sm font-medium text-gray-700 mb-1">
            Taglia
            <span v-if="isSizeRequired" class="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="size"
            v-model="formData.size"
            class="w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            :class="errors.size ? 'border-red-300 bg-red-50' : 'border-gray-300'"
            :aria-invalid="!!errors.size"
            :aria-describedby="errors.size ? 'size-error' : undefined"
            @blur="touchField('size')"
          >
            <option value="" disabled>Seleziona taglia</option>
            <option v-for="size in availableSizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
          <p v-if="errors.size" id="size-error" class="mt-1 text-sm text-red-600" role="alert">
            {{ errors.size }}
          </p>
        </div>
      </Transition>

      <!-- Colors -->
      <div>
        <fieldset>
          <legend class="block text-sm font-medium text-gray-700 mb-3">
            Colore
            <span class="text-gray-400 font-normal">(facoltativo, selezione multipla)</span>
          </legend>
          <div class="flex flex-wrap gap-2" role="group">
            <label
              v-for="(label, key) in colorLabels"
              :key="key"
              class="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors"
              :class="
                formData.colors.includes(key as ListingColor)
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              "
            >
              <input
                type="checkbox"
                :value="key"
                :checked="formData.colors.includes(key as ListingColor)"
                class="sr-only"
                @change="toggleColor(key as ListingColor)"
              />
              <span
                class="w-4 h-4 rounded-full border border-gray-300"
                :style="{ backgroundColor: getColorHex(key as ListingColor) }"
                aria-hidden="true"
              />
              {{ label }}
            </label>
          </div>
        </fieldset>
      </div>

      <!-- Material -->
      <Transition name="slide-fade">
        <div v-if="showMaterial">
          <label for="material" class="block text-sm font-medium text-gray-700 mb-1">
            Materiale
            <span class="text-gray-400 font-normal">(facoltativo)</span>
          </label>
          <input
            id="material"
            v-model="formData.material"
            type="text"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="es. Cotone, Pelle, Lana..."
          />
          <p class="mt-1 text-sm text-gray-500">
            Specifica il materiale principale
          </p>
        </div>
      </Transition>

      <!-- No category selected message -->
      <div
        v-if="!formData.category"
        class="text-center py-8 text-gray-500"
        role="status"
        aria-live="polite"
      >
        <p>Seleziona prima una categoria nello step precedente per visualizzare i campi specifici.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListingForm } from '~/composables/useListingForm'
import {
  ListingColor,
  ListingCategory,
  colorLabels,
  categoriesWithBrand,
  categoriesWithMaterial,
  categoriesRequiringSize,
  clothingSizes,
  shoeSizes,
} from '~/types/listing'

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

const showBrand = computed(() => {
  return formData.value.category && categoriesWithBrand.includes(formData.value.category)
})

const isBrandRequired = computed(() => {
  return formData.value.category !== ListingCategory.OTHER
})

const showSize = computed(() => {
  return formData.value.category && categoriesRequiringSize.includes(formData.value.category)
})

const isSizeRequired = computed(() => {
  return formData.value.category && categoriesRequiringSize.includes(formData.value.category)
})

const showMaterial = computed(() => {
  return formData.value.category && categoriesWithMaterial.includes(formData.value.category)
})

const availableSizes = computed(() => {
  if (formData.value.category === ListingCategory.CLOTHING) {
    return clothingSizes
  }
  if (formData.value.category === ListingCategory.SHOES) {
    return shoeSizes
  }
  return []
})

const toggleColor = (color: ListingColor) => {
  const index = formData.value.colors.indexOf(color)
  if (index === -1) {
    formData.value.colors.push(color)
  } else {
    formData.value.colors.splice(index, 1)
  }
}

const getColorHex = (color: ListingColor): string => {
  const colorMap: Record<ListingColor, string> = {
    [ListingColor.BLACK]: '#000000',
    [ListingColor.WHITE]: '#FFFFFF',
    [ListingColor.GREY]: '#9CA3AF',
    [ListingColor.BLUE]: '#3B82F6',
    [ListingColor.RED]: '#EF4444',
    [ListingColor.GREEN]: '#22C55E',
    [ListingColor.YELLOW]: '#EAB308',
    [ListingColor.PINK]: '#EC4899',
    [ListingColor.ORANGE]: '#F97316',
    [ListingColor.PURPLE]: '#A855F7',
    [ListingColor.BROWN]: '#92400E',
    [ListingColor.BEIGE]: '#D4C4A8',
    [ListingColor.MULTICOLOR]: 'linear-gradient(45deg, #EF4444, #F97316, #EAB308, #22C55E, #3B82F6, #A855F7)',
    [ListingColor.OTHER]: '#D1D5DB',
  }
  return colorMap[color]
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
