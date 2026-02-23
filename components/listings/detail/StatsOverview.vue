<template>
  <section
    v-if="stats"
    class="bg-white rounded-xl shadow-sm p-6"
    aria-labelledby="stats-heading"
  >
    <h2
      id="stats-heading"
      class="text-lg font-semibold text-gray-900 mb-4"
    >
      Statistiche
    </h2>

    <div class="grid grid-cols-2 gap-4">
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <p class="text-2xl font-bold text-gray-900">{{ stats.totalViews ?? '—' }}</p>
        <p class="text-xs text-gray-500">Visualizzazioni</p>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <p class="text-2xl font-bold text-gray-900">{{ stats.favorites ?? '—' }}</p>
        <p class="text-xs text-gray-500">Preferiti</p>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <p class="text-2xl font-bold text-gray-900">{{ stats.messages ?? '—' }}</p>
        <p class="text-xs text-gray-500">Messaggi</p>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <p class="text-2xl font-bold text-gray-900">{{ stats.daysOnline ?? '—' }}</p>
        <p class="text-xs text-gray-500">Giorni online</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ListingStats } from '~/types/listing'

defineProps<{
  stats?: ListingStats
}>()
</script>
