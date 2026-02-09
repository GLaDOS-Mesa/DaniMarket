<template>
  <section
    class="bg-white rounded-xl shadow-sm p-6"
    aria-labelledby="gallery-heading"
  >
    <h2
      id="gallery-heading"
      class="text-lg font-semibold text-gray-900 mb-4"
    >
      Foto ({{ images.length }})
    </h2>

    <div
      v-if="images.length"
      class="space-y-4"
    >
      <!-- Main image -->
      <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
        <img
          :src="images[selectedIndex]"
          :alt="`Foto principale di ${title}`"
          class="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
          @click="$emit('openLightbox', selectedIndex)"
        />
      </div>

      <!-- Thumbnails -->
      <div
        v-if="images.length > 1"
        class="flex gap-2 overflow-x-auto pb-2"
        role="listbox"
        :aria-label="`Seleziona foto, ${images.length} disponibili`"
      >
        <button
          v-for="(image, index) in images"
          :key="index"
          type="button"
          role="option"
          class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
          :class="selectedIndex === index ? 'ring-2 ring-primary-500 ring-offset-2' : 'opacity-70 hover:opacity-100'"
          :aria-label="`Visualizza foto ${index + 1}`"
          :aria-selected="selectedIndex === index"
          @click="selectedIndex = index"
        >
          <img
            :src="image"
            :alt="`Foto ${index + 1} di ${title}`"
            class="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="aspect-square rounded-lg bg-gray-100 flex items-center justify-center"
    >
      <div class="text-center text-gray-400">
        <svg
          class="w-16 h-16 mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p>Nessuna foto caricata</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  images: string[]
  title: string
}>()

defineEmits<{
  (e: 'openLightbox', index: number): void
}>()

const selectedIndex = ref(0)

// Reset selected index when images change
watch(
  () => props.images,
  () => {
    selectedIndex.value = 0
  }
)
</script>
