<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Informazioni base</h2>
    <p class="text-gray-500 mb-6">Inserisci le informazioni principali del tuo articolo.</p>

    <div class="space-y-6">
      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
          Titolo <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          maxlength="80"
          class="w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          :class="errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          placeholder="es. iPhone 13 Pro 256GB"
          :aria-invalid="!!errors.title"
          :aria-describedby="errors.title ? 'title-error' : 'title-hint'"
          @blur="touchField('title')"
        />
        <div class="flex justify-between mt-1">
          <p v-if="errors.title" id="title-error" class="text-sm text-red-600" role="alert">
            {{ errors.title }}
          </p>
          <p v-else id="title-hint" class="text-sm text-gray-500">
            Scegli un titolo chiaro e descrittivo
          </p>
          <span class="text-sm" :class="formData.title.length > 70 ? 'text-orange-500' : 'text-gray-400'">
            {{ formData.title.length }}/80
          </span>
        </div>
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Descrizione <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="description"
          v-model="formData.description"
          rows="4"
          class="w-full px-4 py-2.5 border rounded-lg transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          :class="errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          placeholder="Descrivi il tuo articolo in dettaglio: condizioni, caratteristiche, motivo della vendita..."
          :aria-invalid="!!errors.description"
          :aria-describedby="errors.description ? 'description-error' : 'description-hint'"
          @blur="touchField('description')"
        />
        <div class="flex justify-between mt-1">
          <p v-if="errors.description" id="description-error" class="text-sm text-red-600" role="alert">
            {{ errors.description }}
          </p>
          <p v-else id="description-hint" class="text-sm text-gray-500">
            Una buona descrizione aumenta le vendite
          </p>
          <span class="text-sm text-gray-400">
            {{ formData.description.length }} caratteri
          </span>
        </div>
      </div>

      <!-- Price -->
      <div>
        <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
          Prezzo <span class="text-red-500" aria-hidden="true">*</span>
        </label>
        <div class="relative">
          <span
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium"
            aria-hidden="true"
          >
            €
          </span>
          <input
            id="price"
            v-model.number="formData.price"
            type="number"
            min="0"
            step="0.01"
            class="w-full pl-10 pr-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :class="errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'"
            placeholder="0.00"
            :aria-invalid="!!errors.price"
            :aria-describedby="errors.price ? 'price-error' : undefined"
            @blur="touchField('price')"
          />
        </div>
        <p v-if="errors.price" id="price-error" class="mt-1 text-sm text-red-600" role="alert">
          {{ errors.price }}
        </p>
      </div>

      <!-- Category and Condition row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Category -->
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
            Categoria <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="category"
            v-model="formData.category"
            class="w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            :class="errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'"
            :aria-invalid="!!errors.category"
            :aria-describedby="errors.category ? 'category-error' : undefined"
            @blur="touchField('category')"
          >
            <option :value="null" disabled>Seleziona categoria</option>
            <option v-for="(label, value) in categoryLabels" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
          <p v-if="errors.category" id="category-error" class="mt-1 text-sm text-red-600" role="alert">
            {{ errors.category }}
          </p>
        </div>

        <!-- Condition -->
        <div>
          <label for="condition" class="block text-sm font-medium text-gray-700 mb-1">
            Condizioni <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="condition"
            v-model="formData.condition"
            class="w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            :class="errors.condition ? 'border-red-300 bg-red-50' : 'border-gray-300'"
            :aria-invalid="!!errors.condition"
            :aria-describedby="errors.condition ? 'condition-error' : undefined"
            @blur="touchField('condition')"
          >
            <option :value="null" disabled>Seleziona condizioni</option>
            <option v-for="(label, value) in conditionLabels" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
          <p v-if="errors.condition" id="condition-error" class="mt-1 text-sm text-red-600" role="alert">
            {{ errors.condition }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListingForm } from '~/composables/useListingForm'
import { categoryLabels, conditionLabels } from '~/types/listing'

const { formData, stepValidation } = useListingForm()

const touchedFields = ref<Set<string>>(new Set())

const touchField = (field: string) => {
  touchedFields.value.add(field)
}

const errors = computed(() => {
  const result: Record<string, string> = {}

  // Only show errors for touched fields
  for (const [field, error] of Object.entries(stepValidation.value.errors)) {
    if (touchedFields.value.has(field)) {
      result[field] = error
    }
  }

  return result
})
</script>
