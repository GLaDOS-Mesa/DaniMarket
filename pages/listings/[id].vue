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
              :photos="listing.photos"
              :title="listing.title"
              :is-edit-mode="isEditMode"
              :working-photos="workingCopy?.photos"
              :is-modified="modifiedFields.has('photos')"
              :error="validationErrors.photos"
              @open-lightbox="handleOpenLightbox"
              @reorder="handlePhotoReorder"
              @remove="handlePhotoRemove"
              @add-photos="handlePhotoAdd"
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
              :publications="listing.platformPublications"
              @add-platform="handleAddPlatform"
              @remove-platform="handleRemovePlatform"
              @publish-platform="handlePublishPlatform"
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
      :is-saving="isSaving"
      :is-valid="isValid"
      @save-and-exit="handleSaveAndExit"
      @discard-and-exit="handleDiscardAndExit"
      @cancel="showUnsavedModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Listing } from '~/types/listing'
import { PlatformPublicationStatus, platformLabels } from '~/types/listing'

const route = useRoute()

const {
  // Listing state
  listing,
  isLoading,
  isPublishing,
  isDeleting,
  isSaving,

  // Edit mode state
  isEditMode,
  workingCopy,
  modifiedFields,
  hasChanges,
  isValid,
  validationErrors,

  // Edit mode actions
  enterEditMode,
  exitEditMode,
  updateField,
  discardChanges,
  getFieldLabel,

  // API actions
  fetchListing,
  saveListing,
  publishListing,
  deleteListing,
  duplicateListing,
  addPlatform,
  removePlatform,
  publishPlatform,

  // Photo actions
  addPhotos,
  removePhoto,
  reorderPhotos,
} = useListingDetail()

// UI state (modals, navigation)
const showDeleteModal = ref(false)
const showUnsavedModal = ref(false)
const pendingNavigation = ref<(() => void) | null>(null)

// Computed
const modifiedFieldsList = computed(() => {
  return Array.from(modifiedFields.value).map(field => getFieldLabel(field))
})

const publishedPlatformNames = computed(() => {
  if (!listing.value) return []
  return listing.value.platformPublications
    .filter(pub => pub.status === PlatformPublicationStatus.PUBLISHED)
    .map(pub => platformLabels[pub.platform])
})

// Load listing on mount
onMounted(() => fetchListing(route.params.id as string))

// Lightbox handler (placeholder for future implementation)
const handleOpenLightbox = (_index: number) => {
  // TODO: Implement lightbox modal in future sprint
}

// Action handlers
const handleEdit = () => {
  if (listing.value) {
    enterEditMode(listing.value)
  }
}

const handleSave = () => saveListing()

const handleCancel = () => {
  if (hasChanges.value) {
    showUnsavedModal.value = true
  } else {
    exitEditMode()
  }
}

const handleSaveAndExit = async () => {
  await saveListing()
  showUnsavedModal.value = false

  if (pendingNavigation.value) {
    pendingNavigation.value()
    pendingNavigation.value = null
  }
}

const handleDiscardAndExit = () => {
  discardChanges()
  exitEditMode()
  showUnsavedModal.value = false

  if (pendingNavigation.value) {
    pendingNavigation.value()
    pendingNavigation.value = null
  }
}

const handleFieldUpdate = (field: string, value: unknown) => {
  updateField(field as keyof Listing, value as Listing[keyof Listing])
}

// Photo handlers
const handlePhotoReorder = (fromIndex: number, toIndex: number) => {
  if (!listing.value?.photos) return

  const photos = [...listing.value.photos]
  const [moved] = photos.splice(fromIndex, 1)
  photos.splice(toIndex, 0, moved)
  const orderedIds = photos.map(p => p.id)
  reorderPhotos(orderedIds)
}

const handlePhotoRemove = (index: number) => {
  if (!listing.value?.photos[index]) return
  removePhoto(listing.value.photos[index].id)
}

const handlePhotoAdd = (files: File[]) => {
  addPhotos(files)
}

const handleAddPlatform = (platform: string) => {
  addPlatform(platform)
}

const handleRemovePlatform = (platform: string) => {
  removePlatform(platform)
}

const handlePublishPlatform = (platform: string) => {
  publishPlatform(platform)
}

const handlePublish = () => publishListing()

const handleDuplicate = async () => {
  const newId = await duplicateListing()
  if (newId) navigateTo(`/listings/new?duplicateFrom=${newId}`)
}

const handleDeleteConfirm = async () => {
  const success = await deleteListing()
  if (success) {
    showDeleteModal.value = false
    navigateTo('/')
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
