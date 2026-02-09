<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50"
          aria-hidden="true"
          @click="$emit('close')"
        />

        <!-- Modal content -->
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-150"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <!-- Warning icon -->
            <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg
                class="w-6 h-6 text-red-600"
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
            </div>

            <!-- Title -->
            <h2
              id="modal-title"
              class="text-xl font-semibold text-gray-900 text-center mb-2"
            >
              Eliminare questo annuncio?
            </h2>

            <!-- Message -->
            <p class="text-gray-500 text-center mb-4">
              Questa azione è irreversibile. L'annuncio "{{ listingTitle }}" verrà eliminato definitivamente.
            </p>

            <!-- Platform warning -->
            <div
              v-if="publishedPlatforms.length"
              class="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6"
            >
              <p class="text-sm text-orange-800 font-medium mb-2">
                L'annuncio verrà rimosso da:
              </p>
              <ul class="text-sm text-orange-700 space-y-1">
                <li
                  v-for="platform in publishedPlatforms"
                  :key="platform"
                  class="flex items-center gap-2"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-orange-400" aria-hidden="true" />
                  {{ platform }}
                </li>
              </ul>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                :disabled="isDeleting"
                @click="$emit('close')"
              >
                Annulla
              </button>
              <button
                type="button"
                class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isDeleting"
                @click="$emit('confirm')"
              >
                <span
                  v-if="isDeleting"
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                {{ isDeleting ? 'Eliminazione...' : 'Elimina' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  listingTitle: string
  publishedPlatforms: string[]
  isDeleting?: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>
