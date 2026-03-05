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

## Backend API (Sprint 1-5 Backend)

Parallelamente al frontend, abbiamo sviluppato l'intera API REST del progetto. Il backend è stato implementato in 5 sprint incrementali, ognuno con endpoint funzionanti e testabili.

### Architettura Server

```
server/
├── api/
│   ├── health.get.ts                    # Healthcheck
│   └── listings/
│       ├── index.get.ts                 # Lista annunci (filtri, paginazione)
│       ├── index.post.ts                # Crea annuncio
│       └── [id]/
│           ├── index.get.ts             # Dettaglio annuncio
│           ├── index.put.ts             # Modifica annuncio
│           ├── index.delete.ts          # Elimina annuncio
│           ├── photos.post.ts           # Upload foto
│           ├── publish.post.ts          # Pubblica su tutte le piattaforme
│           ├── draft.post.ts            # Riporta a bozza
│           ├── sold.post.ts             # Segna come venduto
│           ├── duplicate.post.ts        # Duplica annuncio
│           └── platforms/
│               ├── index.post.ts        # Aggiungi piattaforma
│               ├── [platform].delete.ts # Rimuovi piattaforma
│               └── [platform]/
│                   └── publish.post.ts  # Pubblica su singola piattaforma
├── middleware/
│   └── uploads.ts                       # Serve file uploadati a runtime
└── utils/
    ├── prisma.ts                        # Database client
    ├── auth.ts                          # Auth (dev mode)
    ├── response.ts                      # Response helpers
    ├── listing.ts                       # Ownership checks + Prisma includes
    └── upload.ts                        # File upload utilities
```

### Sprint Breakdown

| Sprint | Contenuto | Commit |
|--------|-----------|--------|
| 1 | Docker, Prisma schema, seed data | `506069d feat(backend): add Docker, Prisma schema, and seed` |
| 2 | CRUD endpoints, OpenAPI docs, Swagger UI | `f47b677 feat(api): add CRUD endpoints, OpenAPI docs, and Swagger UI` |
| 3 | Upload foto, delete, reorder | `ebb388f feat(api): add photo upload, delete, and reorder endpoints` |
| 4 | Azioni listing (publish, draft, sold, duplicate) | `615948f feat(api): add listing action endpoints and ownership utility` |
| 5 | Azioni piattaforma (add, remove, publish singola) | `94cc86c feat(api): add platform action endpoints` |

### Pattern Implementati

**1. Response Envelope Consistente**
```typescript
// Tutte le API rispondono con lo stesso formato
{ success: true, data: T }           // successo
{ success: false, error: string }    // errore
```

**2. Ownership Check Centralizzato**
```typescript
// server/utils/listing.ts
export async function getOwnedListing(id: string) {
  const userId = await DEV_USER_ID()
  return prisma.listing.findFirst({
    where: { id, userId },
    include: { photos: true, platformPublications: true, activityLog: true },
  })
}
```

**3. Activity Log Automatico**
Ogni operazione (create, update, publish, platform add/remove) genera una entry nell'activity log con action, descrizione e metadata dei campi modificati.

### Metriche Backend

| Metrica | Valore |
|---------|--------|
| Endpoint API | 14 |
| File server | 18 |
| Modelli Prisma | 4 (User, Listing, Photo, PlatformPublication, ActivityLog) |
| Tempo totale | ~2 ore |
| Commit | 5 |

---

## Frontend → API Connection (Sprint 8)

Il passaggio critico: sostituire tutti i mock data con chiamate API reali. Questo sprint ha richiesto di attraversare l'intero stack e ha prodotto diversi bug che sono stati risolti in sessione.

### Architettura 3 Layer

```
Pages (UI only)          →  handlePhotoAdd(files)
    ↓ emit
Composables (logic)      →  addPhotos(files) → fetchListing()
    ↓ call
useApi.ts ($fetch)       →  POST /api/listings/:id/photos
```

**Regola rigida**: le pagine non fanno MAI chiamate API dirette. Tutta la logica passa per i composables.

### Modifiche Principali

