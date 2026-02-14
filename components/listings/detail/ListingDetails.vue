<template>
  <section
    class="bg-white rounded-xl shadow-sm p-6"
    aria-labelledby="description-heading"
  >
    <h2
      id="description-heading"
      class="text-lg font-semibold text-gray-900 mb-4"
    >
      Descrizione
    </h2>

    <!-- Edit Mode -->
    <div
      v-if="isEditMode"
      class="space-y-2"
    >
      <div class="relative">
        <textarea
          id="edit-description"
          :value="workingDescription"
          rows="6"
          class="w-full px-3 py-2 border rounded-lg text-gray-900 resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          :class="textareaClasses"
          :aria-invalid="!!error"
          :aria-describedby="error ? 'description-error' : 'description-hint'"
          placeholder="Descrivi il tuo articolo..."
          @input="$emit('update', ($event.target as HTMLTextAreaElement).value)"
        />
        <span class="absolute right-3 bottom-3 text-xs text-gray-400">
          {{ workingDescription?.length || 0 }} caratteri
        </span>
      </div>
      <p
        v-if="error"
        id="description-error"
        class="text-sm text-red-600"
        role="alert"
      >
        {{ error }}
      </p>
      <p
        v-else
        id="description-hint"
        class="text-sm text-gray-500"
      >
        Inserisci una descrizione dettagliata del prodotto
      </p>
    </div>

    <!-- View Mode -->
    <template v-else>
      <div
        v-if="description"
        class="prose prose-gray max-w-none"
      >
        <p class="text-gray-600 whitespace-pre-line leading-relaxed">
          {{ displayDescription }}
        </p>

        <!-- Show more/less button for long descriptions -->
        <button
          v-if="isLongDescription && !isExpanded"
          type="button"
          class="mt-2 text-primary-600 hover:text-primary-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
          @click="isExpanded = true"
        >
          Mostra tutto
        </button>
        <button
          v-else-if="isLongDescription && isExpanded"
          type="button"
          class="mt-2 text-primary-600 hover:text-primary-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
          @click="isExpanded = false"
        >
          Mostra meno
        </button>
      </div>

      <p
        v-else
        class="text-gray-400 italic"
      >
        Nessuna descrizione fornita
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  description: string
  isEditMode?: boolean
  workingDescription?: string
  isModified?: boolean
  error?: string
}>()

defineEmits<{
  (e: 'update', value: string): void
}>()

const MAX_LENGTH = 500
const isExpanded = ref(false)

const isLongDescription = computed(() => {
  return props.description.length > MAX_LENGTH
})

const displayDescription = computed(() => {
  if (!isLongDescription.value || isExpanded.value) {
    return props.description
  }
  return props.description.slice(0, MAX_LENGTH) + '...'
})

const textareaClasses = computed(() => {
  if (props.error) {
    return 'border-red-500 ring-1 ring-red-500'
  }
  if (props.isModified) {
    return 'ring-2 ring-amber-300 border-amber-400'
  }
  return 'border-gray-300'
})
</script>
