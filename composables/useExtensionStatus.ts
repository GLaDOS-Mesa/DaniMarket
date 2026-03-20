/**
 * Detects whether the DaniMarket Assistant browser extension is installed.
 * Checks the DOM attribute set by the extension's content script and
 * listens for the extension-ready event.
 */
export function useExtensionStatus() {
  const isInstalled = ref(false)
  const extensionVersion = ref<string | null>(null)
  const supportedPlatforms = ref<string[]>([])

  function checkExtension() {
    const attr = document.documentElement.dataset.danimarketExtension
    if (attr === 'installed') {
      isInstalled.value = true
      extensionVersion.value = document.documentElement.dataset.danimarketExtensionVersion || null
    }
  }

  function onExtensionReady(event: Event) {
    const detail = (event as CustomEvent).detail
    isInstalled.value = true
    extensionVersion.value = detail?.version || null
    supportedPlatforms.value = detail?.platforms || []
  }

  onMounted(() => {
    // Check immediately (extension may have loaded before us)
    checkExtension()

    // Listen for late extension load
    window.addEventListener('danimarket:extension-ready', onExtensionReady)
  })

  onUnmounted(() => {
    window.removeEventListener('danimarket:extension-ready', onExtensionReady)
  })

  return {
    isInstalled: readonly(isInstalled),
    extensionVersion: readonly(extensionVersion),
    supportedPlatforms: readonly(supportedPlatforms),
  }
}