| File | Cambiamento |
|------|-------------|
| `types/listing.ts` | Enum UPPERCASE, nuove interfacce (Photo, ListingSummary, ListingStats) |
| `composables/useApi.ts` | **Nuovo** — wrapper `$fetch` che unwrappa `{ success, data }` |
| `composables/useListings.ts` | **Nuovo** — stato dashboard con filtri e refresh |
| `composables/useListingDetail.ts` | Collegato a 10+ endpoint API (CRUD, foto, piattaforme) |
| `composables/useListingForm.ts` | `submitAsDraft()`, `submitAndPublish()`, `loadDuplicateSource()` |
| `composables/useListingsApi.ts` | **Eliminato** — conteneva 600+ righe di mock data |
| 7 componenti | Adattati ai nuovi tipi (photos, platformPublications) |
| 3 pagine | Connesse ai composables API |

### Bug Risolti in Sessione

Questo sprint è stato particolarmente istruttivo per il case study: il collegamento con API reali ha esposto 5 bug che non esistevano con i mock data.

#### Bug 1: Pagina dettaglio vuota dopo salvataggio

**Sintomo**: dopo "Salva come bozza", la pagina `/listings/[id]` si rendeva completamente bianca.

**Root cause**: Prisma serializza i campi `Decimal` come stringhe JSON (`"12.58"` invece di `12.58`). Il componente `ListingBasicInfo` chiamava `listing.price?.toFixed(2)` — che crasha su una stringa.

**Diagnosi**: tracciamento del flusso dati Prisma → API → `$fetch` → componente, confermato con `curl`:
```json
{ "price": "12.58" }  // stringa, non numero!
```

**Fix**: conversione `Number()` in tutti i composables che fetchano listing:
```typescript
data.price = Number(data.price)
if (data.shippingCost != null) data.shippingCost = Number(data.shippingCost)
```

#### Bug 2: Foto corrotte (dashboard e dettaglio)

**Sintomo**: le immagini non si caricavano, apparivano come icone rotte.

**Root cause**: Nitro `publicAssets` serve **solo** file presenti all'avvio del dev server, non file uploadati a runtime.

**Diagnosi**: i file `.jpg` esistevano su disco (14-21KB, JPEG validi), ma `curl -sI` restituiva `HTTP 404` con `Content-Type: image/gif` e header `X-Placeholder: image`.

**Fix**: creato `server/middleware/uploads.ts` che intercetta `/uploads/*` e serve i file con MIME type corretto e protezione path traversal.

#### Bug 3: Aggiunta foto in edit mode non visibile

**Sintomo**: in modalità modifica, cliccando "Aggiungi foto" il file veniva uploadato ma la galleria non si aggiornava.

**Root cause**: `addPhotos()` fa upload → re-fetch di `listing.value`, ma l'edit mode mostra `workingCopy.photos` che non veniva sincronizzato.

**Fix**: aggiunta funzione `syncWorkingCopyPhotos()` che allinea sia `workingCopy` che `originalSnapshot` dopo ogni operazione foto.

#### Bug 4: Salvataggio foto confuso per l'utente

**Sintomo**: dopo aggiunta/rimozione foto, il bottone "Salva Modifiche" restava disabilitato, ma la foto era già salvata.

**Root cause**: le operazioni foto sono immediate (server-side), non deferred come i campi di testo. Il bottone correttamente non si attiva.

**Fix UX**: aggiunta toast di feedback immediato ("Foto aggiunta", "Foto rimossa", "Ordine foto aggiornato") per comunicare che il salvataggio è già avvenuto.

#### Bug 5: Bottone "Aggiungi Piattaforma" non funzionante

**Sintomo**: nel dettaglio, il bottone "Aggiungi Piattaforma" non faceva nulla.

**Root cause**: l'handler era un placeholder `// TODO: Implement platform selection modal in future sprint`.

**Fix**: implementato picker inline con piattaforme disponibili, collegato al composable `addPlatform()`.

### Evoluzione: Platform Actions Complete

Partendo dal Bug 5, abbiamo completato l'intero ciclo di gestione piattaforme nella UI:

| Azione | UI | Backend |
|--------|-----|---------|
| Aggiungi | Picker inline con piattaforme disponibili | `POST /platforms` (crea o riattiva REMOVED) |
| Rimuovi | Bottone X su hover (con icona rossa) | `DELETE /platforms/:platform` (status → REMOVED) |
| Pubblica | Bottone "Pubblica" su hover (piattaforme DRAFT/ERROR) | `POST /platforms/:platform/publish` |
| Ri-aggiungi | Piattaforma REMOVED riappare nel picker | `POST /platforms` (update status REMOVED → DRAFT) |

