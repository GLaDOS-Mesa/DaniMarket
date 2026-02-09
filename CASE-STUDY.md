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

*Documento generato durante sessione di sviluppo DaniMarket - Febbraio 2026*
