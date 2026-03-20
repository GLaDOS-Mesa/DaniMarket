// Content script for Subito.it integration
// Injected on subito.it and inserimento.subito.it
// Handles two phases:
//   1. On subito.it/vendere → redirect to inserimento.subito.it with correct category
//   2. On inserimento.subito.it → fill the actual listing form

(function () {
  // ========== UTILITIES ==========

  function setReactInputValue(el, value) {
    try {
      const proto = el.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value')

      if (descriptor && descriptor.set) {
        descriptor.set.call(el, value)
      } else {
        el.value = value
      }
    } catch (e) {
      console.warn('[DaniMarket] Fallback setValue per', el.tagName)
      el.value = value
    }

    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
    el.dispatchEvent(new Event('blur', { bubbles: true }))
  }

  async function simulateTyping(el, text, delay = 50) {
    el.focus()
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
    el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

    // Clear existing value via select-all + delete
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'KeyA', ctrlKey: true, bubbles: true }))
    el.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', code: 'KeyA', ctrlKey: true, bubbles: true }))

    const proto = el.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set

    if (nativeSetter) nativeSetter.call(el, '')
    else el.value = ''
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: null, inputType: 'deleteContentBackward' }))

    await new Promise(r => setTimeout(r, 100))

    // Type character by character with full keyboard event cycle
    for (const char of text) {
      const keyEventInit = { key: char, code: `Key${char.toUpperCase()}`, bubbles: true, cancelable: true }

      el.dispatchEvent(new KeyboardEvent('keydown', keyEventInit))
      el.dispatchEvent(new KeyboardEvent('keypress', keyEventInit))

      const currentValue = el.value + char
      if (nativeSetter) nativeSetter.call(el, currentValue)
      else el.value = currentValue

      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: char, inputType: 'insertText' }))
      el.dispatchEvent(new KeyboardEvent('keyup', keyEventInit))

      await new Promise(r => setTimeout(r, delay))
    }
  }

  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(selector)
      if (existing) return resolve(existing)

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector)
        if (el) {
          observer.disconnect()
          resolve(el)
        }
      })

      observer.observe(document.body, { childList: true, subtree: true })

      setTimeout(() => {
        observer.disconnect()
        reject(new Error(`Timeout: elemento "${selector}" non trovato`))
      }, timeout)
    })
  }

  async function uploadPhotos(photoUrls) {
    if (!photoUrls || photoUrls.length === 0) return

    const fileInput = document.querySelector('input[type="file"]')
    if (!fileInput) {
      console.warn('[DaniMarket] File input non trovato, foto da caricare manualmente')
      showNotification('Carica le foto manualmente — input file non trovato')
      return
    }

    try {
      const dt = new DataTransfer()

      for (let i = 0; i < photoUrls.length; i++) {
        const url = photoUrls[i]
        const response = await fetch(url)
        const blob = await response.blob()
        const ext = blob.type.split('/')[1] || 'jpg'
        const file = new File([blob], `photo_${i + 1}.${ext}`, { type: blob.type })
        dt.items.add(file)
      }

      fileInput.files = dt.files
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
      console.log(`[DaniMarket] ${photoUrls.length} foto caricate`)
    } catch (err) {
      console.error('[DaniMarket] Errore upload foto:', err)
      showNotification('Errore nel caricamento automatico delle foto — caricale manualmente')
    }
  }

  function showNotification(message, type = 'info') {
    const div = document.createElement('div')
    div.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 99999;
      padding: 12px 20px; border-radius: 8px; font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: opacity 0.3s;
      color: white; max-width: 360px;
      background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `
    div.textContent = message
    document.body.appendChild(div)
    setTimeout(() => {
      div.style.opacity = '0'
      setTimeout(() => div.remove(), 300)
    }, 5000)
  }

  function clickOptionByText(text) {
    const candidates = document.querySelectorAll('button, [role="option"], [role="radio"], label, li, div[class*="option"], div[class*="chip"]')
    for (const el of candidates) {
      const elText = el.textContent?.trim().toLowerCase()
      if (elText === text.toLowerCase() || elText?.includes(text.toLowerCase())) {
        el.click()
        console.log(`[DaniMarket] Cliccato opzione: "${text}"`)
        return true
      }
    }
    console.warn(`[DaniMarket] Opzione "${text}" non trovata`)
    return false
  }

  // ========== FORM FILLING: inserimento.subito.it ==========

  async function handleInserimentoPage(data) {
    console.log('[DaniMarket] Pagina inserimento, compilazione form...', data.title)
    showNotification(`Compilazione automatica: "${data.title}"...`)

    // Wait for form to render
    await new Promise(r => setTimeout(r, 2000))

    // Dump all form fields for debugging
    const fields = document.querySelectorAll('input, textarea, select')
    console.log('[DaniMarket] Campi trovati:')
    fields.forEach(el => {
      console.log({
        tag: el.tagName,
        type: el.type,
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
      })
    })

    // Fill title
    const titleField = document.querySelector('#subject, [name="subject"], [name="title"], [name="ad_name"], input[type="text"]')
    if (titleField) {
      setReactInputValue(titleField, data.title)
      console.log('[DaniMarket] Titolo compilato')
    }

    await new Promise(r => setTimeout(r, 300))

    // Fill description
    if (data.description) {
      const descField = document.querySelector('textarea, [name="body"], [name="description"]')
      if (descField) {
        setReactInputValue(descField, data.description)
        console.log('[DaniMarket] Descrizione compilata')
      }
    }

    await new Promise(r => setTimeout(r, 300))

    // Fill price
    if (data.price) {
      const priceField = document.querySelector('[name="price"], input[type="number"]')
      if (priceField) {
        setReactInputValue(priceField, String(data.price))
        console.log('[DaniMarket] Prezzo compilato')
      }
    }

    await new Promise(r => setTimeout(r, 300))

    // Condition
    if (data.condition) {
      clickOptionByText(data.condition)
    }

    await new Promise(r => setTimeout(r, 300))

    // City (Comune) — uses React combobox with autocomplete
    if (data.city) {
      const cityField = document.querySelector('#location, input[name="location"]')
      if (cityField) {
        // Focus the field first
        cityField.focus()
        cityField.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
        cityField.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
        cityField.click()
        await new Promise(r => setTimeout(r, 200))

        // Trigger React's onChange by finding React's internal instance and using native setter
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        )?.set

        // Set value via native setter to bypass React's controlled state
        if (nativeSetter) {
          nativeSetter.call(cityField, data.city)
        }

        // React 16+ listens to input events via a tracker on the node
        // We need to trick React into thinking the value changed
        const tracker = cityField._valueTracker
        if (tracker) {
          tracker.setValue('')  // Set previous value to something different
        }

        cityField.dispatchEvent(new Event('input', { bubbles: true }))
        cityField.dispatchEvent(new Event('change', { bubbles: true }))
        console.log('[DaniMarket] Comune compilato: ' + data.city)

        // Wait for autocomplete dropdown to populate
        await new Promise(r => setTimeout(r, 2000))

        // Select first suggestion from the listbox
        const listbox = document.querySelector('#autocomplete-location-menu')
        const firstOption = listbox?.querySelector('[role="option"], li')
        if (firstOption) {
          firstOption.click()
          console.log('[DaniMarket] Suggerimento comune selezionato: ' + firstOption.textContent)
        } else {
          console.warn('[DaniMarket] Nessun suggerimento comune trovato nel dropdown')
        }
      } else {
        console.warn('[DaniMarket] Campo comune non trovato')
      }
    }

    await new Promise(r => setTimeout(r, 300))

    // Shipping availability toggle
    const shippingToggle = document.querySelector('#itemShippable, [role="switch"][id="itemShippable"]')
    if (shippingToggle) {
      const isChecked = shippingToggle.getAttribute('aria-checked') === 'true'
      if (data.shippingAvailable === false && isChecked) {
        shippingToggle.click()
        console.log('[DaniMarket] Spedizione disattivata')
      } else if (data.shippingAvailable === true && !isChecked) {
        shippingToggle.click()
        console.log('[DaniMarket] Spedizione attivata')
      }
    }

    await new Promise(r => setTimeout(r, 300))

    // Phone number (strip +39 prefix for Subito)
    if (data.phone) {
      const phone = data.phone.replace(/^\+?39\s*/, '')
      const phoneField = document.querySelector('#phone, input[name="phone"], input[type="tel"]')
      if (phoneField) {
        setReactInputValue(phoneField, phone)
        console.log('[DaniMarket] Telefono compilato: ' + phone)
      } else {
        console.warn('[DaniMarket] Campo telefono non trovato')
      }
    }

    await new Promise(r => setTimeout(r, 300))

    // Photos
    await uploadPhotos(data.photos)

    // Done
    showNotification('Compilazione completata! Rivedi e conferma i dati.', 'success')
    console.log('[DaniMarket] Compilazione form completata')
    chrome.storage.local.remove('pendingPublish')
  }

  // ========== PAGE DETECTION ==========

  function isLoginPage() {
    return window.location.hostname === 'areariservata.subito.it' ||
      window.location.pathname.includes('/login')
  }

  // ========== MAIN ==========

  chrome.storage.local.get('pendingPublish', ({ pendingPublish }) => {
    if (!pendingPublish || pendingPublish.platform !== 'SUBITO') return

    const hostname = window.location.hostname

    if (hostname === 'inserimento.subito.it') {
      // Fill the listing form
      if (document.readyState === 'complete') {
        handleInserimentoPage(pendingPublish)
      } else {
        window.addEventListener('load', () => handleInserimentoPage(pendingPublish))
      }
    } else if (isLoginPage()) {
      showNotification(
        'Effettua il login su Subito. Dopo il login verrai reindirizzato per pubblicare il tuo annuncio.',
        'info'
      )
    } else if (hostname === 'www.subito.it') {
      // Post-login redirect — go directly to inserimento.subito.it
      console.log('[DaniMarket] Dati pendenti trovati, reindirizzamento a inserimento.subito.it...')
      window.location.href = 'https://inserimento.subito.it/'
    }
  })
})()
