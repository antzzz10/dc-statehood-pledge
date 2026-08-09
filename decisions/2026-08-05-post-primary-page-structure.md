# Post-Primary Results Page — Structure & Review Process

**Date:** 2026-08-05
**Status:** Decided, not yet implemented

## Context

Follow-on to the post-primary archive plan (decided 2026-06-21, certifications cleared 2026-07-13 — see project memory `project-post-primary-archive-plan`). This note covers the additional structural and editorial decisions made before implementation starts.

## Decisions

### 1. Review process: temporary duplicate page, then swap
Before replacing the live tracker at `/`, build the new results page as a **new, unlinked route on the live site** (e.g. `/2026-results`), deployed through the existing `npm run deploy` pipeline. Not linked from nav — shared via direct URL for review. This is the same location the content moves to permanently once approved, so no rework when we swap.

Rejected: local-dev-only preview (can't share/test on mobile easily) and a separate preview deployment (unnecessary new infra for a temporary need).

### 2. Page content — winners section
- **Response-rate recognition:** a stat/callout on response rates among winners (e.g. "X of Y winners responded to the questionnaire").
- **Scope:** public office races only — Mayor, Delegate, AG, Council Chairman, At-Large, Wards 1/3/5/6, Shadow Senator/Rep, At-Large special election. Matches the accountability scope locked in 2026-06-21. The DC Dem Party Committee (48 seats) stays stats-only and is **not** part of this winners list or stat.
- **Winners list:** each winner who responded gets their quote plus a link to their full results.
- **BOE links:** each race links out to the actual results on the DC Board of Elections website.

### 3. Non-respondent winners: named CTA
Winners who did not respond to the questionnaire (e.g. Council Chair Phil Mendelson) are **named specifically** in an invite-to-respond call-to-action, encouraging readers to encourage them to fill out the questionnaire. Chosen over a general/unnamed version — consistent with RepresentDC's accountability mission and the user's own framing of the ask.

### 4. Non-winners: separate archive page, full detail
Candidates who responded but didn't win are moved to a **separate, linked archive page** — framed as recognizing they're DC leaders who'll contribute to statehood in other ways, not as a demotion. That page reuses the **existing full Q&A response modal** (same as today's UX) rather than a simplified summary — least engineering work, preserves full context on what they committed to.

## Next steps
Implementation: banner/winners-section component, response-rate stat calculation, non-respondent-winner CTA (with named list), separate non-winner archive page (reusing existing modal), and the new unlinked `/2026-results` route. Read `post-primary-results-draft.md` for approved copy/data — do not re-research results.
