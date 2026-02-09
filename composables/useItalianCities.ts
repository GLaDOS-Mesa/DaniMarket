import type { ItalianCity } from '~/types/listing'

interface UseItalianCitiesReturn {
  searchCities: (query: string) => Promise<ItalianCity[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
}

// Cache for API results
const citiesCache = new Map<string, ItalianCity[]>()

export const useItalianCities = (): UseItalianCitiesReturn => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const searchCities = async (query: string): Promise<ItalianCity[]> => {
    if (!query || query.length < 2) {
      return []
    }

    const normalizedQuery = query.toLowerCase().trim()

    // Check cache first
    if (citiesCache.has(normalizedQuery)) {
      return citiesCache.get(normalizedQuery)!
    }

    isLoading.value = true
    error.value = null

    try {
      // Use the Italian government's open data API for comuni
      // API: https://axqvoqvbfjpaamphztgd.functions.supabase.co/comuni
      const response = await fetch(
        `https://axqvoqvbfjpaamphztgd.functions.supabase.co/comuni?search=${encodeURIComponent(query)}`
      )

      if (!response.ok) {
        throw new Error('Errore nel caricamento dei comuni')
      }

      const data = await response.json()

      // Transform API response to our format
      const cities: ItalianCity[] = data.map((item: {
        nome: string
        provincia: { nome: string; sigla: string; regione: string }
        cap: string
      }) => ({
        nome: item.nome,
        provincia: item.provincia.nome,
        sigla: item.provincia.sigla,
        regione: item.provincia.regione,
        cap: item.cap ? [item.cap] : [],
      }))

      // Cache the results
      citiesCache.set(normalizedQuery, cities)

      return cities
    } catch (err) {
      // Fallback to a static list of major Italian cities if API fails
      error.value = 'Utilizzo lista offline'
      return searchOfflineCities(normalizedQuery)
    } finally {
      isLoading.value = false
    }
  }

  return {
    searchCities,
    isLoading,
    error,
  }
}

