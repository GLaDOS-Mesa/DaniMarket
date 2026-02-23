<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">I tuoi annunci</h1>
        <p class="text-gray-500 mt-1">Gestisci e pubblica i tuoi articoli</p>
      </div>

      <NuxtLink
        to="/listings/new"
        class="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuovo annuncio
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2" role="group" aria-label="Filtra annunci per stato">
      <button
        v-for="filter in filters"
        :key="filter.value"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        :class="
          activeFilter === filter.value
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100'
        "
        :aria-pressed="activeFilter === filter.value"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
        <span
          v-if="filter.count > 0"
          class="ml-1 px-1.5 py-0.5 text-xs rounded-full"
          :class="activeFilter === filter.value ? 'bg-primary-500' : 'bg-gray-200'"
          aria-hidden="true"
        >
          {{ filter.count }}
        </span>
        <span class="sr-only">({{ filter.count }} annunci)</span>
      </button>
    </div>

    <!-- Loading state -->
    <div
      v-if="pending"
      class="flex items-center justify-center py-16"
      role="status"
      aria-live="polite"
    >
      <div class="text-center">
        <div
          class="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-3"
          aria-hidden="true"
        />
        <p class="text-gray-500">Caricamento annunci...</p>
      </div>
    </div>

    <!-- Listings grid -->
    <div
      v-else-if="filteredListings.length"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      <ListingCard v-for="listing in filteredListings" :key="listing.id" :listing="listing" />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12" role="status" aria-live="polite">
      <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center" aria-hidden="true">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">Nessun annuncio</h3>
      <p class="text-gray-500 mb-4">Inizia creando il tuo primo annuncio</p>
      <NuxtLink
        to="/listings/new"
        class="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crea annuncio
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ListingStatus } from '~/types/listing'

const { pending, activeFilter, filteredListings, filterCounts, fetchListings } = useListings()

// Load listings on mount
onMounted(() => fetchListings())

// Computed
const filters = computed(() => [
  { label: 'Tutti', value: 'all', count: filterCounts.value.all },
  { label: 'Attivi', value: ListingStatus.ACTIVE, count: filterCounts.value[ListingStatus.ACTIVE] },
  { label: 'Bozze', value: ListingStatus.DRAFT, count: filterCounts.value[ListingStatus.DRAFT] },
  { label: 'Venduti', value: ListingStatus.SOLD, count: filterCounts.value[ListingStatus.SOLD] },
])
</script>
