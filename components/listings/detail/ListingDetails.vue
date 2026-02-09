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
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  description: string
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
</script>
