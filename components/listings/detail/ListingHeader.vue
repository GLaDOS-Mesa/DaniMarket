<template>
  <header class="mb-6">
    <!-- Breadcrumb -->
    <nav
      class="mb-4"
      aria-label="Breadcrumb"
    >
      <ol class="flex items-center gap-2 text-sm">
        <li>
          <NuxtLink
            to="/"
            class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded transition-colors"
          >
            Dashboard
          </NuxtLink>
        </li>
        <li aria-hidden="true">
          <svg
            class="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </li>
        <li>
          <span
            class="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-[300px] inline-block"
            aria-current="page"
          >
            {{ listing.title }}
          </span>
        </li>
      </ol>
    </nav>

    <!-- Title and status -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            {{ listing.title }}
          </h1>
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
            :class="statusClasses"
          >
            {{ statusLabel }}
          </span>
        </div>

        <!-- Timestamps -->
        <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          <span class="flex items-center gap-1">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Creato il {{ formatDate(listing.createdAt) }}</span>
          </span>
          <span
            v-if="hasBeenUpdated"
            class="flex items-center gap-1"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Aggiornato il {{ formatDate(listing.updatedAt) }}</span>
          </span>
        </div>
      </div>

      <!-- Price badge (desktop) -->
      <div class="hidden sm:block">
        <div class="text-right">
          <p class="text-3xl font-bold text-primary-600">
            {{ formattedPrice }}
          </p>
          <p
            v-if="listing.shippingAvailable && listing.shippingCost"
            class="text-sm text-gray-500 mt-1"
          >
            + {{ formatShippingCost }} spedizione
          </p>
        </div>
      </div>
    </div>

    <!-- Price badge (mobile) -->
    <div class="sm:hidden mt-4 p-4 bg-primary-50 rounded-xl">
      <p class="text-2xl font-bold text-primary-600">
        {{ formattedPrice }}
      </p>
      <p
        v-if="listing.shippingAvailable && listing.shippingCost"
        class="text-sm text-gray-600 mt-1"
      >
        + {{ formatShippingCost }} spedizione
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Listing } from '~/types/listing'
import { ListingStatus, listingStatusLabels } from '~/types/listing'

const props = defineProps<{
  listing: Listing
}>()

// Status styling
const statusClasses = computed(() => {
  const classes: Record<ListingStatus, string> = {
    [ListingStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [ListingStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [ListingStatus.SOLD]: 'bg-blue-100 text-blue-800',
    [ListingStatus.ARCHIVED]: 'bg-orange-100 text-orange-800',
  }
  return classes[props.listing.status] || 'bg-gray-100 text-gray-800'
})

const statusLabel = computed(() => {
  return listingStatusLabels[props.listing.status] || props.listing.status
})

// Price formatting
const formattedPrice = computed(() => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(props.listing.price)
})

const formatShippingCost = computed(() => {
  if (!props.listing.shippingCost) return ''
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(props.listing.shippingCost)
})

// Date formatting
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

const hasBeenUpdated = computed(() => {
  const created = new Date(props.listing.createdAt).getTime()
  const updated = new Date(props.listing.updatedAt).getTime()
  // Consider updated if difference is more than 1 minute
  return updated - created > 60000
})
</script>
