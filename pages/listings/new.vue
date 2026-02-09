<template>
  <div class="max-w-3xl mx-auto">
    <!-- Page header -->
    <div class="mb-6">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Torna alla dashboard
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Nuovo annuncio</h1>
    </div>

    <!-- Stepper -->
    <nav class="mb-8" aria-label="Progressi creazione annuncio">
      <ol class="flex items-center justify-between">
        <li
          v-for="(step, index) in steps"
          :key="step.id"
          class="flex items-center"
          :class="{ 'flex-1': index < steps.length - 1 }"
        >
          <button
            type="button"
            class="flex flex-col items-center group focus:outline-none"
            :class="{ 'cursor-not-allowed': !canGoToStep(step.id) }"
            :disabled="!canGoToStep(step.id)"
            :aria-current="currentStep === step.id ? 'step' : undefined"
            :aria-label="`${step.label}: ${getStepStatus(step.id)}`"
            :aria-disabled="!canGoToStep(step.id)"
            @click="handleStepClick(step.id)"
          >
            <span
              class="w-10 h-10 flex items-center justify-center rounded-full text-lg transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              :class="getStepClasses(step.id)"
            >
              <span v-if="isStepCompleted(step.id) && currentStep !== step.id" aria-hidden="true">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              <span v-else aria-hidden="true">{{ step.icon }}</span>
            </span>
            <span
              class="mt-2 text-xs font-medium hidden sm:block"
              :class="currentStep === step.id ? 'text-primary-600' : 'text-gray-500'"
            >
              {{ step.label }}
            </span>
          </button>

          <!-- Connector line -->
          <div
            v-if="index < steps.length - 1"
            class="flex-1 h-0.5 mx-2"
            :class="isStepCompleted(step.id) ? 'bg-primary-600' : 'bg-gray-200'"
            aria-hidden="true"
          />
        </li>
      </ol>
    </nav>

    <!-- Step content -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <Transition name="fade" mode="out-in">
        <ListingsStepPhotos v-if="currentStep === 1" key="step1" />
        <ListingsStepBasicInfo v-else-if="currentStep === 2" key="step2" />
        <ListingsStepDetails v-else-if="currentStep === 3" key="step3" />
        <ListingsStepShipping v-else-if="currentStep === 4" key="step4" />
        <ListingsStepPlatforms v-else-if="currentStep === 5" key="step5" />
      </Transition>
    </div>

    <!-- Navigation buttons -->
    <div class="flex justify-between gap-4">
      <button
        v-if="currentStep > 1"
        type="button"
        class="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="prevStep"
      >
        Indietro
      </button>
      <div v-else />

      <div class="flex gap-3">
        <button
          v-if="currentStep === totalSteps"
          type="button"
          class="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'"
          :disabled="isSaving"
          @click="handleSaveDraft"
        >
          <span v-if="isSaving" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Salvataggio...
          </span>
          <span v-else>Salva come bozza</span>
        </button>

        <button
          v-if="currentStep < totalSteps"
          type="button"
          class="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="canGoNext ? 'hover:bg-primary-700' : 'opacity-50 cursor-not-allowed'"
          :disabled="!canGoNext"
          :aria-disabled="!canGoNext"
          @click="nextStep"
        >
          Avanti
        </button>

        <button
          v-if="currentStep === totalSteps"
          type="button"
          class="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="canGoNext && !isSaving ? 'hover:bg-primary-700' : 'opacity-50 cursor-not-allowed'"
          :disabled="!canGoNext || isSaving"
          :aria-disabled="!canGoNext || isSaving"
          @click="handlePublish"
        >
          <span v-if="isSaving" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Pubblicazione...
          </span>
          <span v-else>Pubblica</span>
        </button>
      </div>
    </div>

    <!-- Validation errors (screen reader announcement) -->
    <div v-if="!canGoNext && Object.keys(stepValidation.errors).length > 0" class="sr-only" role="alert" aria-live="polite">
      Compila i campi obbligatori per procedere:
      {{ Object.values(stepValidation.errors).join(', ') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListingForm } from '~/composables/useListingForm'
import { useToast } from '~/composables/useToast'

const {
  currentStep,
  totalSteps,
  stepValidation,
  isStepCompleted,
  canGoNext,
  canGoToStep,
  goToStep,
  nextStep,
  prevStep,
  resetForm,
} = useListingForm()

const toast = useToast()

const isSaving = ref(false)

const steps = [
  { id: 1, label: 'Foto', icon: '📸' },
  { id: 2, label: 'Info', icon: '📝' },
  { id: 3, label: 'Dettagli', icon: '🏷️' },
  { id: 4, label: 'Spedizione', icon: '📦' },
  { id: 5, label: 'Pubblica', icon: '🚀' },
]

const handleStepClick = (stepId: number) => {
  if (canGoToStep(stepId)) {
    goToStep(stepId)
  }
}

const getStepClasses = (stepId: number): string => {
  if (currentStep.value === stepId) {
    return 'bg-primary-600 text-white'
  }
  if (isStepCompleted(stepId)) {
    return 'bg-green-100 text-green-600'
  }
  return 'bg-gray-100 text-gray-400'
}

const getStepStatus = (stepId: number): string => {
  if (currentStep.value === stepId) {
    return 'passaggio corrente'
  }
  if (isStepCompleted(stepId)) {
    return 'completato'
  }
  return 'da completare'
}

const handleSaveDraft = async () => {
  isSaving.value = true

  try {
    // TODO: Save listing to database with status DRAFT
    // await createListing({ status: ListingStatus.DRAFT })

    // On success: show toast, reset form and navigate to home
    toast.success('Bozza salvata con successo! Potrai completarla in seguito.')
    resetForm()
    navigateTo('/')
  } catch {
    // On error: show toast and stay on current step
    toast.error('Si è verificato un errore durante il salvataggio della bozza. Riprova.')
  } finally {
    isSaving.value = false
  }
}

const handlePublish = async () => {
  if (!canGoNext.value) return

  isSaving.value = true

  try {
    // TODO: Save listing to database with status ACTIVE and create platform publications
    // await createListing({ status: ListingStatus.ACTIVE })

    // On success: show toast, reset form and navigate to home
    toast.success('Annuncio pubblicato con successo! Sarà presto visibile sulle piattaforme selezionate.')
    resetForm()
    navigateTo('/')
  } catch {
    // On error: show toast and stay on current step
    toast.error('Si è verificato un errore durante la pubblicazione. Riprova.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
