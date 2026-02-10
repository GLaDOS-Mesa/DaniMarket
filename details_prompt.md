# Prompt per Claude Code — Sprint 7: Modalità Modifica (Edit Mode)

Implementa la modalità modifica inline nella pagina dettaglio annuncio `/listings/[id]`. L'utente deve poter passare dalla vista alla modifica, editare i campi, e salvare le modifiche.

Prima di iniziare, leggi la struttura attuale del progetto con `ls -R` per capire cosa esiste già e non sovrascrivere nulla.

## Contesto

La pagina dettaglio ha già tutti i componenti in modalità view (Sprint 1-5), la ActionBar con i bottoni (Sprint 6), e il sistema toast. Ora dobbiamo aggiungere la possibilità di editare i campi inline, tracciare le modifiche, e salvare.

---

## 1. Composable useListingDetail.ts

Crea (o aggiorna se esiste) il composable `composables/useListingDetail.ts` con questa logica:

### State
```typescript
interface UseListingDetail {
  // Dati
  listing: Ref<Listing | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>

  // Edit mode
  isEditMode: Ref<boolean>
  editData: Ref<Partial<ListingFormData>>  // copia di lavoro dei dati in editing
  
  // Change tracking
  hasChanges: Ref<boolean>           // true se editData ≠ dati originali
  changedFields: Ref<string[]>       // lista dei campi modificati (es: ['title', 'price'])
  isValid: Ref<boolean>              // true se tutti i campi obbligatori sono validi
  
  // Azioni
  enterEditMode: () => void
  cancelEdit: () => void
  saveAsDraft: () => Promise<void>
  saveAndRepublish: () => Promise<void>
  
  // Fetch
  fetchListing: (id: string) => Promise<void>
}
```

### Logica enterEditMode
- Copiare i dati correnti di `listing` in `editData` (deep clone)
- Impostare `isEditMode = true`
- Salvare uno snapshot dei dati originali per il confronto

### Logica cancelEdit
- Se `hasChanges` è true, mostrare un **modale di conferma**: "Hai modifiche non salvate. Vuoi davvero annullare?"
  - "Continua a modificare" → chiude il modale
  - "Annulla modifiche" → ripristina i dati originali e torna in view mode
- Se `hasChanges` è false, tornare direttamente in view mode senza chiedere conferma

### Logica hasChanges (change tracking)
Confrontare `editData` con lo snapshot dei dati originali campo per campo. Usare deep comparison per array (colors, platforms) e oggetti. Aggiornare `changedFields` con la lista dei campi effettivamente diversi.

```typescript
// Esempio: se l'utente cambia il titolo e il prezzo
changedFields.value = ['title', 'price']
hasChanges.value = changedFields.value.length > 0
```

### Logica isValid (validazione)
Applicare le stesse regole di validazione del wizard di creazione.

### Logica saveAsDraft
1. Validare i campi → se non valido, mostrare toast errore e non procedere
2. Applicare le modifiche da `editData` a `listing`
3. Impostare `listing.status = ListingStatus.DRAFT`
4. Aggiungere entry nel `activityLog` con i campi modificati:
   - Per ogni campo in `changedFields`, generare una descrizione (es: "Prezzo modificato da €50 a €45")
   - Aggiungere entry generica "Annuncio salvato come bozza"
5. Uscire dalla modalità modifica
6. Mostrare toast "Modifiche salvate — annuncio in bozza"

### Logica saveAndRepublish
1. Stessi passi 1-4 di saveAsDraft
2. Impostare `listing.status = ListingStatus.ACTIVE`
3. Aggiornare `publishedAt` nelle platformPublications attive
4. Aggiungere entry nel log "Annuncio ripubblicato su [piattaforme]"
5. Uscire dalla modalità modifica
6. Mostrare toast "Modifiche salvate e annuncio ripubblicato"

**Nota:** Per ora tutto è locale (mock), nessuna API call. La struttura deve però essere pronta per sostituire la logica mock con chiamate API reali in futuro.

---

## 2. Aggiornare ActionBar.vue

Modificare la ActionBar per gestire i due stati:

### Quando isEditMode = false (view mode)
Comportamento attuale, nessuna modifica. I bottoni sono: Modifica, Pubblica (se Draft), Duplica, Elimina.

### Quando isEditMode = true (edit mode)
Sostituire i bottoni con:

| Bottone | Stile | Abilitato quando | Azione |
|---------|-------|-------------------|--------|
| Annulla modifiche | `btn btn-ghost` | Sempre | Chiama `cancelEdit()` |
| Salva come bozza | `btn btn-outline btn-primary` | `hasChanges && isValid` | Chiama `saveAsDraft()` |
| Salva e ripubblica | `btn btn-primary` | `hasChanges && isValid` | Chiama `saveAndRepublish()` |

- I bottoni Duplica, Elimina e Pubblica sono **nascosti** in edit mode
- Se `hasChanges` è false o `isValid` è false, i bottoni di salvataggio sono visually disabled (`btn-disabled` + tooltip che spiega perché)
- Tooltip su bottone disabilitato:
  - Se `!hasChanges`: "Nessuna modifica apportata"
  - Se `!isValid`: "Compila tutti i campi obbligatori"

### Mobile
- In edit mode: mostrare "Annulla" a sinistra e "Salva e ripubblica" a destra
- "Salva come bozza" va nel menu dropdown "⋯"

---

## 3. Aggiornare i componenti di dettaglio per supportare edit mode

Ogni componente riceve una prop `isEditMode: boolean` e mostra la versione editabile quando è true.

