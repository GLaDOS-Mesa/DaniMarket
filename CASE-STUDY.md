# DaniMarket - Case Study di Vibe Coding

## Panoramica del Progetto

**DaniMarket** è un'applicazione web per pubblicare annunci di oggetti usati su più piattaforme (eBay, Vinted, Subito, Facebook Marketplace) da un'unica interfaccia.

**Tech Stack**: Nuxt 3, TypeScript, Tailwind CSS, Prisma, PostgreSQL

---

## Funzionalità Sviluppate in Sessione

| Feature | Descrizione | Tempo Stimato |
|---------|-------------|---------------|
| Wizard 5 step | Form multi-step con stepper visuale e validazione | ~15 min |
| Autocomplete città | Ricerca comuni italiani con API + filtering locale | ~10 min |
| Sistema Toast | Notifiche animate success/error/warning/info | ~8 min |
| Gestione stato form | localStorage persistence + reset su exit | ~5 min |
| Fix stepper bug | Validazione step precedenti prima di marcare completato | ~3 min |
| Accessibilità WCAG | aria-labels, focus states, screen reader support | incluso |

**Tempo totale sessione**: ~45 minuti

---

## Comparazione Tempi di Sviluppo

| Approccio | Tempo Stimato | Note |
|-----------|---------------|------|
| **Vibe Coding (AI-first)** | **~45 min** | Prompt → codice → review → deploy |
| Senior + AI (Copilot) | ~2-3 ore | Scrittura assistita, debugging manuale |
| Senior tradizionale | ~6-8 ore | Ricerca, implementazione, test, refactor |
| Junior tradizionale | ~2-3 giorni | Learning curve, trial & error, code review |

### Fattore di Accelerazione

```
Vibe Coding vs Junior:    ~32x più veloce
Vibe Coding vs Senior:    ~8-10x più veloce
Vibe Coding vs AI-assist: ~3-4x più veloce
```

---

## Workflow Adottato

```
1. Richiesta in linguaggio naturale (italiano)
2. Claude analizza codebase esistente
3. Implementazione con best practices già integrate
4. Commit atomici con conventional commits
5. Iterazione rapida su feedback
```

### Esempio di Iterazione

```
User: "Aggiungi toast di successo quando pubblica"
Claude: [legge codice] → [crea composable] → [crea componente] → [integra] → [commit]
Tempo: ~8 minuti dall'idea al codice in produzione
```

---

## Vantaggi Osservati

| Aspetto | Vibe Coding | Tradizionale |
|---------|-------------|--------------|
| Setup iniziale | Immediato | Ore di boilerplate |
| Accessibilità | Built-in (WCAG 2.2) | Spesso trascurata |
| Consistenza codice | Alta (stesso stile) | Variabile |
| Documentazione | Inline + CLAUDE.md | Manuale, post-hoc |
| Refactoring | Naturale nel flusso | Task separato |
| Debug | Contestuale | Cicli separati |

---

## Cosa Serve per Replicare

1. **Contesto chiaro**: file `CLAUDE.md` con convenzioni di progetto
2. **Richieste incrementali**: una feature alla volta
3. **Review attiva**: validare output, chiedere fix
4. **Commit frequenti**: mantenere storia pulita

---

## Conclusione

Il vibe coding non sostituisce la competenza tecnica, ma la amplifica. Un developer che conosce cosa vuole ottiene risultati in minuti invece che ore. Il risparmio di tempo è significativo soprattutto su:

- Boilerplate e setup
- Pattern ricorrenti (form, validazione, UI)
- Accessibilità e best practices
- Integrazione di componenti esistenti

**ROI stimato**: 1 ora di vibe coding ≈ 8-10 ore di sviluppo tradizionale senior.

---

## Feature Complessa: Pagina Dettaglio Annuncio

Per funzionalità più articolate, il workflow si evolve in un processo strutturato che sfrutta Claude per l'analisi iniziale e Claude Code per l'implementazione.

### Fase 1: Analisi e Generazione Prompt (Claude)

Prima di iniziare lo sviluppo, abbiamo usato **Claude** (non Claude Code) per:

1. **Analisi dei requisiti**: descrizione della feature desiderata e del contesto esistente
2. **Decomposizione in sprint**: suddivisione logica in fasi incrementali
3. **Generazione prompt strutturato**: creazione di un documento dettagliato (`details_prompt.md`) con specifiche tecniche, componenti da creare, props/events, stili e comportamenti

Questo approccio "prompt engineering" ha prodotto un piano di implementazione chiaro prima ancora di scrivere codice.

### Fase 2: Plan Mode (Claude Code)

