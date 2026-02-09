<template>
  <section
    class="bg-white rounded-xl shadow-sm p-6"
    aria-labelledby="activity-heading"
  >
    <h2
      id="activity-heading"
      class="text-lg font-semibold text-gray-900 mb-4"
    >
      Attività recenti
    </h2>

    <ul
      v-if="activities.length"
      class="space-y-3"
    >
      <li
        v-for="activity in displayedActivities"
        :key="activity.id"
        class="flex items-start gap-3 text-sm"
      >
        <span
          class="flex-shrink-0 text-lg"
          aria-hidden="true"
        >
          {{ activityActionIcons[activity.action] }}
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-gray-900">{{ activity.description }}</p>
          <p class="text-gray-500 text-xs">{{ formatRelativeDate(activity.timestamp) }}</p>
        </div>
      </li>
    </ul>

    <!-- Show more button -->
    <button
      v-if="activities.length > maxVisible && !isExpanded"
      type="button"
      class="mt-3 w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
      @click="isExpanded = true"
    >
      Mostra tutte ({{ activities.length }})
    </button>

    <!-- Show less button -->
    <button
      v-else-if="activities.length > maxVisible && isExpanded"
      type="button"
      class="mt-3 w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
      @click="isExpanded = false"
    >
      Mostra meno
    </button>

    <p
      v-if="!activities.length"
      class="text-gray-500 text-sm"
    >
      Nessuna attività registrata
    </p>
  </section>
</template>

<script setup lang="ts">
import { activityActionIcons } from '~/types/listing'
import type { ActivityLogEntry } from '~/types/listing'

const props = defineProps<{
  activities: ActivityLogEntry[]
  maxVisible?: number
}>()

const maxVisible = props.maxVisible ?? 5
const isExpanded = ref(false)

const displayedActivities = computed(() => {
  if (isExpanded.value) return props.activities
  return props.activities.slice(0, maxVisible)
})

const formatRelativeDate = (date: Date): string => {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Adesso'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min fa`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ore fa`
  if (diffInSeconds < 172800) return 'Ieri'
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} giorni fa`

  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
    year: then.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(then)
}
</script>
