<template>
  <section
    class="bg-white rounded-xl shadow-sm p-6"
    aria-labelledby="shipping-heading"
  >
    <h2
      id="shipping-heading"
      class="text-lg font-semibold text-gray-900 mb-4"
    >
      Spedizione e ritiro
    </h2>

    <dl class="space-y-3">
      <!-- Location -->
      <div class="flex items-start gap-3">
        <svg
          class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <div>
          <dt class="text-sm text-gray-500">Località</dt>
          <dd class="text-gray-900 font-medium">{{ city }}, {{ province }}</dd>
        </div>
      </div>

      <!-- Shipping availability -->
      <div class="flex items-start gap-3">
        <svg
          class="w-5 h-5 mt-0.5 flex-shrink-0"
          :class="shippingAvailable ? 'text-green-500' : 'text-gray-400'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            v-if="shippingAvailable"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <div>
          <dt class="text-sm text-gray-500">Spedizione</dt>
          <dd class="text-gray-900 font-medium">
            <template v-if="shippingAvailable">
              Disponibile
              <span
                v-if="shippingCost"
                class="text-gray-500"
              >
                ({{ formattedShippingCost }})
              </span>
            </template>
            <template v-else>
              Solo ritiro in zona
            </template>
          </dd>
        </div>
      </div>

      <!-- Package size (conditional) -->
      <div
        v-if="shippingAvailable && packageSize"
        class="flex items-start gap-3"
      >
        <svg
          class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <div>
          <dt class="text-sm text-gray-500">Dimensione pacco</dt>
          <dd class="text-gray-900 font-medium">{{ packageSizeLabels[packageSize] }}</dd>
        </div>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { packageSizeLabels, type PackageSize } from '~/types/listing'

const props = defineProps<{
  city: string
  province: string
  shippingAvailable: boolean
  shippingCost: number | null
  packageSize: PackageSize | null
  currency?: string
}>()

const formattedShippingCost = computed(() => {
  if (!props.shippingCost) return ''
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: props.currency || 'EUR',
  }).format(props.shippingCost)
})
</script>
