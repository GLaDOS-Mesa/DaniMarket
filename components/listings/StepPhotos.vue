<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Foto dell'articolo</h2>
    <p class="text-gray-500 mb-4">Carica da 1 a 6 foto. La prima sarà l'immagine di copertina.</p>

    <!-- Duplicate warning -->
    <div
      v-if="isDuplicating"
      class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3"
      role="alert"
    >
      <svg
        class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <div>
        <p class="text-amber-800 font-medium">Le foto non vengono copiate</p>
        <p class="text-amber-700 text-sm mt-1">Carica le foto per il nuovo annuncio.</p>
      </div>
    </div>

    <!-- Drop zone -->
    <div
      class="border-2 border-dashed rounded-xl p-8 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      :class="[
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400',
        hasError ? 'border-red-300 bg-red-50' : '',
      ]"
      role="button"
      tabindex="0"
      :aria-label="dropzoneLabel"
      :aria-describedby="hasError ? 'photo-error' : undefined"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
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
      />

      <div class="flex flex-col items-center">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          :class="isDragging ? 'bg-primary-100' : 'bg-gray-100'"
          aria-hidden="true"
        >
          <svg
            class="w-8 h-8"
            :class="isDragging ? 'text-primary-600' : 'text-gray-400'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <p class="text-gray-700 font-medium mb-1">
          {{ isDragging ? 'Rilascia le foto qui' : 'Trascina le foto qui' }}
        </p>
        <p class="text-gray-500 text-sm">oppure clicca per selezionarle</p>
        <p class="text-gray-400 text-xs mt-2">{{ formData.photos.length }}/6 foto caricate</p>
      </div>
    </div>
    <p class="sr-only" role="status" aria-live="polite">
      {{ formData.photos.length }} foto caricate.
    </p>

    <!-- Error message -->
    <p v-if="hasError" id="photo-error" class="mt-2 text-sm text-red-600" role="alert">
      {{ stepValidation.errors.photos }}
    </p>

    <!-- Photo previews -->
    <div v-if="formData.photos.length > 0" class="mt-6">
      <h3 class="text-sm font-medium text-gray-700 mb-3">
        Foto caricate
        <span class="text-gray-400 font-normal">(trascina per riordinare)</span>
      </h3>

      <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
        <div
          v-for="(photo, index) in photosPreviews"
          :key="index"
          class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
          :class="{ 'ring-2 ring-primary-500 ring-offset-2': index === 0 }"
          draggable="true"
          :aria-label="`Foto ${index + 1}${index === 0 ? ' (copertina)' : ''}: ${photo.name}`"
          @dragstart="handleDragStart(index, $event)"
          @dragend="handleDragEnd"
          @dragover.prevent="handleDragOver(index)"
          @drop.prevent="handlePhotoDrop(index)"
        >
          <img
            :src="photo.url"
            :alt="`Foto ${index + 1}`"
            class="w-full h-full object-cover transition-transform"
            :style="{ transform: `rotate(${photo.displayRotation}deg)` }"
            draggable="false"
          />

          <!-- Cover badge -->
          <span
            v-if="index === 0"
            class="absolute top-1 left-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded"
            aria-hidden="true"
          >
            Copertina
          </span>

          <!-- Remove button -->
          <button
            type="button"
            class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            :aria-label="`Rimuovi foto ${index + 1}`"
            @click.stop="removePhoto(index)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Rotation control -->
          <button
            type="button"
            class="absolute bottom-1 right-1 w-7 h-7 bg-white/90 text-gray-700 rounded-full shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            :aria-label="`Ruota foto ${index + 1} di 90 gradi`"
            draggable="false"
            @click.stop="rotatePhoto(index)"
            @pointerdown.stop
            @mousedown.stop
            @dragstart.stop.prevent
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
              <path d="M22 12l-3 3-3-3" />
              <path d="M2 12l3-3 3 3" />
              <path d="M19.016 14v-1.95A7.05 7.05 0 0 0 8 6.22" />
              <path d="M16.016 17.845A7.05 7.05 0 0 1 5 12.015V10" />
              <path stroke-linecap="round" d="M5 10V9" />
              <path stroke-linecap="round" d="M19 15v-1" />
            </svg>
          </button>

          <!-- Drag handle overlay -->
          <div
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-colors cursor-grab active:cursor-grabbing pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListingForm } from '~/composables/useListingForm'

const { formData, stepValidation, isDuplicating, addPhoto, setPhotoRotation, removePhoto, reorderPhotos } = useListingForm()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const draggedIndex = ref<number | null>(null)
const isPhotoDragging = ref(false)
const suppressRotateClickUntil = ref(0)

const hasError = computed(() => !!stepValidation.value.errors.photos)

const dropzoneLabel = computed(() => {
  if (formData.value.photos.length >= 6) {
    return 'Limite massimo di 6 foto raggiunto'
  }
  return 'Clicca o trascina le foto per caricarle. Minimo 1, massimo 6 foto.'
})

const photosPreviews = computed(() => {
  return formData.value.photos.map((photo) => ({
    url: URL.createObjectURL(photo.file),
    name: photo.file.name,
    displayRotation: photo.displayRotation,
  }))
})

const openFilePicker = () => {
  if (formData.value.photos.length < 6) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addPhotosFromFileList(target.files)
    target.value = '' // Reset input to allow re-selecting same files
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    addPhotosFromFileList(event.dataTransfer.files)
  }
}

const addPhotosFromFileList = (files: FileList) => {
  const remaining = 6 - formData.value.photos.length
  const filesToAdd = Array.from(files)
    .filter((file) => file.type.startsWith('image/'))
    .slice(0, remaining)

  filesToAdd.forEach((file) => addPhoto(file))
}

const handleDragStart = (index: number, event: DragEvent) => {
  draggedIndex.value = index
  isPhotoDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragOver = (_index: number) => {
  // Visual feedback could be added here
}

const handlePhotoDrop = (targetIndex: number) => {
  if (draggedIndex.value !== null && draggedIndex.value !== targetIndex) {
    reorderPhotos(draggedIndex.value, targetIndex)
  }
  // Prevent synthetic click fired by browser right after dropping.
  suppressRotateClickUntil.value = Date.now() + 250
  draggedIndex.value = null
  isPhotoDragging.value = false
}

const handleDragEnd = () => {
  suppressRotateClickUntil.value = Date.now() + 250
  draggedIndex.value = null
  isPhotoDragging.value = false
}

const rotatePhoto = (index: number) => {
  if (isPhotoDragging.value || Date.now() < suppressRotateClickUntil.value) return
  const photo = formData.value.photos[index]
  if (!photo) return
  const nextDisplayRotation = photo.displayRotation + 90
  const nextRotation = (nextDisplayRotation % 360) as 0 | 90 | 180 | 270
  setPhotoRotation(index, nextRotation, nextDisplayRotation)
}

// Clean up object URLs when component unmounts
onUnmounted(() => {
  photosPreviews.value.forEach((preview) => {
    URL.revokeObjectURL(preview.url)
  })
})
</script>