Data la sostanziosità dell'implementazione (15+ componenti, composables, mock data), abbiamo attivato il **plan mode** di Claude Code:

```
/plan Implementa la pagina dettaglio annuncio /listings/[id] con view mode
```

Claude Code ha:
- Esplorato la codebase esistente
- Identificato pattern e convenzioni già in uso
- Prodotto un piano dettagliato con ordine di implementazione
- Atteso approvazione prima di procedere

### Fase 3: Sviluppo per Sprint

L'implementazione è stata scomposta in **5 sprint** incrementali:

| Sprint | Contenuto | Commit |
|--------|-----------|--------|
| 1 | Tipi, mock data, composable API | `feat(types): add listing detail types` |
| 2 | Componenti info (Gallery, BasicInfo, Details, Shipping) | `refactor(listings): extract detail page sections` |
| 3 | Componenti status (Platforms, Timeline, Stats) | `refactor(listings): extract right column components` |
| 4 | ActionBar e DeleteConfirmModal | `feat(listings): add action bar and delete modal` |
| 5 | Pagina principale, layout responsive, integrazioni | `feat(listings): complete view mode with all components` |

Ogni sprint ha prodotto codice funzionante e testabile, con commit atomici.

### Fase 4: Review e Miglioramenti (Claude)

Dopo lo Sprint 5, siamo tornati a **Claude** per una review:

> "Siamo arrivati all'implementazione completa fino allo sprint 5. Vedi mancanze o migliorie prima di passare alle successive?"

Claude ha suggerito:

**Test UI e Edge Cases:**
- Verificare empty states nei componenti (PlatformStatusSection con 0 piattaforme)
- Testare Timeline con pochi elementi (1-2 entries)
- Controllare campi opzionali in ListingDetails e ListingShipping

**Verifica Mock Data:**
- Confermare esistenza di mock listing per test edge cases (listing-3: DRAFT, no images, no platforms)
- Verificare coerenza tra tipi TypeScript e dati mock

**Miglioramenti UX:**
- Aggiungere breadcrumb per navigazione contestuale
- Migliorare empty state di PlatformStatusSection con CTA "Aggiungi piattaforma"
- Considerare skeleton loader per loading state più fluido

### Fase 5: Implementazione Miglioramenti

I suggerimenti sono stati implementati in Claude Code:

```
fix(ui): fix toast z-index appearing behind header
feat(listings): add breadcrumb navigation to detail header
fix(listings): improve platform section empty state with add button
feat(listings): add duplicate listing functionality with form pre-population
```

### Risultato

| Metrica | Valore |
|---------|--------|
| Componenti creati | 10 |
| File modificati | 20 |
| Tempo totale | ~2 ore |
| Commit | 9 |
| Bug post-implementazione | 1 (empty state piattaforme, fixato in 5 min) |

### Lezioni Apprese

1. **Claude per strategia, Claude Code per esecuzione**: usare Claude per analisi iniziale e review produce prompt migliori
2. **Plan mode per feature complesse**: evita implementazioni caotiche e mantiene focus
3. **Sprint incrementali**: permettono test continui e catch di problemi early
4. **Review intermedia**: tornare a Claude dopo milestone aiuta a non dimenticare edge cases
5. **Mock data realistici**: avere dati di test per tutti gli scenari accelera il debugging

---

## Sprint 6: Testing Setup

Prima di procedere con l'edit mode, abbiamo strutturato una suite di test per garantire stabilità durante le modifiche.

### Configurazione

- **Framework**: Vitest v2.1.9 + happy-dom
- **Test Utils**: @vue/test-utils per componenti Vue
- **Auto-imports**: Vue reactivity (ref, computed) disponibili nei test

### Test Implementati

| File | Test | Copertura |
|------|------|-----------|
| `useListingForm.test.ts` | 37 test | Validazione step, foto, navigazione, platform readiness, duplicazione |
| `useToast.test.ts` | 11 test | Show/remove toast, auto-dismiss, convenience methods |
| `platformMappings.test.ts` | 16 test | Mappature categorie/condizioni per piattaforma |
| **Totale** | **64 test** | Composables core |

### Commit

```
be7b9e3 test: add Vitest setup and tests for composables
```

### Tempo: ~30 min

---

## Feature Avanzata: Edit Mode (Sprint 7)

Dopo il view mode, abbiamo implementato la modalità di modifica inline della pagina dettaglio. Questa feature dimostra come gestire complessità crescente mantenendo il workflow vibe coding.

### Architettura Edit Mode

L'implementazione ha richiesto un composable dedicato con pattern singleton per gestire lo stato condiviso:

