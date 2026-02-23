# Google Sheets Push — Setup Instructions

Push new candidates from the tracking CSV directly into your Google Sheet. No manual column matching needed.

## What's Already Done
- `scripts/push-to-sheets.js` — Node script that reads CSV and POSTs to Google Sheets
- `scripts/google-apps-script-push.gs` — Apps Script code to paste into your sheet
- `npm run push-to-sheets` command added to package.json
- `.env` added to .gitignore

## Setup Steps (one-time, ~2 minutes)

### 1. Add the Apps Script to your Google Sheet

1. Open your outreach tracking Google Sheet
2. **Extensions** → **Apps Script**
3. Delete the default code
4. Copy/paste the entire contents of `scripts/google-apps-script-push.gs`
5. Click **Save** (Ctrl+S)

### 2. Deploy as a Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon → **Web app**
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. Authorize when prompted (click through the "unsafe" warning — it's your own script)
6. **Copy the Web App URL** (looks like `https://script.google.com/macros/s/ABC.../exec`)

### 3. Save the URL locally

```bash
cd ~/Projects/dc-statehood-pledge
echo 'SHEETS_WEBAPP_URL="https://script.google.com/macros/s/YOUR_URL_HERE/exec"' > .env
```

Replace `YOUR_URL_HERE` with the actual URL from step 2.

### 4. Test it

```bash
# Preview what would be sent (no actual changes)
npm run push-to-sheets -- --dry-run

# Push for real
npm run push-to-sheets
```

## How It Works

1. Reads all candidates from `candidate-outreach-tracking.csv`
2. Sends them to the Apps Script web app
3. The Apps Script **deduplicates by Name + Office** — only appends new rows
4. Your existing outreach data (Date Contacted, Notes, etc.) is **never touched**

## Day-to-Day Workflow

After the daily BOE monitoring workflow runs (or after running `npm run sync-boe -- --apply`):

```bash
git pull                    # Get the updated CSV from the workflow
npm run push-to-sheets      # Push new candidates to Google Sheets
```

That's it — new candidates appear in your sheet, ready for outreach.

## Updating the Apps Script

If you need to change the script (e.g., column changes):
1. Edit `scripts/google-apps-script-push.gs` locally
2. Copy/paste into Apps Script editor
3. **Deploy** → **Manage deployments** → Edit the existing deployment → **Deploy**
   (This keeps the same URL so your .env doesn't need to change)

## Troubleshooting

- **"SHEETS_WEBAPP_URL not set"** — Create the `.env` file (step 3 above)
- **Error from Apps Script** — Open Apps Script editor → Executions tab to see logs
- **Candidates not appearing** — Run `testAccess()` in Apps Script editor to verify sheet access
- **Need to redeploy** — After editing the script, you must redeploy for changes to take effect
