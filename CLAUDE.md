# DC Candidate Statehood Tracker

**Live URL:** https://candidates.representdc.org
**Part of:** [RepresentDC.org](https://www.representdc.org) advocacy platform

## What This Is

A React SPA that tracks 2026 DC election candidates' positions on statehood and home rule. Candidates complete a 7-question Google Form questionnaire; approved responses are published here for voters to compare.

## Tech Stack

- React 19 + React Router 7 (BrowserRouter with client-side routing)
- Vite 7 (base: `/` for custom domain)
- Single CSS file (`App.css`) shared across all routes
- GitHub Pages with `gh-pages` package, custom CNAME subdomain
- Cloudflare Web Analytics (token in `index.html`)
- GitHub Pages SPA hack: `404.html` redirects → `index.html` restores path via `sessionStorage`

## Routes & Components

| Route | Component | Data Source | Purpose |
|-------|-----------|-------------|---------|
| `/` | `App.jsx` | `candidates.json` | Main tracker — elected office candidates (Mayor, Delegate, Council, AG, etc.) |
| `/party` | `Party.jsx` | `party-candidates.json` | DC Democratic Party committee candidates (slates: Free DC, Dems United, etc.) |
| `/respond` | `Respond.jsx` | None (static) | Candidate-facing page with Google Form link |

## Data Files

### `src/data/candidates.json`
- Elected office candidates (Mayor, Delegate, Council, AG, Shadow Senator/Rep, At-Large Special Election)
- Each candidate: `{ name, party, office, responded, respondedDate?, supportsStatehood, declined?, undeliverable?, responses? }`
- `responses` object keys: `statehoodSupport`, `topThreeActions`, `intendedActions`, `congressResponse`, `partners`, `voterInvolvement`, `additionalComments`

### `src/data/party-candidates.json`
- DC Democratic Party committee candidates
- Same shape but uses `slate` instead of `party` (e.g., "Free DC Slate", "Democrats United to Free DC")
- Positions: National/At-Large/Ward Committeeman/Committeewoman

## Candidate Status Logic

Candidates display one of four states (check order matters):
1. `responded: true` → "Yes" (green) — has full questionnaire responses
2. `declined: true` → "Declined" (red) — explicitly refused
3. `undeliverable: true` → "No Valid Contact" (yellow) — couldn't reach
4. Default → "Pending" (gray) — awaiting response

## Update Workflow (Adding New Responses)

Two methods exist — the CSV script is preferred:

### Method 1: Fetch from Google Sheets (preferred)
```bash
# 1. Fetch directly from Google Sheets and update JSON:
npm run update-candidates
# 2. Review, commit, deploy:
git diff src/data/
git add -A && git commit -m "Update candidates and responses"
npm run deploy   # predeploy hook checks for uncommitted changes, then builds
```

### Method 2: Local CSV file (fallback)
```bash
# If Google Sheets fetch fails, download CSV manually and pass the path:
npm run update-candidates ~/Downloads/responses.csv
```

The script (`scripts/update-candidates.js`):
- Fetches CSV from Google Sheets via gviz endpoint (Sheet ID: `1uPXHjcu8u2RHaZ1VgOIcEuvwvSzXy_N4zGH0pbkakNw`), or reads a local CSV file if a path is provided
- Parses CSV with proper quoted-field handling
- Filters for `Status === "Approved"` rows
- Matches responses to candidates by name + office
- Handles both elected office AND party committee candidates (routes by "DC Democratic Party" office value)
- Has `OFFICE_ALIASES` map for normalizing Google Form office names (includes ward-specific entries: Ward 1/3/5/6 Council Member)
- Has `BASE_CANDIDATES` array as the canonical candidate list for elected offices (auto-sorted by party then last name within each office group)
- Has `findResponse()` with fallback matching for legacy "Ward Council Member" form responses
- Warns about unmatched responses

### Method 3: Google Apps Script (legacy)
- `scripts/GoogleSheetsToJSON.gs` — generates JSON directly in Google Sheets sidebar
- Copy/paste into `candidates.json`

## Adding a New Candidate

1. Add to `BASE_CANDIDATES` array in `scripts/update-candidates.js` (order doesn't matter — auto-sorted)
2. Run the update script (or manually add to `candidates.json` / `party-candidates.json`)
3. For party candidates, edit `party-candidates.json` directly (no base list in script)

## Key Patterns

- **7 questionnaire questions** are hardcoded in the modal in both `App.jsx` and `Party.jsx` — if questions change, update both components AND the update script's `getField()` prefixes
- **"Recent" responses** = responded within last 14 days (configurable via `RECENT_DAYS` constant), shown in a "Latest Responses" section with NEW badges
- **Office filter** dropdown on main page; **Office + Slate filters** on party page
- **Desktop** = table layout; **Mobile** = collapsible card groups by office (main page only)
- **Response modal** opens on click for responded candidates, shows all 7 Q&A pairs
- Primary date constant `PRIMARY_DATE = "June 16, 2026"` appears in multiple components

## Commands

```bash
npm run dev              # Start dev server (Vite)
npm run build            # Production build to dist/
npm run deploy           # Checks for uncommitted changes, builds, deploys to GitHub Pages
npm run update-candidates        # Fetch from Google Sheets and update JSON (or pass a local CSV path as fallback)
npm run lint             # ESLint
```

## Deployment

- `gh-pages` branch serves the `dist/` folder
- CNAME: `candidates.representdc.org`
- `--dotfiles` flag ensures `.nojekyll` is included
- `predeploy` script blocks deploy if there are uncommitted changes (commit first!)
- After deploy, changes are live in ~1-2 minutes
- Committing to `main` does NOT affect the live site — only `npm run deploy` does

## Related Files

- `QUICK-UPDATE.md` — Condensed update workflow reference
- `UPDATING-RESPONSES.md` — Detailed guide including Google Apps Script setup
- `candidate-outreach-tracking.csv` — Outreach tracking (not deployed)
- `scripts/generate-tracking-sheet.js` — Generates the tracking CSV
