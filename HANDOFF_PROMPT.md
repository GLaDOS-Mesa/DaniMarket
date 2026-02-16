# DaniMarket - Handoff Prompt per Nuova Sessione

## Progetto
DaniMarket è un marketplace Vue/Nuxt 3 per gestire annunci su più piattaforme (Vinted, eBay, Subito, etc.).

## Tech Stack
- **Framework**: Nuxt 3 + TypeScript + Composition API (`<script setup lang="ts">`)
- **Styling**: Tailwind CSS (no DaisyUI)
- **Database**: Prisma ORM + PostgreSQL (Neon)
- **Test**: Vitest v2.1.9 + @vue/test-utils

## Sprint 7 - Edit Mode (COMPLETATO ✅)

### Cosa è stato implementato

#### 7.1 useListingDetail Composable
- **File**: `composables/useListingDetail.ts`
- Singleton state pattern per gestione edit mode
- Deep clone per working copy
- Change tracking con `areValuesEqual()` per confronto profondo
- Validazione campi (riuso pattern da useListingForm)
- Funzioni: `enterEditMode`, `exitEditMode`, `updateField`, `discardChanges`, `getFieldLabel`
- Computed: `isEditMode`, `workingCopy`, `hasChanges`, `modifiedFields`, `isValid`, `validationErrors`

#### 7.2 ActionBar Edit Mode
- **File**: `components/listings/detail/ActionBar.vue`
- Bottoni "Modifica" / "Salva" + "Annulla" in edit mode
- Salva disabilitato se non ci sono modifiche o validazione fallisce

#### 7.3 ListingBasicInfo Edit Mode
- **File**: `components/listings/detail/ListingBasicInfo.vue`
- Edit per: titolo, descrizione, prezzo, categoria, condizione
- Indicatore campi modificati: `ring-2 ring-amber-300 border-amber-400`
- Validazione inline con messaggi errore

#### 7.4 ListingDetails Edit Mode
- **File**: `components/listings/detail/ListingDetails.vue`
- Edit per: marca, taglia, colori (multi-select), materiale
- Taglia condizionale (solo per CLOTHING/SHOES)

#### 7.5 ListingShipping Edit Mode
- **File**: `components/listings/detail/ListingShipping.vue`
- Autocomplete città con `useItalianCities` composable
- Provincia auto-fill
- Toggle spedizione disponibile
- Dimensione pacco (radio) e costo spedizione (condizionali)

#### 7.6 ListingGallery Edit Mode
- **File**: `components/listings/detail/ListingGallery.vue`
- Drag-to-reorder immagini
- Rimozione foto con X
- Aggiunta foto con dropzone
- Badge "Copertina" su prima foto
- Contatore "X/6 foto"

#### 7.7 UnsavedChangesModal + Navigation Guard
- **File**: `components/listings/detail/UnsavedChangesModal.vue`
- Modal warning con lista campi modificati
- Bottoni: "Salva e esci", "Esci senza salvare", "Annulla"
- **File**: `pages/listings/[id].vue`
- `onBeforeRouteLeave` navigation guard
- Gestione `pendingNavigation` per navigazione dopo salvataggio

### Pattern Chiave

```typescript
// Indicatore campo modificato
:class="{ 'ring-2 ring-amber-300 border-amber-400': isFieldModified('fieldName') }"

// Transizioni
class="transition-all duration-200"

// Props componenti edit mode
interface Props {
  isEditMode?: boolean
  workingCopy?: Partial<Listing>
  modifiedFields?: Set<string>
  errors?: Record<string, string>
}

// Emit update
emit('update', field, value)
```

### Struttura ListingPhoto
```typescript
interface ListingPhoto {
  file: File
  rotation: 0 | 90 | 180 | 270
  displayRotation: number
}
```

## Test (110 test passano ✅)

### File test aggiornati
- `tests/composables/useListingForm.test.ts` - Usa `createListingPhoto()` helper
- `tests/composables/useListingDetail.test.ts` - Usa `ListingStatus.ACTIVE` enum

### Fix applicati
- Accesso proprietà foto: `.file.name` invece di `.name`
- Downgrade Vitest da v4.0.18 a v2.1.9 (bug Windows)

## Comandi Utili

```bash
# Dev server
npm run dev

# Test
npm run test

# Typecheck
npx nuxi typecheck
```

## Commit Recenti
```
097dc80 fix(tests): update tests for ListingPhoto structure and downgrade vitest
17aaa79 feat(listings): add UnsavedChangesModal and navigation guard
d0a059e feat(listings): add edit mode to ListingGallery component
fa3be31 feat(listings): add edit mode to ListingShipping component
032c9be feat(listings): add edit mode to ListingDetails component
```

## Known Issues
- `server/utils/prisma.ts` ha un errore TS pre-esistente (`PrismaClient` export)
- Vue Router warning: No match found for `/settings` (route non implementata)

## Prossimi Step Suggeriti
- Sprint 8: Implementare salvataggio reale su API
- Sprint 9: Pagina /settings
- Miglioramenti UX: animazioni, feedback visivi
