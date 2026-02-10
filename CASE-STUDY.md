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

*Documento generato durante sessione di sviluppo DaniMarket - Febbraio 2026*