// Fallback offline list of major Italian cities
const majorItalianCities: ItalianCity[] = [
  { nome: 'Roma', provincia: 'Roma', sigla: 'RM', regione: 'Lazio', cap: ['00100'] },
  { nome: 'Milano', provincia: 'Milano', sigla: 'MI', regione: 'Lombardia', cap: ['20100'] },
  { nome: 'Napoli', provincia: 'Napoli', sigla: 'NA', regione: 'Campania', cap: ['80100'] },
  { nome: 'Torino', provincia: 'Torino', sigla: 'TO', regione: 'Piemonte', cap: ['10100'] },
  { nome: 'Palermo', provincia: 'Palermo', sigla: 'PA', regione: 'Sicilia', cap: ['90100'] },
  { nome: 'Genova', provincia: 'Genova', sigla: 'GE', regione: 'Liguria', cap: ['16100'] },
  { nome: 'Bologna', provincia: 'Bologna', sigla: 'BO', regione: 'Emilia-Romagna', cap: ['40100'] },
  { nome: 'Firenze', provincia: 'Firenze', sigla: 'FI', regione: 'Toscana', cap: ['50100'] },
  { nome: 'Bari', provincia: 'Bari', sigla: 'BA', regione: 'Puglia', cap: ['70100'] },
  { nome: 'Catania', provincia: 'Catania', sigla: 'CT', regione: 'Sicilia', cap: ['95100'] },
  { nome: 'Venezia', provincia: 'Venezia', sigla: 'VE', regione: 'Veneto', cap: ['30100'] },
  { nome: 'Verona', provincia: 'Verona', sigla: 'VR', regione: 'Veneto', cap: ['37100'] },
  { nome: 'Messina', provincia: 'Messina', sigla: 'ME', regione: 'Sicilia', cap: ['98100'] },
  { nome: 'Padova', provincia: 'Padova', sigla: 'PD', regione: 'Veneto', cap: ['35100'] },
  { nome: 'Trieste', provincia: 'Trieste', sigla: 'TS', regione: 'Friuli-Venezia Giulia', cap: ['34100'] },
  { nome: 'Taranto', provincia: 'Taranto', sigla: 'TA', regione: 'Puglia', cap: ['74100'] },
  { nome: 'Brescia', provincia: 'Brescia', sigla: 'BS', regione: 'Lombardia', cap: ['25100'] },
  { nome: 'Parma', provincia: 'Parma', sigla: 'PR', regione: 'Emilia-Romagna', cap: ['43100'] },
  { nome: 'Prato', provincia: 'Prato', sigla: 'PO', regione: 'Toscana', cap: ['59100'] },
  { nome: 'Modena', provincia: 'Modena', sigla: 'MO', regione: 'Emilia-Romagna', cap: ['41100'] },
  { nome: 'Reggio Calabria', provincia: 'Reggio Calabria', sigla: 'RC', regione: 'Calabria', cap: ['89100'] },
  { nome: 'Reggio Emilia', provincia: 'Reggio Emilia', sigla: 'RE', regione: 'Emilia-Romagna', cap: ['42100'] },
  { nome: 'Perugia', provincia: 'Perugia', sigla: 'PG', regione: 'Umbria', cap: ['06100'] },
  { nome: 'Ravenna', provincia: 'Ravenna', sigla: 'RA', regione: 'Emilia-Romagna', cap: ['48100'] },
  { nome: 'Livorno', provincia: 'Livorno', sigla: 'LI', regione: 'Toscana', cap: ['57100'] },
  { nome: 'Cagliari', provincia: 'Cagliari', sigla: 'CA', regione: 'Sardegna', cap: ['09100'] },
  { nome: 'Foggia', provincia: 'Foggia', sigla: 'FG', regione: 'Puglia', cap: ['71100'] },
  { nome: 'Rimini', provincia: 'Rimini', sigla: 'RN', regione: 'Emilia-Romagna', cap: ['47900'] },
  { nome: 'Salerno', provincia: 'Salerno', sigla: 'SA', regione: 'Campania', cap: ['84100'] },
  { nome: 'Ferrara', provincia: 'Ferrara', sigla: 'FE', regione: 'Emilia-Romagna', cap: ['44100'] },
  { nome: 'Sassari', provincia: 'Sassari', sigla: 'SS', regione: 'Sardegna', cap: ['07100'] },
  { nome: 'Latina', provincia: 'Latina', sigla: 'LT', regione: 'Lazio', cap: ['04100'] },
  { nome: 'Giugliano in Campania', provincia: 'Napoli', sigla: 'NA', regione: 'Campania', cap: ['80014'] },
  { nome: 'Monza', provincia: 'Monza e Brianza', sigla: 'MB', regione: 'Lombardia', cap: ['20900'] },
  { nome: 'Siracusa', provincia: 'Siracusa', sigla: 'SR', regione: 'Sicilia', cap: ['96100'] },
  { nome: 'Pescara', provincia: 'Pescara', sigla: 'PE', regione: 'Abruzzo', cap: ['65100'] },
  { nome: 'Bergamo', provincia: 'Bergamo', sigla: 'BG', regione: 'Lombardia', cap: ['24100'] },
  { nome: 'Forlì', provincia: 'Forlì-Cesena', sigla: 'FC', regione: 'Emilia-Romagna', cap: ['47100'] },
  { nome: 'Trento', provincia: 'Trento', sigla: 'TN', regione: 'Trentino-Alto Adige', cap: ['38100'] },
  { nome: 'Vicenza', provincia: 'Vicenza', sigla: 'VI', regione: 'Veneto', cap: ['36100'] },
  { nome: 'Terni', provincia: 'Terni', sigla: 'TR', regione: 'Umbria', cap: ['05100'] },
  { nome: 'Bolzano', provincia: 'Bolzano', sigla: 'BZ', regione: 'Trentino-Alto Adige', cap: ['39100'] },
  { nome: 'Novara', provincia: 'Novara', sigla: 'NO', regione: 'Piemonte', cap: ['28100'] },
  { nome: 'Piacenza', provincia: 'Piacenza', sigla: 'PC', regione: 'Emilia-Romagna', cap: ['29100'] },
  { nome: 'Ancona', provincia: 'Ancona', sigla: 'AN', regione: 'Marche', cap: ['60100'] },
  { nome: 'Andria', provincia: 'Barletta-Andria-Trani', sigla: 'BT', regione: 'Puglia', cap: ['76123'] },
  { nome: 'Arezzo', provincia: 'Arezzo', sigla: 'AR', regione: 'Toscana', cap: ['52100'] },
  { nome: 'Udine', provincia: 'Udine', sigla: 'UD', regione: 'Friuli-Venezia Giulia', cap: ['33100'] },
  { nome: 'Cesena', provincia: 'Forlì-Cesena', sigla: 'FC', regione: 'Emilia-Romagna', cap: ['47521'] },
  { nome: 'Lecce', provincia: 'Lecce', sigla: 'LE', regione: 'Puglia', cap: ['73100'] },
]

function searchOfflineCities(query: string): ItalianCity[] {
  return majorItalianCities.filter(
    (city) =>
      city.nome.toLowerCase().includes(query) ||
      city.provincia.toLowerCase().includes(query) ||
      city.sigla.toLowerCase() === query
  ).slice(0, 10)
}
