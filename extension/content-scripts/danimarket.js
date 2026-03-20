// Content script injected on DaniMarket pages
// Signals extension presence and listens for publish events

(function () {
  // Signal that the extension is installed
  document.documentElement.dataset.danimarketExtension = 'installed'
  document.documentElement.dataset.danimarketExtensionVersion = chrome.runtime.getManifest().version

  // Notify the page that the extension is ready
  window.dispatchEvent(new CustomEvent('danimarket:extension-ready', {
    detail: {
      version: chrome.runtime.getManifest().version,
      platforms: ['SUBITO']
    }
  }))

  // Listen for publish requests from DaniMarket
  window.addEventListener('danimarket:publish', (event) => {
    const payload = event.detail
    if (!payload || !payload.platform || !payload.listingId) return

    // Forward to background service worker
    chrome.runtime.sendMessage({
      type: 'PUBLISH_REQUEST',
      payload
    }, (response) => {
      if (response?.success) {
        window.dispatchEvent(new CustomEvent('danimarket:publish-started', {
          detail: { listingId: payload.listingId, platform: payload.platform }
        }))
      } else {
        window.dispatchEvent(new CustomEvent('danimarket:publish-error', {
          detail: {
            listingId: payload.listingId,
            platform: payload.platform,
            error: response?.error || 'Errore sconosciuto'
          }
        }))
      }
    })
  })
})()
