<template>
  <section
    class="bg-white rounded-xl shadow-sm p-4 lg:p-6"
    aria-label="Azioni annuncio"
  >
    <!-- View mode actions -->
    <div class="flex flex-col gap-3">
      <!-- Primary action: Edit -->
      <button
        type="button"
        class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        :class="isSold
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-primary-600 text-white hover:bg-primary-700'"
        :disabled="isSold"
        :aria-disabled="isSold"
        @click="!isSold && $emit('edit')"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Modifica
      </button>

      <!-- Publish button (only for drafts) -->
      <button
        v-if="status === ListingStatus.DRAFT"
        type="button"
        class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        :disabled="isPublishing"
        @click="$emit('publish')"
      >
        <svg
          v-if="!isPublishing"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <span
          v-else
          class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
        {{ isPublishing ? 'Pubblicazione...' : 'Pubblica' }}
      </button>

      <!-- Secondary actions -->
      <div class="flex gap-2">
        <!-- Duplicate -->
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          @click="$emit('duplicate')"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Duplica
        </button>

        <!-- Delete -->
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          @click="$emit('delete')"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Elimina
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ListingStatus } from '~/types/listing'

const props = defineProps<{
  status: ListingStatus
  isPublishing?: boolean
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'publish'): void
  (e: 'duplicate'): void
  (e: 'delete'): void
}>()

const isSold = computed(() => props.status === ListingStatus.SOLD)
</script>
