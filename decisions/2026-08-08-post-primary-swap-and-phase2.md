# Post-Primary Swap + Phase 2 Backlog

**Date:** 2026-08-08
**Status:** Swap complete; Phase 2 items are backlog, not started

## Context

Follow-on to `decisions/2026-08-05-post-primary-page-structure.md`. The `/2026-results` preview was reviewed, revised (compressed layout, inline non-respondent CTAs, evergreen `/respond` copy), and is now swapped live as the site's homepage.

## Route structure (implemented)

| Route | Component | Content |
|---|---|---|
| `/` | `PostPrimaryResults.jsx` | Winners summary — the new front door |
| `/archive` | `PostPrimaryArchive.jsx` | Non-winning respondents, generically framed |
| `/2026/primary` | `App.jsx` (unchanged component, moved route) | Full candidate archive — every 2026 primary candidate, all offices, filterable table |
| `/respond` | `Respond.jsx` | Always-on questionnaire request page (no primary-date references) |
| `/party` | `Party.jsx` | DC Dem Party Committee tracker — **not yet given the same treatment**, see Phase 2 |

`App.jsx` (the old full tracker) got a consistency pass since it's now framed as an archive rather than a live pre-election tool: hero/about copy rewritten out of "before you vote" framing, results-preview header changed from "Updated as They Come In" to a static title, and a new banner at top points back to `/`. Its "Last updated" note now derives from the max `respondedDate` in `candidates.json` instead of `new Date()` at render time — it only changes when a response is actually added or edited, not on every page load. Same fix was **not** applied to `Party.jsx` (still uses live-rendered date) — see Phase 2.

Cross-page links were swept for consistency: `Respond.jsx`'s two links to the full table now point to `/2026/primary` (not `/`, which is now the summary); `Party.jsx`'s two links describing "Mayor, Council & Delegate candidates" now point to `/2026/primary` for the same reason. Footers on `/` and `/archive` now carry matching Contact/More/Tools structure, each linking to the other plus `/2026/primary` and `/party`.

## Phase 2 backlog (not started)

1. **"Where do your elected DC Democrats stand on statehood?"** — apply the same post-primary treatment to `Party.jsx` / the DC Dem Party Committee tracker: a results summary (committee makeup, response rates by slate), consistent archive framing, and the same copy/date fixes already applied to `App.jsx` (stale `PRIMARY_DATE` reference in the "Why Party Elections Matter" section, live-rendered "Last updated" date). Scope and structure TBD — likely mirrors the `/` + `/archive` pattern but needs its own review since the committee race has 48 seats across slates rather than single winners per office.
2. **Full review of `scripts/update-candidates.js`** (and possibly `scripts/sync-boe.js`) for handling a late response from one of the current non-respondent winners (Phil Mendelson, Paul Strauss) coming in post-election. Known gap: the update script only writes to `candidates.json` / `party-candidates.json` — it does **not** touch `src/data/post-primary-results.json`, so a late response wouldn't automatically flip that race's `responded` field or populate a quote on the new homepage. Needs either a manual update-results.json step documented, or the script extended to keep both in sync.
