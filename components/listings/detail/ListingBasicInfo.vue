<template>
  <section
    class="bg-white rounded-xl shadow-sm p-6"
    aria-labelledby="info-heading"
  >
    <h2
      id="info-heading"
      class="text-lg font-semibold text-gray-900 mb-4"
    >
      Informazioni
    </h2>

    <!-- Edit Mode -->
    <div
      v-if="isEditMode && workingCopy"
      class="space-y-4"
    >
      <!-- Title -->
      <div class="flex flex-col">
        <label
          for="edit-title"
          class="text-sm font-medium text-gray-700 mb-1"
        >
          Titolo <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            id="edit-title"
            type="text"
            :value="workingCopy.title"
            maxlength="80"
            class="w-full px-3 py-2 border rounded-lg text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            :class="getFieldClasses('title')"
            :aria-invalid="!!errors?.title"
            :aria-describedby="errors?.title ? 'title-error' : undefined"
            @input="$emit('update', 'title', ($event.target as HTMLInputElement).value)"
          >
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {{ workingCopy.title?.length || 0 }}/80
          </span>
        </div>
        <p
          v-if="errors?.title"
          id="title-error"
          class="mt-1 text-sm text-red-600"
          role="alert"
        >
          {{ errors.title }}
        </p>
      </div>

      <!-- Price -->
      <div class="flex flex-col">
        <label
          for="edit-price"
          class="text-sm font-medium text-gray-700 mb-1"
        >
          Prezzo <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
          <input
            id="edit-price"
            type="number"
            :value="workingCopy.price"
            min="0"
            step="0.01"
            class="w-full pl-8 pr-3 py-2 border rounded-lg text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            :class="getFieldClasses('price')"
            :aria-invalid="!!errors?.price"
            :aria-describedby="errors?.price ? 'price-error' : undefined"
            @input="$emit('update', 'price', parseFloat(($event.target as HTMLInputElement).value) || 0)"
          >
        </div>
        <p
          v-if="errors?.price"
          id="price-error"
          class="mt-1 text-sm text-red-600"
          role="alert"
        >
          {{ errors.price }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Category -->
        <div class="flex flex-col">
          <label
            for="edit-category"
            class="text-sm font-medium text-gray-700 mb-1"
          >
            Categoria <span class="text-red-500">*</span>
          </label>
          <select
            id="edit-category"
            :value="workingCopy.category"
            class="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            :class="getFieldClasses('category')"
            :aria-invalid="!!errors?.category"
            @change="$emit('update', 'category', ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="(label, value) in categoryLabels"
              :key="value"
              :value="value"
            >
              {{ label }}
            </option>
          </select>
          <p
            v-if="errors?.category"
            class="mt-1 text-sm text-red-600"
            role="alert"
          >
            {{ errors.category }}
          </p>
        </div>

        <!-- Condition -->
        <div class="flex flex-col">
          <label
            for="edit-condition"
            class="text-sm font-medium text-gray-700 mb-1"
          >
            Condizione <span class="text-red-500">*</span>
          </label>
          <select
            id="edit-condition"
            :value="workingCopy.condition"
            class="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            :class="getFieldClasses('condition')"
            :aria-invalid="!!errors?.condition"
            @change="$emit('update', 'condition', ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="(label, value) in conditionLabels"
              :key="value"
              :value="value"
            >
              {{ label }}
            </option>
          </select>
          <p
            v-if="errors?.condition"
            class="mt-1 text-sm text-red-600"
            role="alert"
          >
            {{ errors.condition }}
          </p>
        </div>
      </div>

      <!-- Brand (conditional) -->
      <div
        v-if="showBrand"
        class="flex flex-col"
      >
        <label
          for="edit-brand"
          class="text-sm font-medium text-gray-700 mb-1"
        >
          Brand <span
            v-if="workingCopy.category !== ListingCategory.OTHER"
            class="text-red-500"
          >*</span>
        </label>
        <input
          id="edit-brand"
          type="text"
          :value="workingCopy.brand"
          class="w-full px-3 py-2 border rounded-lg text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          :class="getFieldClasses('brand')"
          :aria-invalid="!!errors?.brand"
          :aria-describedby="errors?.brand ? 'brand-error' : undefined"
          @input="$emit('update', 'brand', ($event.target as HTMLInputElement).value)"
        >
        <p
          v-if="errors?.brand"
          id="brand-error"
          class="mt-1 text-sm text-red-600"
          role="alert"
        >
          {{ errors.brand }}
        </p>
      </div>

      <!-- Size (conditional) -->
      <div
        v-if="showSize"
        class="flex flex-col"
      >
        <label
          for="edit-size"
          class="text-sm font-medium text-gray-700 mb-1"
        >
          Taglia <span class="text-red-500">*</span>
        </label>
        <select
          id="edit-size"
          :value="workingCopy.size"
          class="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          :class="getFieldClasses('size')"
          :aria-invalid="!!errors?.size"
          @change="$emit('update', 'size', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Seleziona taglia</option>
          <option
            v-for="size in availableSizes"
            :key="size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
        <p
          v-if="errors?.size"
          class="mt-1 text-sm text-red-600"
          role="alert"
        >
          {{ errors.size }}
        </p>
      </div>

      <!-- Colors -->
      <div class="flex flex-col">
        <span class="text-sm font-medium text-gray-700 mb-2">Colori</span>
        <div
          class="flex flex-wrap gap-2 p-3 border rounded-lg transition-all duration-200"
          :class="isFieldModified('colors') ? 'ring-2 ring-amber-300 border-amber-400' : 'border-gray-300'"
        >
          <label
            v-for="(label, colorValue) in colorLabels"
            :key="colorValue"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors"
            :class="isColorSelected(colorValue as ListingColor)
              ? 'bg-primary-100 text-primary-800 ring-1 ring-primary-500'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            <input
              type="checkbox"
              :value="colorValue"
              :checked="isColorSelected(colorValue as ListingColor)"
              class="sr-only"
              @change="toggleColor(colorValue as ListingColor)"
            >
            <span
              class="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
              :style="{ backgroundColor: colorHex[colorValue as ListingColor] }"
              aria-hidden="true"
            />
            {{ label }}
          </label>
        </div>
      </div>

      <!-- Material (conditional) -->
      <div
        v-if="showMaterial"
        class="flex flex-col"
      >
        <label
          for="edit-material"
          class="text-sm font-medium text-gray-700 mb-1"
        >
          Materiale
        </label>
        <input
          id="edit-material"
          type="text"
          :value="workingCopy.material"
          class="w-full px-3 py-2 border rounded-lg text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          :class="getFieldClasses('material')"
          @input="$emit('update', 'material', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>

    <!-- View Mode -->
    <dl
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      <!-- Title & Price (view mode) -->
      <div class="flex flex-col sm:col-span-2">
        <dt class="text-sm text-gray-500">Titolo</dt>
        <dd class="text-gray-900 font-medium text-lg">{{ listing.title }}</dd>
      </div>

      <div class="flex flex-col">
        <dt class="text-sm text-gray-500">Prezzo</dt>
        <dd class="text-gray-900 font-medium text-lg">€ {{ listing.price?.toFixed(2) }}</dd>
      </div>

      <!-- Category -->
      <div class="flex flex-col">
        <dt class="text-sm text-gray-500">Categoria</dt>
        <dd class="text-gray-900 font-medium">{{ categoryLabels[listing.category] }}</dd>
      </div>

      <!-- Condition -->
      <div class="flex flex-col">
        <dt class="text-sm text-gray-500">Condizione</dt>
        <dd class="text-gray-900 font-medium">{{ conditionLabels[listing.condition] }}</dd>
      </div>

      <!-- Brand (conditional) -->
      <div
        v-if="listing.brand"
        class="flex flex-col"
      >
        <dt class="text-sm text-gray-500">Brand</dt>
        <dd class="text-gray-900 font-medium">{{ listing.brand }}</dd>
      </div>

      <!-- Size (conditional) -->
      <div
        v-if="listing.size"
        class="flex flex-col"
      >
        <dt class="text-sm text-gray-500">Taglia</dt>
        <dd class="text-gray-900 font-medium">{{ listing.size }}</dd>
      </div>

      <!-- Colors (conditional) -->
      <div
        v-if="listing.colors.length"
        class="flex flex-col sm:col-span-2"
      >
        <dt class="text-sm text-gray-500 mb-1">Colori</dt>
        <dd class="flex flex-wrap gap-2">
          <span
            v-for="color in listing.colors"
            :key="color"
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            <span
              class="w-3 h-3 rounded-full border border-gray-300"
              :style="{ backgroundColor: colorHex[color] }"
              aria-hidden="true"
            />
            {{ colorLabels[color] }}
          </span>
        </dd>
      </div>

      <!-- Material (conditional) -->
      <div
        v-if="listing.material"
        class="flex flex-col"
      >
        <dt class="text-sm text-gray-500">Materiale</dt>
        <dd class="text-gray-900 font-medium">{{ listing.material }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { Listing } from '~/types/listing'
import {
  categoryLabels,
  conditionLabels,
  colorLabels,
  ListingColor,
  ListingCategory,
  categoriesRequiringSize,
  categoriesWithMaterial,
  clothingSizes,
  shoeSizes,
} from '~/types/listing'

const props = defineProps<{
  listing: Listing
  isEditMode?: boolean
  workingCopy?: Partial<Listing>
  modifiedFields?: Set<string>
  errors?: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update', field: string, value: unknown): void
}>()

// Color hex values for visual swatches
const colorHex: Record<ListingColor, string> = {
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
  [ListingColor.MULTICOLOR]: 'linear-gradient(135deg, #EF4444, #F97316, #EAB308, #22C55E, #3B82F6, #A855F7)',
  [ListingColor.OTHER]: '#6B7280',
}

// Computed properties for conditional fields
const showBrand = computed(() => {
  const category = props.workingCopy?.category || props.listing.category
  return category !== ListingCategory.OTHER
})

const showSize = computed(() => {
  const category = props.workingCopy?.category || props.listing.category
  return categoriesRequiringSize.includes(category as ListingCategory)
})

const showMaterial = computed(() => {
  const category = props.workingCopy?.category || props.listing.category
  return categoriesWithMaterial.includes(category as ListingCategory)
})

const availableSizes = computed(() => {
  const category = props.workingCopy?.category || props.listing.category
  if (category === ListingCategory.SHOES) {
    return shoeSizes
  }
  return clothingSizes
})

// Helper functions
const isFieldModified = (field: string): boolean => {
  return props.modifiedFields?.has(field) ?? false
}

const getFieldClasses = (field: string): string => {
  const classes: string[] = []

  if (props.errors?.[field]) {
    classes.push('border-red-500 ring-1 ring-red-500')
  } else if (isFieldModified(field)) {
    classes.push('ring-2 ring-amber-300 border-amber-400')
  } else {
    classes.push('border-gray-300')
  }

  return classes.join(' ')
}

const isColorSelected = (color: ListingColor): boolean => {
  return props.workingCopy?.colors?.includes(color) ?? false
}

const toggleColor = (color: ListingColor): void => {
  const currentColors = [...(props.workingCopy?.colors || [])]
  const index = currentColors.indexOf(color)

  if (index === -1) {
    currentColors.push(color)
  } else {
    currentColors.splice(index, 1)
  }

  emit('update', 'colors', currentColors)
}
</script>