### ListingGallery.vue
- **View mode**: comportamento attuale (foto principale + thumbnails)
- **Edit mode**: aggiungere sopra le thumbnails:
  - Bottone "Aggiungi foto" (se < 6 foto)
  - Icona "X" su ogni thumbnail per rimuovere la foto
  - Drag & drop per riordinare le thumbnails (opzionale, se complesso implementare solo i bottoni freccia ↑↓)
  - Avviso se si scende sotto 1 foto: "Almeno una foto è obbligatoria"

### ListingBasicInfo.vue
- **View mode**: comportamento attuale
- **Edit mode**:
  - Titolo → `input` con contatore caratteri (max 80) e bordo di validazione
  - Descrizione → `textarea` auto-resize con contatore caratteri
  - Prezzo → `input type="number"` con prefisso €
  - Categoria → `select` con opzioni da `categoryLabels`
  - Condizione → `select` con opzioni da `conditionLabels`

### ListingDetails.vue
- **View mode**: comportamento attuale
- **Edit mode**:
  - Brand → `input` testo
  - Taglia → `select` (visibile solo se categoria in `categoriesRequiringSize`)
  - Colori → `select` multiplo o chip selezionabili con opzioni da `colorLabels`
  - Materiale → `input` testo (visibile solo se categoria in `categoriesWithMaterial`)
  - Quando la categoria cambia in ListingBasicInfo, i campi condizionali devono apparire/sparire con transizione

### ListingShipping.vue
- **View mode**: comportamento attuale
- **Edit mode**:
  - Località → `input` testo
  - Disponibile per spedizione → `toggle` DaisyUI
  - Se toggle on: mostrare dimensione pacco (`radio` buttons) e costo spedizione (`input number` con placeholder "Gratuita se vuoto")
  - Se toggle off: nascondere i campi spedizione con transizione

### PlatformStatusSection.vue, ActivityTimeline.vue, StatsOverview.vue
- **NON modificare** — restano sempre in view mode, non sono editabili inline
- Passare comunque la prop `isEditMode` per eventuale uso futuro (es: disabilitare le azioni rapide piattaforma durante l'editing)

---

## 4. Modale "Modifiche non salvate" (UnsavedChangesModal.vue)

Creare un nuovo componente `components/listings/detail/UnsavedChangesModal.vue`.

Si apre quando l'utente clicca "Annulla modifiche" e ci sono modifiche non salvate.

**Contenuto:**
- Icona info (ℹ️)
- Titolo: "Modifiche non salvate"
- Testo: "Hai modificato i seguenti campi:"
- Lista dei campi modificati con etichette leggibili (es: "Titolo", "Prezzo", "Categoria" — usa le label italiane, non i nomi dei campi tecnici)
- Bottone "Continua a modificare" (`btn btn-primary`) → chiude il modale
- Bottone "Annulla modifiche" (`btn btn-ghost`) → ripristina dati originali, esce da edit mode, chiude modale

**Props e eventi:** stessa struttura di DeleteConfirmModal (isOpen, @close, @confirm).

---

## 5. Indicatore visivo campi modificati

Quando un campo viene modificato in edit mode, mostrare un piccolo indicatore visivo accanto al campo:
- Un pallino blu (o bordo sinistro blu) sul campo che è stato modificato rispetto all'originale
- Questo aiuta l'utente a vedere a colpo d'occhio cosa ha cambiato

Implementazione: ogni componente di editing confronta il valore corrente in `editData` con il valore in `originalData` per ogni campo, e applica la classe CSS `border-l-4 border-primary` al wrapper del campo se il valore è diverso.

---

## 6. Integrazione nella pagina [id].vue

Aggiornare `pages/listings/[id].vue`:

- Usare il composable `useListingDetail` per gestire tutto lo state
- Passare `isEditMode` a tutti i componenti di dettaglio
- Passare `editData` ai componenti in edit mode (i componenti emettono `@update:field` per aggiornare editData)
- Gestire gli eventi di ActionBar collegandoli alle funzioni del composable
- Inserire `UnsavedChangesModal`

---

## 7. Protezione navigazione

Se l'utente è in edit mode con modifiche non salvate e prova a navigare altrove (click su breadcrumb, bottone indietro del browser, click su un link):

- Intercettare la navigazione con `onBeforeRouteLeave` di Vue Router
- Mostrare il modale UnsavedChangesModal
- Se l'utente conferma l'annullamento → permettere la navigazione
- Se l'utente sceglie "Continua a modificare" → bloccare la navigazione

---

## Struttura file

```
components/
  listings/
    detail/
      ActionBar.vue                 ← AGGIORNARE: gestione edit mode
      ListingGallery.vue            ← AGGIORNARE: aggiungere edit mode
      ListingBasicInfo.vue          ← AGGIORNARE: aggiungere edit mode
      ListingDetails.vue            ← AGGIORNARE: aggiungere edit mode
      ListingShipping.vue           ← AGGIORNARE: aggiungere edit mode
      UnsavedChangesModal.vue       ← NUOVO: modale modifiche non salvate
composables/
  useListingDetail.ts               ← NUOVO o AGGIORNARE: state management completo
pages/
  listings/
    [id].vue                        ← AGGIORNARE: integrazione edit mode
```

---

## Stile

- Il passaggio view → edit deve essere fluido: i testi statici si trasformano in input con una transizione smooth, senza salti di layout
- I campi in edit mode mantengono lo stesso posizionamento dei valori in view mode
- I campi editabili hanno bordo `border-base-300` di default, `border-primary` on focus, `border-error` se non valido
- I campi modificati hanno `border-l-4 border-primary` come indicatore laterale
- I bottoni disabilitati usano `btn-disabled opacity-50 cursor-not-allowed`
- Le transizioni tra apparizione/scomparsa dei campi condizionali usano `transition-all duration-200`

Come abbiamo fatto precedentemente, passa prima in plane mode, e successivamente fai prima un piano di suddivisione per questa implementazione corposa