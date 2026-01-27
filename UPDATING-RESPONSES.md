# Updating Candidate Responses

This guide explains how to update the site with new candidate responses from your Google Form.

## One-Time Setup (5 minutes)

### Step 1: Add Status Column to Your Sheet

1. Open your Google Sheet with form responses
2. Add a new column called **"Status"** (any position is fine)
3. This is where you'll mark responses as "Approved" or "Rejected"

### Step 2: Install the Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code in the editor
3. Open the file `/scripts/GoogleSheetsToJSON.gs` from this project
4. Copy the entire contents
5. Paste into the Apps Script editor
6. Click **Save** (disk icon)
7. Close the Apps Script tab

### Step 3: Configure Column Names

The script needs to know which columns contain which data.

1. Go back to **Extensions → Apps Script**
2. Find the `CONFIG` section at the top (around line 27)
3. Update the column names to match YOUR Google Form:

```javascript
const CONFIG = {
  statusColumn: 'Status', // Your approval column name

  columns: {
    name: 'Name of candidate',      // Your form's exact column name
    office: 'Position running for?',  // Your form's exact column name
    question1: '1. Do you support DC Statehood?',  // Copy exact question text
    question2: '2. What are the top three actions...',  // Copy exact question text
    // ... etc
  }
};
```

**Note:** The script is already configured with your exact column names, so you shouldn't need to change anything!

4. Click **Save**
5. **Refresh your Google Sheet** - you should see a new menu: **"Candidate Tracker"**

✅ Setup complete!

---

## Regular Update Workflow (5-10 minutes)

### Every time you want to publish new responses:

#### 1. Review New Responses

Open your Google Sheet and look at new form submissions.

#### 2. Mark Each Response

In the **Status** column, type one of:
- `Approved` - Include this response on the site
- `Rejected` - Spam or invalid, don't publish

**What to reject:**
- Spam or joke responses
- Responses not from actual candidates
- Duplicate submissions (keep the latest)
- Incomplete responses (your call - you can manually add these later)

#### 3. Generate JSON

1. Click **Candidate Tracker** menu → **Generate JSON**
2. Wait a moment - a sidebar will appear
3. The sidebar shows:
   - How many responses were processed
   - The complete JSON for all 54 candidates
   - A "Copy JSON" button

#### 4. Copy the JSON

Click **"Copy JSON"** button in the sidebar. The entire JSON is now on your clipboard.

#### 5. Update Your Code

1. Open `/Users/andriathomas/Projects/dc-statehood-pledge/src/data/candidates.json`
2. Select all (Cmd+A)
3. Paste (Cmd+V) - replaces entire file
4. Save the file

#### 6. Review Changes (Optional but Recommended)

```bash
cd /Users/andriathomas/Projects/dc-statehood-pledge
git diff src/data/candidates.json
```

This shows you exactly what changed. Look for:
- New candidates showing `"responded": true`
- Their answers populated in `"responses"`
- Make sure nothing looks broken

#### 7. Deploy to Site

```bash
git add src/data/candidates.json
git commit -m "Update candidate responses: [list names]"
git push && npm run deploy
```

Example commit message:
```
Update candidate responses: Janeese Lewis George, Robert White, Brooke Pinto
```

#### 8. Verify Live

Wait 1-2 minutes, then visit https://candidates.representdc.org

- Find the candidates you updated
- They should show "✓ Yes" in Responded column
- Click "View Response" to check their answers display correctly

---

## Tips & Troubleshooting

### "Column not found" Error

The script can't find a column it expects. Fix:
1. Go to Extensions → Apps Script
2. Update the `CONFIG.columns` section to match your form's exact question text
3. Column names are case-sensitive and must match exactly

### Response Not Showing on Site

Check:
1. Did you mark it "Approved" (not "approved" - case matters)?
2. Does the name and office match exactly? Script matches by name + office
3. Look in the JSON - is `"responded": true`?

### Candidate Name Doesn't Match

If the form response has a slightly different name than your candidate list:

**Option A: Edit in Google Sheet**
1. Change the name in the form response to match exactly
2. Re-generate JSON

**Option B: Update Base List**
1. Go to Extensions → Apps Script
2. Find `getBaseCandidateList()` function (around line 170)
3. Update the candidate's name to match the form response
4. Save and re-generate JSON

### How Party Information Works

Party affiliation is **not** collected in the form - it comes from the base candidate list in the script.

The script matches responses by **name + office**, then adds the party from the hardcoded candidate list. This ensures:
- Candidates don't need to specify party in the form
- Party info stays consistent across the site
- You control the party labels (Democratic, Republican, Statehood Green)

### Want to Remove a Response?

1. In Google Sheet, change Status from "Approved" to "Rejected"
2. Re-generate JSON
3. Deploy - the candidate will show as "No Response" again

### Manually Adding a Response

If you need to add a response that didn't come through the form:

1. Add a row to your Google Sheet
2. Fill in: Name, Office, Party, and all 7 question answers
3. Mark Status as "Approved"
4. Generate JSON as normal

---

## Sample User

The site has a "Sample User" test candidate. You have two options:

**Keep it** (shows voters what responses will look like):
- Leave it in `candidates.json`
- Don't include in your base candidate list in Apps Script

**Remove it** (once you have real responses):
1. Edit `/src/data/candidates.json`
2. Delete the Sample User object (first entry)
3. Commit and deploy

---

## Getting Help

If something's not working:

1. Check the **Apps Script logs**: Extensions → Apps Script → Executions
2. Look for error messages
3. Common issues:
   - Column names don't match (case-sensitive!)
   - Status column missing
   - Name/office mismatch between form and base list

Need to update this guide or the script? All files are in:
- `/scripts/GoogleSheetsToJSON.gs` - The Apps Script code
- `/src/data/candidates.json` - The candidate data file
- This file: `/UPDATING-RESPONSES.md`
