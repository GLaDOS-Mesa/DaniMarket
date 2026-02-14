<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Skip link for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      Vai al contenuto principale
    </a>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center min-h-[50vh]"
        role="status"
        aria-live="polite"
      >
        <div class="text-center">
          <div
            class="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"
            aria-hidden="true"
          />
          <p class="text-gray-500">Caricamento annuncio...</p>
        </div>
      </div>

      <!-- Error state: listing not found -->
      <div
        v-else-if="!listing"
        class="text-center py-16"
        role="alert"
      >
        <div
          class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          <svg
            class="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Annuncio non trovato</h1>
        <p class="text-gray-500 mb-6">L'annuncio che stai cercando non esiste o è stato eliminato.</p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg px-2 py-1"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Torna alla dashboard
        </NuxtLink>
      </div>

      <!-- Main content -->
      <main
        v-else
        id="main-content"
      >
        <!-- Header -->
        <ListingsDetailListingHeader :listing="listing" />

        <!-- Two-column layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left column (2/3 width on desktop) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Photo Gallery -->
            <ListingsDetailListingGallery
              :images="listing.images"
              :title="listing.title"
              :is-edit-mode="isEditMode"
              :working-images="workingCopy?.images"
              :is-modified="modifiedFields.has('images')"
              :error="validationErrors.images"
              @open-lightbox="handleOpenLightbox"
              @reorder="handleImageReorder"
              @remove="handleImageRemove"
              @add-photos="handleImageAdd"
            />

            <!-- Basic Info Card -->
            <ListingsDetailListingBasicInfo
              :listing="listing"
              :is-edit-mode="isEditMode"
              :working-copy="workingCopy || undefined"
              :modified-fields="modifiedFields"
              :errors="validationErrors"
              @update="handleFieldUpdate"
            />

            <!-- Description Card -->
            <ListingsDetailListingDetails
              :description="listing.description"
              :is-edit-mode="isEditMode"
              :working-description="workingCopy?.description"
              :is-modified="modifiedFields.has('description')"
              :error="validationErrors.description"
              @update="(value: string) => handleFieldUpdate('description', value)"
            />

            <!-- Shipping Card -->
            <ListingsDetailListingShipping
              :city="listing.city"
              :province="listing.province"
              :shipping-available="listing.shippingAvailable"
              :shipping-cost="listing.shippingCost"
              :package-size="listing.packageSize"
              :currency="listing.currency"
              :is-edit-mode="isEditMode"
              :working-city="workingCopy?.city"
              :working-province="workingCopy?.province"
              :working-shipping-available="workingCopy?.shippingAvailable"
              :working-shipping-cost="workingCopy?.shippingCost"
              :working-package-size="workingCopy?.packageSize"
              :modified-fields="modifiedFields"
              :errors="validationErrors"
              @update="handleFieldUpdate"
            />
          </div>

          <!-- Right column (1/3 width on desktop) -->
          <div class="space-y-6">
            <!-- Action Bar -->
            <ListingsDetailActionBar
              :status="listing.status"
              :is-publishing="isPublishing"
              :is-edit-mode="isEditMode"
              :has-changes="hasChanges"
              :is-valid="isValid"
              @edit="handleEdit"
              @save="handleSave"
              @cancel="handleCancel"
              @publish="handlePublish"
              @duplicate="handleDuplicate"
              @delete="showDeleteModal = true"
            />

            <!-- Platforms Card -->
            <ListingsDetailPlatformStatusSection
              :publications="listing.publications"
              @add-platform="handleAddPlatform"
            />

            <!-- Stats Card -->
            <ListingsDetailStatsOverview :stats="listing.stats" />

            <!-- Activity Timeline -->
            <ListingsDetailActivityTimeline :activities="listing.activityLog" />
          </div>
        </div>
      </main>
    </div>

    <!-- Delete confirmation modal -->
    <ListingsDetailDeleteConfirmModal
      :is-open="showDeleteModal"
      :listing-title="listing?.title || ''"
      :published-platforms="publishedPlatformNames"
      :is-deleting="isDeleting"
      @close="showDeleteModal = false"
      @confirm="handleDeleteConfirm"
    />

    <!-- Unsaved changes modal -->
    <ListingsDetailUnsavedChangesModal
      :is-open="showUnsavedModal"
      :modified-fields-list="modifiedFieldsList"
      :is-saving="isSavingFromModal"
      :is-valid="isValid"
      @save-and-exit="handleSaveAndExit"
      @discard-and-exit="handleDiscardAndExit"
      @cancel="showUnsavedModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Listing } from '~/types/listing'
import { ListingStatus, PlatformPublicationStatus, platformLabels } from '~/types/listing'
import { useListingsApi } from '~/composables/useListingsApi'
import { useToast } from '~/composables/useToast'
import { useListingDetail } from '~/composables/useListingDetail'

const route = useRoute()
const router = useRouter()
const { getById, update, remove } = useListingsApi()
const { success, error } = useToast()

