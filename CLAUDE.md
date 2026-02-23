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
- DC Democratic Party committee candidates only (no Republican party positions)
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
- Candidates with `withdrew: true` in BASE_CANDIDATES are excluded from the site JSON output
- Has `findResponse()` with fallback matching for legacy "Ward Council Member" form responses
- Warns about unmatched responses

### Method 3: Google Apps Script (legacy)
- `scripts/GoogleSheetsToJSON.gs` — generates JSON directly in Google Sheets sidebar
- Copy/paste into `candidates.json`

## Adding a New Candidate

1. Add to `BASE_CANDIDATES` array in `scripts/update-candidates.js` (order doesn't matter — auto-sorted)
2. Run the update script (or manually add to `candidates.json` / `party-candidates.json`)
3. For party candidates, edit `party-candidates.json` directly (no base list in script)

## Removing a Candidate (Withdrawal)

1. Add `withdrew: true` to the candidate in `BASE_CANDIDATES` in `scripts/update-candidates.js`
2. Run `npm run update-candidates` — the candidate will be excluded from the output JSON
3. For party candidates, remove the entry from `party-candidates.json` directly
4. Commit and deploy

## Automated BOE Candidate Monitoring

A GitHub Actions workflow monitors the DC Board of Elections for candidate changes.

### How It Works

**Workflow:** `.github/workflows/monitor-boe.yml`
**Schedule:** Daily at 10 AM UTC (6 AM ET) + manual trigger via `workflow_dispatch`
**Script:** `scripts/sync-boe.js`

1. Scrapes https://dcboe.org/elections/2026-elections to find current candidate PDFs
2. Downloads and parses primary + special election candidate lists
3. Compares against `candidate-outreach-tracking.csv` (tracking) AND `src/data/candidates.json` + `party-candidates.json` (live site)
4. If changes detected: applies updates to CSV, commits, pushes
5. Sends email notification with full report and next-step instructions

### Report Sections

- **NEW CANDIDATES** — not yet in tracking CSV
- **NOT YET ON SITE** — in BOE PDF but missing from candidates.representdc.org
- **WITHDRAWALS** — candidates who withdrew
- **WITHDRAWALS STILL ON SITE** — withdrawn candidates still showing on live site
- **CONTACT INFO CHANGES** — updated phone/email

### What It Changes Automatically

- `candidate-outreach-tracking.csv` — adds new candidates, marks withdrawals in Notes, updates contact info
- All existing outreach tracking columns (Date Contacted, Notes, etc.) are preserved

### What It Does NOT Change

- `src/data/candidates.json` — never touched
- `src/data/party-candidates.json` — never touched
- The live site — only changes when you manually run `npm run deploy`

### Required Secrets (repo Settings → Secrets → Actions)

- `EMAIL_USERNAME` — Gmail address (sender)
- `EMAIL_PASSWORD` — Gmail App Password (16-character)
- `NOTIFICATION_EMAIL` — where reports are delivered (any email, e.g., ProtonMail)

### Required Repo Settings

- Settings → Actions → General → Workflow permissions → **"Read and write permissions"**

### Manual Run

```bash
# Run locally (report only):
npm run sync-boe

# Run locally (apply changes to CSV):
npm run sync-boe -- --apply

# Trigger via GitHub Actions:
# Actions tab → "Monitor BOE Candidates" → "Run workflow"
```

### Known Issue: Name Matching False Positives

The `normalizeName` function in `sync-boe.js` can produce false positives for:
- Accented characters (David Sampé vs David Sampe)
- Period in initials (Stanley J. Mayes vs Stanley J Mayes)

Review the "NOT YET ON SITE" section manually to skip duplicates.

## Google Sheets Push (Outreach Tracking)

**Status:** Scripts written, not yet deployed. See `SHEETS-PUSH-SETUP.md` for setup instructions.

Pushes new candidates from the tracking CSV directly into the Google Sheets outreach tracker, deduplicating by name+office. Existing outreach data is never touched.

**Tracking Sheet ID:** `1IRp4eGz79vklgN1OjNzESABlHot2ZTCdliaPmGsAaUc` (gid: `293497211`)

### Files
- `scripts/push-to-sheets.js` — Node script, reads CSV and POSTs to Apps Script web app
- `scripts/google-apps-script-push.gs` — Paste into Google Sheet's Apps Script editor
- `.env` (not committed) — stores `SHEETS_WEBAPP_URL`

### Usage (after setup)
```bash
npm run push-to-sheets              # Push new candidates to Google Sheets
npm run push-to-sheets -- --dry-run # Preview without pushing
```

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
npm run sync-boe         # Compare BOE PDFs against CSV and site data (report only)
npm run push-to-sheets   # Push new candidates to Google Sheets (requires setup)
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
- `SHEETS-PUSH-SETUP.md` — Google Sheets push integration setup guide
- `candidate-outreach-tracking.csv` — Outreach tracking (not deployed, updated by BOE workflow)
- `scripts/generate-tracking-sheet.js` — Generates the tracking CSV
- `scripts/sync-boe.js` — BOE candidate sync pipeline
- `scripts/push-to-sheets.js` — Push candidates to Google Sheets
- `scripts/google-apps-script-push.gs` — Apps Script for Google Sheets integration
