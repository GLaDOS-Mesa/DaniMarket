<template>
  <section
    class="bg-white rounded-xl shadow-sm p-6"
    aria-labelledby="gallery-heading"
  >
    <h2
      id="gallery-heading"
      class="text-lg font-semibold text-gray-900 mb-4"
    >
      Foto ({{ displayImages.length }}/6)
    </h2>

    <!-- Edit Mode -->
    <div
      v-if="isEditMode"
      class="space-y-4"
    >
      <!-- Drop zone for adding photos -->
      <div
        class="border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        :class="getDropzoneClasses()"
        role="button"
        tabindex="0"
        :aria-label="dropzoneLabel"
        :aria-describedby="error ? 'gallery-error' : undefined"
        @dragover.prevent="isDraggingNew = true"
        @dragleave.prevent="isDraggingNew = false"
        @drop.prevent="handleDrop"
        @click="openFilePicker"
        @keydown.enter="openFilePicker"
        @keydown.space.prevent="openFilePicker"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          aria-hidden="true"
          @change="handleFileSelect"
        >

        <div class="flex flex-col items-center">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            :class="isDraggingNew ? 'bg-primary-100' : 'bg-gray-100'"
            aria-hidden="true"
          >
            <svg
              class="w-6 h-6"
              :class="isDraggingNew ? 'text-primary-600' : 'text-gray-400'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <p class="text-gray-700 font-medium text-sm">
            {{ isDraggingNew ? 'Rilascia le foto qui' : 'Aggiungi foto' }}
          </p>
          <p class="text-gray-400 text-xs mt-1">Trascina o clicca per selezionare</p>
        </div>
      </div>

      <!-- Error message -->
      <p
        v-if="error"
        id="gallery-error"
        class="text-sm text-red-600"
        role="alert"
      >
        {{ error }}
      </p>

      <!-- Photo grid (drag-to-reorder) -->
      <div
        v-if="displayImages.length > 0"
        class="space-y-3"
      >
        <p class="text-sm text-gray-500">
          Trascina le foto per riordinarle. La prima sarà l'immagine di copertina.
        </p>

        <div
          class="grid grid-cols-3 sm:grid-cols-4 gap-3"
          :class="isModified ? 'ring-2 ring-amber-300 rounded-lg p-2' : ''"
        >
          <div
            v-for="(image, index) in displayImages"
            :key="index"
            class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-grab active:cursor-grabbing"
            :class="{ 'ring-2 ring-primary-500 ring-offset-2': index === 0 }"
            draggable="true"
            :aria-label="`Foto ${index + 1}${index === 0 ? ' (copertina)' : ''}`"
            @dragstart="handleDragStart(index, $event)"
            @dragend="handleDragEnd"
            @dragover.prevent="handleDragOver(index)"
            @drop.prevent="handlePhotoDrop(index)"
          >
            <img
              :src="image"
              :alt="`Foto ${index + 1}`"
              class="w-full h-full object-cover"
              draggable="false"
            >

            <!-- Cover badge -->
            <span
              v-if="index === 0"
              class="absolute top-1 left-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded"
              aria-hidden="true"
            >
              Copertina
            </span>

            <!-- Drag indicator -->
            <div
              v-if="dragOverIndex === index && draggedIndex !== index"
              class="absolute inset-0 border-2 border-primary-500 bg-primary-50 bg-opacity-30 rounded-lg"
              aria-hidden="true"
            />

            <!-- Remove button -->
            <button
              type="button"
              class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              :aria-label="`Rimuovi foto ${index + 1}`"
              @click.stop="$emit('remove', index)"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <!-- Drag handle overlay -->
            <div
              class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-colors pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <!-- Empty state in edit mode -->
      <div
        v-if="displayImages.length === 0"
        class="text-center py-8 text-gray-400"
      >
        <svg
          class="w-12 h-12 mx-auto mb-2"
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
        <p>Nessuna foto. Aggiungi almeno una foto.</p>
      </div>
    </div>

    <!-- View Mode -->
    <template v-else>
      <div
        v-if="photos.length"
        class="space-y-4"
      >
        <!-- Main image -->
        <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img
            :src="photos[selectedIndex]?.url"
            :alt="`Foto principale di ${title}`"
            class="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
            @click="$emit('openLightbox', selectedIndex)"
          >
        </div>

        <!-- Thumbnails -->
        <div
          v-if="photos.length > 1"
          class="flex gap-2 overflow-x-auto pb-2"
          role="listbox"
          :aria-label="`Seleziona foto, ${photos.length} disponibili`"
        >
          <button
            v-for="(photo, index) in photos"
            :key="photo.id"
            type="button"
            role="option"
            class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
            :class="selectedIndex === index ? 'ring-2 ring-primary-500 ring-offset-2' : 'opacity-70 hover:opacity-100'"
            :aria-label="`Visualizza foto ${index + 1}`"
            :aria-selected="selectedIndex === index"
            @click="selectedIndex = index"
          >
            <img
              :src="photo.url"
              :alt="`Foto ${index + 1} di ${title}`"
              class="w-full h-full object-cover"
            >
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
    </template>
  </section>
