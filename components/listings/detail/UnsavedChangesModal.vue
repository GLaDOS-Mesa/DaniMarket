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
        aria-labelledby="unsaved-modal-title"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50"
          aria-hidden="true"
          @click="$emit('cancel')"
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
            <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full">
              <svg
                class="w-6 h-6 text-amber-600"
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
              id="unsaved-modal-title"
              class="text-xl font-semibold text-gray-900 text-center mb-2"
            >
              Modifiche non salvate
            </h2>

            <!-- Message -->
            <p class="text-gray-500 text-center mb-4">
              Hai delle modifiche non salvate. Cosa vuoi fare?
            </p>

            <!-- Modified fields list -->
            <div
              v-if="modifiedFieldsList.length > 0"
              class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6"
            >
              <p class="text-sm text-amber-800 font-medium mb-2">
                Campi modificati:
              </p>
              <ul class="text-sm text-amber-700 space-y-1">
                <li
                  v-for="field in modifiedFieldsList"
                  :key="field"
                  class="flex items-center gap-2"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full bg-amber-400"
                    aria-hidden="true"
                  />
                  {{ field }}
                </li>
              </ul>
            </div>

            <!-- Actions -->
            <div class="space-y-3">
              <!-- Save and exit -->
              <button
                type="button"
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isSaving || !isValid"
                @click="$emit('saveAndExit')"
              >
                <span
                  v-if="isSaving"
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                {{ isSaving ? 'Salvataggio...' : 'Salva e esci' }}
              </button>

              <!-- Discard and exit -->
              <button
                type="button"
                class="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                :disabled="isSaving"
                @click="$emit('discardAndExit')"
              >
                Esci senza salvare
              </button>

              <!-- Cancel -->
              <button
                type="button"
                class="w-full px-4 py-2.5 text-gray-500 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                :disabled="isSaving"
                @click="$emit('cancel')"
              >
                Annulla
              </button>
            </div>

            <!-- Validation hint -->
            <p
              v-if="!isValid"
              class="mt-3 text-sm text-red-600 text-center"
            >
              Correggi gli errori per poter salvare
            </p>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  modifiedFieldsList: string[]
  isSaving?: boolean
  isValid?: boolean
}>()

defineEmits<{
  (e: 'saveAndExit'): void
  (e: 'discardAndExit'): void
  (e: 'cancel'): void
}>()
</script>
