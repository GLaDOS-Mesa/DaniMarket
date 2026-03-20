const statusEl = document.getElementById('status')
const statusTextEl = document.getElementById('status-text')
const infoEl = document.getElementById('info')

async function updateStatus() {
  const { pendingPublish } = await chrome.storage.local.get('pendingPublish')

  if (pendingPublish) {
    statusEl.className = 'status ready'
    statusEl.querySelector('.dot').className = 'dot green'
    statusTextEl.textContent = `Pubblicazione in corso: ${pendingPublish.title}`
    infoEl.textContent = `Piattaforma: ${pendingPublish.platform}`
  } else {
    statusEl.className = 'status idle'
    statusEl.querySelector('.dot').className = 'dot gray'
    statusTextEl.textContent = 'Pronto'
    infoEl.textContent = 'Apri DaniMarket e clicca "Pubblica" su un annuncio.'
  }
}

updateStatus()

chrome.storage.onChanged.addListener(updateStatus)