// Edit mode state
const {
  isEditMode,
  workingCopy,
  modifiedFields,
  hasChanges,
  isValid,
  validationErrors,
  enterEditMode,
  exitEditMode,
  updateField,
  discardChanges,
  getFieldLabel,
} = useListingDetail()

// State
const listing = ref<Listing | null>(null)
const isLoading = ref(true)
const isPublishing = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const showUnsavedModal = ref(false)
const isSavingFromModal = ref(false)
const pendingNavigation = ref<(() => void) | null>(null)

// Computed - list of modified field labels for the modal
const modifiedFieldsList = computed(() => {
  return Array.from(modifiedFields.value).map(field => getFieldLabel(field))
})

// Computed
const publishedPlatformNames = computed(() => {
  if (!listing.value) return []
  return listing.value.publications
    .filter(pub => pub.status === PlatformPublicationStatus.PUBLISHED)
    .map(pub => platformLabels[pub.platform])
})

// Load listing on mount
onMounted(async () => {
  const id = route.params.id as string
  const response = await getById(id)
  listing.value = response.data
  isLoading.value = false
})

// Lightbox handler (placeholder for future implementation)
const handleOpenLightbox = (index: number) => {
  // TODO: Implement lightbox modal in future sprint
  console.log('Open lightbox at index:', index)
}

// Action handlers
const handleEdit = () => {
  if (listing.value) {
    enterEditMode(listing.value)
  }
}

const handleSave = async () => {
  if (!listing.value || !workingCopy.value) return

  try {
    // For now, just simulate save and update local state
    // In production, this would call the API
    Object.assign(listing.value, workingCopy.value)
    exitEditMode()
    success('Modifiche salvate con successo!')
  } catch (err) {
    error('Errore durante il salvataggio')
  }
}

const handleCancel = () => {
  if (hasChanges.value) {
    showUnsavedModal.value = true
  } else {
    exitEditMode()
  }
}

const handleSaveAndExit = async () => {
  if (!listing.value || !workingCopy.value) return

  isSavingFromModal.value = true
  try {
    Object.assign(listing.value, workingCopy.value)
    exitEditMode()
    showUnsavedModal.value = false
    success('Modifiche salvate con successo!')

    // Execute pending navigation if any
    if (pendingNavigation.value) {
      pendingNavigation.value()
      pendingNavigation.value = null
    }
  } catch (err) {
    error('Errore durante il salvataggio')
  } finally {
    isSavingFromModal.value = false
  }
}

const handleDiscardAndExit = () => {
  discardChanges()
  exitEditMode()
  showUnsavedModal.value = false

  // Execute pending navigation if any
  if (pendingNavigation.value) {
    pendingNavigation.value()
    pendingNavigation.value = null
  }
}

const handleFieldUpdate = (field: string, value: unknown) => {
  updateField(field as keyof Listing, value as Listing[keyof Listing])
}

// Image handlers
const handleImageReorder = (fromIndex: number, toIndex: number) => {
  if (!workingCopy.value?.images) return

  const images = [...workingCopy.value.images]
  const [removed] = images.splice(fromIndex, 1)
  images.splice(toIndex, 0, removed)
  updateField('images', images)
}

const handleImageRemove = (index: number) => {
  if (!workingCopy.value?.images) return

  const images = [...workingCopy.value.images]
  images.splice(index, 1)
  updateField('images', images)
}

const handleImageAdd = async (files: File[]) => {
  if (!workingCopy.value?.images) return

  // In a real app, this would upload to Cloudinary and get URLs
  // For now, create object URLs for preview
  const newImageUrls = files.map(file => URL.createObjectURL(file))
  const images = [...workingCopy.value.images, ...newImageUrls].slice(0, 6)
  updateField('images', images)
}

const handleAddPlatform = () => {
  // TODO: Implement platform selection modal in future sprint
  success('Selezione piattaforma in arrivo!')
}

const handlePublish = async () => {
  if (!listing.value) return

  isPublishing.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update listing status
    const response = await update(listing.value.id, { status: ListingStatus.ACTIVE })
    if (response.data) {
      listing.value = response.data
      success('Annuncio pubblicato con successo!')
    }
  } catch (err) {
    error('Errore durante la pubblicazione')
  } finally {
    isPublishing.value = false
  }
}

const handleDuplicate = () => {
  if (!listing.value) return

  success('Annuncio duplicato — completa le foto e i dettagli')
  router.push(`/listings/new?duplicateFrom=${listing.value.id}`)
}

const handleDeleteConfirm = async () => {
  if (!listing.value) return

  isDeleting.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    await remove(listing.value.id)
    success('Annuncio eliminato con successo')

    // Redirect to dashboard
    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (err) {
    error('Errore durante l\'eliminazione')
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

// Navigation guard - prevent leaving with unsaved changes
onBeforeRouteLeave((_to, _from, next) => {
  if (isEditMode.value && hasChanges.value) {
    showUnsavedModal.value = true
    pendingNavigation.value = () => next()
    next(false)
  } else {
    next()
  }
})

// Page meta
useHead({
  title: computed(() => listing.value?.title || 'Caricamento...'),
})
</script>