**Dettaglio tecnico**: l'endpoint DELETE non cancella il record ma lo marca `REMOVED` per mantenere lo storico. L'endpoint POST gestisce la ri-aggiunta aggiornando lo status invece di creare un duplicato.

### Verifica End-to-End

Dopo l'implementazione, tutti i flussi sono stati verificati con `curl`:

```
✅ GET /api/listings         — 5 annunci, filtri status/search OK
✅ GET /api/listings/:id     — Dettaglio con photos, platforms, activityLog
✅ POST /api/listings        — Creazione DRAFT con activity log
✅ PUT /api/listings/:id     — Modifica con tracking campi
✅ DELETE /api/listings/:id  — Eliminazione OK
✅ /uploads/*                — Foto servite (200, image/jpeg)
✅ Platform lifecycle        — add → publish → remove → re-add
✅ Frontend pages            — Tutte HTTP 200
```

### Commit History Sprint 8

```
4bfd665 refactor(types): align enums and interfaces with backend schema
4b9692b feat(composables): add API wrapper and listings composable
eb54d54 feat(composables): connect useListingDetail and useListingForm to API
89b3c45 refactor(components): adapt detail components to new data model
6b80f0e feat(ui): connect pages to API composables
fff61a2 fix(server): serve uploaded files via middleware
2dad1fe feat(ui): add platform add, remove, and publish actions
```

### Metriche Sprint 8

| Metrica | Valore |
|---------|--------|
| File modificati | 18 |
| File nuovi | 3 (useApi, useListings, uploads middleware) |
| File eliminati | 1 (useListingsApi — 613 righe di mock data) |
| Bug risolti in sessione | 5 |
| Tempo totale | ~3 ore |
| Commit | 7 |

### Lezioni Apprese (API Connection)

1. **Prisma Decimal ≠ JS Number**: i campi `Decimal` arrivano come stringhe JSON — serve conversione esplicita
2. **Nitro publicAssets è statico**: per file uploadati a runtime serve un middleware custom
3. **Working copy sync**: quando lo stato server cambia (foto, piattaforme), bisogna sincronizzare anche le copie locali in edit mode
4. **Feedback UX per azioni immediate**: se un'operazione salva subito (foto), l'utente deve saperlo — un toast è più chiaro di un bottone "Salva" disabilitato
5. **Mock data nascondono bug reali**: 5 bug sono emersi solo collegandosi alle API reali — i mock data avevano tipi già "puliti"

---

## Deploy su Railway (Sprint 9)

Il deploy in produzione ha richiesto diverse iterazioni per risolvere incompatibilità tra l'ambiente locale e quello di produzione Railway.

### Configurazione Infrastruttura

| Componente | Tecnologia |
|------------|------------|
| **Builder** | Dockerfile (multi-stage, `node:22-slim`) |
| **Database** | PostgreSQL plugin Railway |
| **Storage foto** | Volume persistente (`/data/uploads`) |
| **Migrazioni** | `prisma migrate deploy` al boot del container |
| **Healthcheck** | `GET /api/health` con timeout 5 min |

### Problemi Risolti in Deploy

Il deploy ha prodotto una catena di problemi incrementali, ognuno risolto e pushato:

