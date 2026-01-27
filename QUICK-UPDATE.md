# Quick Update Workflow

The simplest way to update candidate responses - no editing, no copy/paste.

## Every Time You Have New Responses

### 1. Download CSV from Google Sheets

1. Open your Google Sheet with form responses
2. Click **File → Download → Comma Separated Values (.csv)**
3. File downloads to `~/Downloads/[SheetName].csv`

### 2. Mark Approved Responses

Before downloading, add a "Status" column and mark each row:
- `Approved` - Publish this response
- `Rejected` - Skip this (spam, test, etc.)

### 3. Run One Command

```bash
npm run update-candidates ~/Downloads/[YourFileName].csv
```

**That's it!** The script:
- ✅ Reads the CSV
- ✅ Filters only "Approved" responses
- ✅ Updates `candidates.json` automatically
- ✅ Shows you what changed

### 4. Review and Deploy

```bash
git diff src/data/candidates.json    # See what changed
git add src/data/candidates.json
git commit -m "Update responses: [names]"
git push && npm run deploy
```

---

## Example Complete Workflow (2 minutes)

```bash
# After downloading CSV from Google Sheets:
npm run update-candidates ~/Downloads/DC-Questionnaire.csv

# Output shows:
# ✓ Janeese Lewis George (Mayor)
# ✓ Robert White (Delegate to the House of Representatives)
# Updated src/data/candidates.json

# Review what changed
git diff src/data/candidates.json

# Deploy
git add src/data/candidates.json
git commit -m "Update responses: Janeese Lewis George, Robert White"
git push && npm run deploy
```

Done! New responses are live in ~1 minute.

---

## Troubleshooting

**"Column not found" error:**
- Column names in CSV must match exactly
- Check `scripts/update-candidates.js` CONFIG section if you changed form questions

**"No approved responses found":**
- Make sure you have a "Status" column
- Mark rows as "Approved" (case-sensitive)

**Candidate name doesn't match:**
- Edit the name in Google Sheet to match exactly
- Or update BASE_CANDIDATES list in `scripts/update-candidates.js`

---

## Why This Is Better

**Old way:** Open editor → Select all → Paste JSON → Save → Deploy
**New way:** Download CSV → One command → Deploy

No editing. No copy/paste. Just one command.