</template>

<script setup lang="ts">
import type { Photo } from '~/types/listing'

const props = defineProps<{
  photos: Photo[]
  title: string
  // Edit mode props
  isEditMode?: boolean
  workingPhotos?: Photo[]
  isModified?: boolean
  error?: string
}>()

const emit = defineEmits<{
  (e: 'openLightbox', index: number): void
  (e: 'reorder', fromIndex: number, toIndex: number): void
  (e: 'remove', index: number): void
  (e: 'addPhotos', files: File[]): void
}>()

const selectedIndex = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)
const isDraggingNew = ref(false)
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// Display images based on mode (extract URLs from Photo objects)
const displayImages = computed(() => {
  const source = (props.isEditMode && props.workingPhotos) ? props.workingPhotos : props.photos
  return source.map(p => p.url)
})

const dropzoneLabel = computed(() => {
  if (displayImages.value.length >= 6) {
    return 'Limite massimo di 6 foto raggiunto'
  }
  return 'Clicca o trascina le foto per aggiungerle. Minimo 1, massimo 6 foto.'
})

const getDropzoneClasses = (): string => {
  const classes: string[] = []

  if (props.error) {
    classes.push('border-red-300 bg-red-50')
  } else if (isDraggingNew.value) {
    classes.push('border-primary-500 bg-primary-50')
  } else if (props.isModified) {
    classes.push('border-amber-400 bg-amber-50')
  } else {
    classes.push('border-gray-300 hover:border-gray-400')
  }

  if (displayImages.value.length >= 6) {
    classes.push('opacity-50 cursor-not-allowed')
  }

  return classes.join(' ')
}

const openFilePicker = () => {
  if (displayImages.value.length < 6) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addPhotosFromFileList(target.files)
    target.value = '' // Reset input
  }
}

const handleDrop = (event: DragEvent) => {
  isDraggingNew.value = false
  if (event.dataTransfer?.files) {
    addPhotosFromFileList(event.dataTransfer.files)
  }
}

const addPhotosFromFileList = (files: FileList) => {
  const remaining = 6 - displayImages.value.length
  const filesToAdd = Array.from(files)
    .filter((file) => file.type.startsWith('image/'))
    .slice(0, remaining)

  if (filesToAdd.length > 0) {
    emit('addPhotos', filesToAdd)
  }
}

// Drag-to-reorder handlers
const handleDragStart = (index: number, event: DragEvent) => {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragOver = (index: number) => {
  dragOverIndex.value = index
}

const handlePhotoDrop = (targetIndex: number) => {
  if (draggedIndex.value !== null && draggedIndex.value !== targetIndex) {
    emit('reorder', draggedIndex.value, targetIndex)
  }
  draggedIndex.value = null
  dragOverIndex.value = null
}

const handleDragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = null
}

// Reset selected index when photos change
watch(
  () => props.photos,
  () => {
    selectedIndex.value = 0
  }
)
</script>