```typescript
// composables/useListingDetail.ts
const isEditMode = ref(false)
const workingCopy = ref<Partial<Listing> | null>(null)
const originalSnapshot = ref<Partial<Listing> | null>(null)

// Change tracking con deep comparison
const modifiedFields = computed(() => {
  const modified = new Set<string>()
  for (const key of Object.keys(workingCopy.value)) {
    if (!areValuesEqual(workingCopy.value[key], originalSnapshot.value[key])) {
      modified.add(key)
    }
  }
  return modified
})
```

### Sprint 7: Sub-Sprint Breakdown

| Sub-Sprint | Contenuto | Complessità |
|------------|-----------|-------------|
| 7.1 | `useListingDetail` composable (state, validation, change tracking) | Alta |
| 7.2 | ActionBar con toggle Modifica/Salva/Annulla | Media |
| 7.3 | ListingBasicInfo edit (titolo, descrizione, prezzo, categoria) | Media |
| 7.4 | ListingDetails edit (marca, taglia, colori, materiale) | Media |
| 7.5 | ListingShipping edit (città autocomplete, spedizione, pacco) | Alta |
| 7.6 | ListingGallery edit (drag-to-reorder, rimuovi, aggiungi foto) | Alta |
| 7.7 | UnsavedChangesModal + navigation guard | Media |

### Pattern Implementati

**1. Indicatore Campi Modificati**
```vue
<input :class="{ 'ring-2 ring-amber-300 border-amber-400': isFieldModified('title') }" />
```

**2. Navigation Guard**
```typescript
onBeforeRouteLeave((to, from, next) => {
  if (isEditMode.value && hasChanges.value) {
    showUnsavedModal.value = true
    pendingNavigation.value = () => next()
    next(false)
  } else {
    next()
  }
})
```

**3. Deep Clone per Working Copy**
```typescript
const enterEditMode = (listing: Listing) => {
  workingCopy.value = JSON.parse(JSON.stringify(listing))
  originalSnapshot.value = JSON.parse(JSON.stringify(listing))
  isEditMode.value = true
}
```

### Problemi Risolti

| Problema | Soluzione | Tempo |
|----------|-----------|-------|
| Vitest v4.0.18 bug su Windows | Downgrade a v2.1.9 | ~15 min |
| Test con struttura ListingPhoto cambiata | Helper `createListingPhoto()` | ~10 min |
| Type mismatch `Partial<Listing>` | Type casting esplicito | ~5 min |

### Metriche Sprint 7

| Metrica | Valore |
|---------|--------|
| Componenti modificati | 6 |
| Componenti nuovi | 2 (useListingDetail, UnsavedChangesModal) |
| Test nuovi | 46 (29 useListingDetail + 16 ActionBar + 1 fix) |
| Test totali | 110 (64 Sprint 6 + 46 Sprint 7) |
| Tempo totale | ~3 ore |
| Commit | 8 |

### Commit History Sprint 7

```
097dc80 fix(tests): update tests for ListingPhoto structure and downgrade vitest
17aaa79 feat(listings): add UnsavedChangesModal and navigation guard
d0a059e feat(listings): add edit mode to ListingGallery component
fa3be31 feat(listings): add edit mode to ListingShipping component
032c9be feat(listings): add edit mode to ListingDetails component
[...altri commit per 7.1-7.3]
```

### Lezioni Apprese (Edit Mode)

1. **Composable singleton**: stato condiviso tra componenti senza prop drilling
2. **Deep comparison**: `JSON.stringify` per confronto oggetti nested (con limitazioni note)
3. **Test maintenance**: quando cambiano i tipi, aggiornare anche i test helper
4. **Dependency management**: versioni major di librerie (Vitest v4) possono avere bug critici
5. **Handoff documentation**: creare `HANDOFF_PROMPT.md` per continuità tra sessioni

---

## Riepilogo Complessivo

| Fase | Tempo | Output |
|------|-------|--------|
| Setup iniziale + Wizard | ~45 min | Form 5 step funzionante |
| Sprint 1-5 (View Mode) | ~2 ore | Pagina dettaglio completa |
| Sprint 6 (Testing) | ~30 min | 64 test per composables core |
| Sprint 7 (Edit Mode) | ~3 ore | Modifica inline + modal + guard + 46 nuovi test |
| **Totale** | **~6.5 ore** | **Feature completa view + edit + 110 test** |

**Stima sviluppo tradizionale**: 4-6 giorni developer senior

**Fattore accelerazione**: ~6-10x

---

*Documento aggiornato durante sessione di sviluppo DaniMarket - Febbraio 2026*
