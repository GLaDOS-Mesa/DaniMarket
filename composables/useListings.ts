import type { ListingSummary } from '~/types/listing'
import { ListingStatus } from '~/types/listing'

/**
 * Composable for the dashboard listing list.
 * Manages listings state, filtering and deletion.
 */
export function useListings() {
  const { get, del } = useApi()
  const toast = useToast()

  const listings = ref<ListingSummary[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)
  const activeFilter = ref<string>('all')

  async function fetchListings(filters?: { status?: string; search?: string }) {
    pending.value = true
    error.value = null
    try {
      const params: Record<string, string> = {}
      if (filters?.status && filters.status !== 'all') {
        params.status = filters.status
      }
      if (filters?.search) {
        params.search = filters.search
      }
      const data = await get<ListingSummary[]>('/api/listings', params)
      // Prisma Decimal fields are serialized as strings in JSON — convert to numbers
      listings.value = data.map((l) => ({ ...l, price: Number(l.price) }))
    } catch (err: any) {
      const message = err?.data?.error || err?.message || 'Errore nel caricamento degli annunci'
      error.value = message
      toast.error(message)
    } finally {
      pending.value = false
    }
  }

  async function deleteListing(id: string) {
    try {
      await del(`/api/listings/${id}`)
      listings.value = listings.value.filter((l) => l.id !== id)
      toast.success('Annuncio eliminato con successo')
    } catch (err: any) {
      const message = err?.data?.error || err?.message || 'Errore nell\'eliminazione'
      toast.error(message)
    }
  }

  const filteredListings = computed(() => {
    if (activeFilter.value === 'all') return listings.value
    return listings.value.filter((l) => l.status === activeFilter.value)
  })

  const filterCounts = computed(() => ({
    all: listings.value.length,
    [ListingStatus.ACTIVE]: listings.value.filter((l) => l.status === ListingStatus.ACTIVE).length,
    [ListingStatus.DRAFT]: listings.value.filter((l) => l.status === ListingStatus.DRAFT).length,
    [ListingStatus.SOLD]: listings.value.filter((l) => l.status === ListingStatus.SOLD).length,
  }))

  return {
    listings,
    pending,
    error,
    activeFilter,
    filteredListings,
    filterCounts,
    fetchListings,
    deleteListing,
  }
}