| # | Problema | Root Cause | Fix |
|---|----------|------------|-----|
| 1 | **Node.js troppo vecchio** | Nixpacks (builder default Railway) pinna `nodejs_22` a v22.11.0, ma Prisma 7 richiede >=22.12 | Passaggio da nixpacks a **Dockerfile** custom con `node:22-slim` |
| 2 | **prisma generate fallisce** | `npm ci` esegue `postinstall` (che include `prisma generate`) ma `prisma/schema.prisma` non è ancora copiato nel container | `COPY prisma ./prisma` **prima** di `RUN npm ci` |
| 3 | **`prisma: not found`** | Runtime stage del Dockerfile non ha `node_modules/.bin`, quindi `npx prisma` non trova il CLI | Path diretto: `node node_modules/prisma/build/index.js migrate deploy` |
| 4 | **`Cannot find module 'valibot'`** | Copiate solo alcune cartelle di `node_modules` (@prisma, prisma), mancavano dipendenze transitive | `COPY --from=build /app/node_modules node_modules` (copia tutto) |
| 5 | **`datasource.url is required`** | Prisma CLI richiede URL per `migrate deploy`, ma non era configurato | Schema senza `url` (Prisma 7) + `prisma.config.ts` con `url: process.env.DATABASE_URL` |
| 6 | **Prisma 7 rifiuta `url` nello schema** | Prisma 7 ha rimosso il supporto a `url` nel datasource block del schema | Rimosso `url` da schema, configurato in `prisma.config.ts` |
| 7 | **502 Bad Gateway** | Dominio pubblico Railway mappato su porta 3000, ma Nuxt ascolta su 8080 | Cambiato porta nel networking Railway a 8080 |

### Dockerfile Finale

```dockerfile
FROM node:22-slim AS build
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/.output .output
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/prisma prisma
COPY --from=build /app/prisma.config.ts .
COPY --from=build /app/package.json .
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node .output/server/index.mjs"]
```

### File di Supporto

| File | Scopo |
|------|-------|
| `railway.toml` | Builder dockerfile, healthcheck, restart policy |
| `.dockerignore` | Esclude node_modules, .nuxt, uploads, .env, .git |
| `prisma.config.ts` | Datasource URL per Prisma 7 migrations |
| `.node-version` | Creato e poi rimosso (non serviva con Dockerfile) |

### Variabili d'Ambiente Railway

| Variabile | Valore |
|-----------|--------|
| `DATABASE_URL` | Reference dal plugin PostgreSQL |
| `UPLOAD_DIR` | `/data/uploads` |
| `NODE_ENV` | `production` |
| `PORT` | `8080` (set nel Dockerfile) |

### Lezioni Apprese (Deploy)

1. **Nixpacks ha versioni Node bloccate**: il nix package `nodejs_22` è pinnato a 22.11.0, ignorando `.node-version` e variabili d'ambiente — un Dockerfile custom è l'unica soluzione affidabile
2. **postinstall è una trappola nel Dockerfile**: `npm ci` esegue gli script postinstall, che nel nostro caso includono `prisma generate` — tutti i file necessari devono essere presenti *prima* di `npm ci`
3. **Prisma 7 ha rotto il deploy pattern classico**: `url` nel datasource non è più supportato, serve `prisma.config.ts` — la documentazione di deploy vecchia non funziona
4. **Copiare solo parti di node_modules è fragile**: le dipendenze transitive (valibot, @prisma/dev) non sono ovvie — meglio copiare tutto `node_modules`
5. **Railway porta ≠ EXPOSE**: il dominio pubblico ha una porta configurabile separatamente dall'EXPOSE del Dockerfile

### Metriche Sprint 9

| Metrica | Valore |
|---------|--------|
| File nuovi | 3 (Dockerfile, .dockerignore, prisma.config.ts) |
| File modificati | 4 (railway.toml, package.json, nuxt.config.ts, schema.prisma) |
| Problemi risolti | 7 |
| Commit | 9 |
| Tempo totale | ~2 ore |

---

## Riepilogo Complessivo

| Fase | Tempo | Output |
|------|-------|--------|
| Setup iniziale + Wizard | ~45 min | Form 5 step funzionante |
| Sprint 1-5 (View Mode) | ~2 ore | Pagina dettaglio completa |
| Sprint 6 (Testing) | ~30 min | 64 test per composables core |
| Sprint 7 (Edit Mode) | ~3 ore | Modifica inline + modal + guard + 46 nuovi test |
| Sprint 1-5 Backend (API) | ~2 ore | 14 endpoint REST + Docker + seed |
| Sprint 8 (Frontend → API) | ~3 ore | Connessione reale + 5 bug fix + platform actions |
| Sprint 9 (Deploy Railway) | ~2 ore | App live in produzione con DB + volume |
| **Totale** | **~13.5 ore** | **Full-stack app in produzione** |

**Stima sviluppo tradizionale**: 10-15 giorni developer senior

**Fattore accelerazione**: ~7-10x

---

*Documento aggiornato durante sessione di sviluppo DaniMarket - Marzo 2026*
