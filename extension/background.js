// Background service worker for DaniMarket Assistant
// Receives publish requests from the DaniMarket content script,
// stores the payload, and opens the target platform's listing page.

// Maps DaniMarket internal category to Subito inserimento URL params
const DANIMARKET_INTERNAL_TO_SUBITO = {
  'CLOTHING':    { category: 16 },
  'SHOES':       { category: 16, type: 5 },
  'ACCESSORIES': { category: 16, type: 6 },
  'ELECTRONICS': { category: 10 },
  'HOME':        { category: 14 },
  'SPORTS':      { category: 20 },
  'BOOKS_MEDIA': { category: 38 },
  'GAMES':       { category: 44 },
  'OTHER':       { category: 20 },
}

const DANIMARKET_TO_SUBITO_CATEGORY = {
  'Abbigliamento e Accessori': { category: 16 },
  'Elettronica':               { category: 10 },
  'Per la Casa e la Persona':  { category: 14 },
  'Sport e Hobby':             { category: 20 },
  'Libri e Riviste':           { category: 38 },
  'Console e Videogiochi':     { category: 44 },
  'Altro':                     { category: 20 },
}

function buildSubitoUrl(payload) {
  const internal = payload.internalCategory && DANIMARKET_INTERNAL_TO_SUBITO[payload.internalCategory]
  const mapped = DANIMARKET_TO_SUBITO_CATEGORY[payload.category]
  const subitoCategory = internal || mapped

  let url = 'https://inserimento.subito.it/'
  if (subitoCategory) {
    url += `?category=${subitoCategory.category}&from=vendere`
    if (subitoCategory.type) {
      url += `&type=${subitoCategory.type}`
    }
  }
  return url
}

function getPlatformUrl(payload) {
  switch (payload.platform) {
    case 'SUBITO': return buildSubitoUrl(payload)
    default: return null
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'PUBLISH_REQUEST') return false

  const { payload } = message
  const platformUrl = getPlatformUrl(payload)

  if (!platformUrl) {
    sendResponse({ success: false, error: `Piattaforma ${payload.platform} non supportata` })
    return false
  }

  // Store pending publish data and open the platform page
  chrome.storage.local.set({ pendingPublish: payload }, () => {
    chrome.tabs.create({ url: platformUrl }, () => {
      sendResponse({ success: true })
    })
  })

  // Return true to indicate we will send a response asynchronously
  return true
})
