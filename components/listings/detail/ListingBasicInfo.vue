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

    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
import { categoryLabels, conditionLabels, colorLabels, ListingColor } from '~/types/listing'

defineProps<{
  listing: Listing
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
</script>
