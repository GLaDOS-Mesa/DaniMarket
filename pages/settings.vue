<template>
  <main id="main-content" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Impostazioni</h1>
      <p class="mt-1 text-gray-600">Gestisci le piattaforme collegate al tuo account</p>
    </div>

    <!-- Connected platforms section -->
    <section aria-labelledby="platforms-heading">
      <h2 id="platforms-heading" class="text-lg font-semibold text-gray-900 mb-4">Piattaforme collegate</h2>

      <!-- eBay card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-start gap-4">
          <!-- eBay logo -->
          <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50">
            <img
              src="/logos/ebay.svg"
              alt="eBay"
              class="w-8 h-8"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
            />
            <span
              class="hidden w-8 h-8 items-center justify-center text-sm font-bold text-blue-600"
              aria-hidden="true"
            >
              eB
            </span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h3 class="text-base font-semibold text-gray-900">eBay</h3>
              <span
                v-if="ebayStatus?.connected"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
                Collegato
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
              >
                Non collegato
              </span>
            </div>

            <!-- Connected state -->
            <template v-if="ebayStatus?.connected">
              <p v-if="ebayStatus.ebayUsername" class="text-sm text-gray-600">
                Account: <span class="font-medium text-gray-900">{{ ebayStatus.ebayUsername }}</span>
              </p>
              <p v-if="ebayStatus.refreshTokenExpiresAt" class="text-sm text-gray-500 mt-1">
                Token valido fino al {{ formatDate(ebayStatus.refreshTokenExpiresAt) }}
              </p>
            </template>

            <!-- Disconnected state -->
            <template v-else>
              <p class="text-sm text-gray-600">
                Collega il tuo account eBay per pubblicare annunci direttamente dalla dashboard
              </p>
            </template>
          </div>

          <!-- Actions -->
          <div class="flex-shrink-0">
            <a
              v-if="!ebayStatus?.connected"
              href="/api/ebay/auth"
              class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Collega eBay
            </a>
            <button
              v-else
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-300 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              @click="showDisconnectModal = true"
            >
              Scollega
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Disconnect confirmation modal -->
    <Teleport to="body">
      <div
        v-if="showDisconnectModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disconnect-title"
      >
        <div class="fixed inset-0 bg-black/50" @click="showDisconnectModal = false"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 id="disconnect-title" class="text-lg font-semibold text-gray-900 mb-2">
            Scollega account eBay
          </h3>
          <p class="text-sm text-gray-600 mb-6">
            Sei sicuro di voler scollegare il tuo account eBay? Dovrai riautorizzare l'accesso per pubblicare nuovi annunci.
          </p>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              @click="showDisconnectModal = false"
            >
              Annulla
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              :disabled="disconnecting"
              @click="disconnectEbay"
            >
              {{ disconnecting ? 'Scollegamento...' : 'Scollega' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Impostazioni - DaniMarket',
})

const toast = useToast()
const route = useRoute()

const showDisconnectModal = ref(false)
const disconnecting = ref(false)

// Fetch eBay connection status
const { data: ebayStatusData, refresh: refreshStatus } = await useAsyncData('ebay-status', () =>
  $fetch('/api/ebay/status')
)

const ebayStatus = computed(() => ebayStatusData.value?.data)

// Handle OAuth callback query params
onMounted(() => {
  const ebayResult = route.query.ebay as string | undefined
  if (ebayResult === 'success') {
    toast.success('Account eBay collegato con successo')
    refreshStatus()
  } else if (ebayResult === 'error') {
    const message = (route.query.message as string) || 'Errore durante il collegamento'
    toast.error(message)
  }
})

// Disconnect eBay account
async function disconnectEbay() {
  disconnecting.value = true
  try {
    await $fetch('/api/ebay/disconnect', { method: 'POST' })
    toast.success('Account eBay scollegato')
    showDisconnectModal.value = false
    await refreshStatus()
  } catch {
    toast.error('Errore durante lo scollegamento')
  } finally {
    disconnecting.value = false
  }
}

// Format date helper
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>
