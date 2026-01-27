/**
 * DC Candidate Tracker - Google Sheets to JSON Converter
 *
 * This script reads form responses from a Google Sheet, filters for approved responses,
 * and generates a candidates.json file ready to paste into your project.
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet with form responses
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code
 * 4. Paste this entire file
 * 5. Click Save (disk icon)
 * 6. Refresh your Sheet - you'll see a new "Candidate Tracker" menu
 * 7. Add a column called "Status" to mark responses as "Approved" or "Rejected"
 *
 * USAGE:
 * 1. Review new responses in your Sheet
 * 2. Mark each row as "Approved" or "Rejected" in the Status column
 * 3. Click "Candidate Tracker" menu → "Generate JSON"
 * 4. Copy the JSON from the sidebar
 * 5. Paste into src/data/candidates.json
 * 6. Deploy your site
 */

// Configuration - UPDATE THESE to match your sheet column names
const CONFIG = {
  // Which column has the approval status?
  statusColumn: 'Status', // Column with "Approved" or "Rejected"

  // Form response column names (update to match YOUR Google Form)
  columns: {
    timestamp: 'Timestamp',
    name: 'Name',
    office: 'Office',
    party: 'Party',
    question1: 'Do you support DC Statehood?',
    question2: 'What are the top three actions you are most proud of having already taken for Statehood over the last two years?',
    question3: 'What specific actions do you intend to take to promote DC Statehood and protect Home Rule, as a DC elected official?',
    question4: 'If elected, how will you respond when Congress attempts to overturn DC laws or block DC\'s budget? Please name at least one specific action you would take.',
    question5: 'Name the top 2-3 partners you intend to work with in promoting Statehood, and what your relationship is with those partners today.',
    question6: 'How do you intend to involve DC voters and residents in the fight for Statehood?',
    question7: 'Is there anything else you would like to share with DC voters about your stance on DC Statehood?'
  }
};

// Create custom menu when sheet opens
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Candidate Tracker')
    .addItem('Generate JSON', 'generateJSON')
    .addItem('Setup Help', 'showSetupHelp')
    .addToUi();
}

/**
 * Main function - generates JSON from approved responses
 */
function generateJSON() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    // Get all data from sheet
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    // Find column indices
    const colIndices = getColumnIndices(headers);

    // Get all candidates from the base list
    const allCandidates = getBaseCandidateList();

    // Process approved responses
    const approvedResponses = rows
      .filter(row => row[colIndices.status] === 'Approved')
      .map(row => parseResponse(row, colIndices));

    // Merge responses into candidate list
    const candidatesWithResponses = mergeCandidatesWithResponses(allCandidates, approvedResponses);

    // Generate JSON
    const json = JSON.stringify({ candidates: candidatesWithResponses }, null, 2);

    // Show in sidebar
    showJSONSidebar(json, approvedResponses.length);

  } catch (error) {
    ui.alert('Error', 'Failed to generate JSON: ' + error.message, ui.ButtonSet.OK);
  }
}

/**
 * Get column indices from headers
 */
function getColumnIndices(headers) {
  const indices = {};

  // Find status column
  indices.status = headers.indexOf(CONFIG.statusColumn);
  if (indices.status === -1) {
    throw new Error(`Column "${CONFIG.statusColumn}" not found. Please add this column to mark responses as Approved/Rejected.`);
  }

  // Find form response columns
  for (const [key, columnName] of Object.entries(CONFIG.columns)) {
    indices[key] = headers.indexOf(columnName);
    if (indices[key] === -1) {
      throw new Error(`Column "${columnName}" not found. Please update CONFIG.columns in the script.`);
    }
  }

  return indices;
}

/**
 * Parse a single response row
 */
function parseResponse(row, colIndices) {
  return {
    name: row[colIndices.name]?.toString().trim(),
    office: row[colIndices.office]?.toString().trim(),
    party: row[colIndices.party]?.toString().trim(),
    statehoodSupport: parseStatehoodAnswer(row[colIndices.question1]),
    responses: {
      statehoodSupport: row[colIndices.question1]?.toString().trim() || '',
      topThreeActions: row[colIndices.question2]?.toString().trim() || '',
      intendedActions: row[colIndices.question3]?.toString().trim() || '',
      congressResponse: row[colIndices.question4]?.toString().trim() || '',
      partners: row[colIndices.question5]?.toString().trim() || '',
      voterInvolvement: row[colIndices.question6]?.toString().trim() || '',
      additionalComments: row[colIndices.question7]?.toString().trim() || ''
    }
  };
}

/**
 * Parse statehood answer to Yes/No/Conditional
 */
function parseStatehoodAnswer(answer) {
  if (!answer) return null;

  const text = answer.toString().toLowerCase().trim();

  if (text.startsWith('yes')) return 'Yes';
  if (text.startsWith('no')) return 'No';
  if (text.includes('maybe') || text.includes('depends') || text.includes('conditional')) {
    return 'Conditional';
  }

  return text; // Return as-is if we can't parse
}

/**
 * Get the base list of all candidates (54 candidates)
 * UPDATE THIS LIST if candidates change
 */
function getBaseCandidateList() {
  return [
    { name: "Gordon Chaffin", party: "Democratic", office: "Delegate to the House of Representatives" },
    { name: "Trent Holbrook", party: "Democratic", office: "Delegate to the House of Representatives" },
    { name: "Robert L. Matthews", party: "Democratic", office: "Delegate to the House of Representatives" },
    { name: "Brooke Pinto", party: "Democratic", office: "Delegate to the House of Representatives" },
    { name: "Sandi Stevens", party: "Democratic", office: "Delegate to the House of Representatives" },
    { name: "Robert White", party: "Democratic", office: "Delegate to the House of Representatives" },
    { name: "Kelly Mikel Williams", party: "Democratic", office: "Delegate to the House of Representatives" },
    { name: "Kinney Zalesne", party: "Democratic", office: "Delegate to the House of Representatives" },
    { name: "Nelson Rimensnyder", party: "Republican", office: "Delegate to the House of Representatives" },
    { name: "Denise Rosado", party: "Republican", office: "Delegate to the House of Representatives" },
    { name: "Kymone Freeman", party: "Statehood Green", office: "Delegate to the House of Representatives" },
    { name: "Yaida Ford", party: "Democratic", office: "Mayor" },
    { name: "Janeese Lewis George", party: "Democratic", office: "Mayor" },
    { name: "Gary Goodweather", party: "Democratic", office: "Mayor" },
    { name: "Kathy Henderson", party: "Democratic", office: "Mayor" },
    { name: "Ernest Johnson", party: "Democratic", office: "Mayor" },
    { name: "Regan Jones", party: "Democratic", office: "Mayor" },
    { name: "Stanley V Lawson Sr", party: "Democratic", office: "Mayor" },
    { name: "Terri \"Ginger\" Little", party: "Democratic", office: "Mayor" },
    { name: "Kenyan R. McDuffie", party: "Democratic", office: "Mayor" },
    { name: "Anthony Muhammad", party: "Democratic", office: "Mayor" },
    { name: "Myrtle Patricia Alexander", party: "Republican", office: "Mayor" },
    { name: "Christopher E. Rossi", party: "Republican", office: "Mayor" },
    { name: "Muhsin Boe Umar", party: "Statehood Green", office: "Mayor" },
    { name: "Brian L. Schwalb", party: "Democratic", office: "Attorney General" },
    { name: "J.P. Szymkowicz", party: "Democratic", office: "Attorney General" },
    { name: "Manuel Rivera", party: "Republican", office: "Attorney General" },
    { name: "Phil Mendelson", party: "Democratic", office: "Council Chairman" },
    { name: "Kevin B. Chavous", party: "Democratic", office: "At-Large Council Member" },
    { name: "Dwight Davis", party: "Democratic", office: "At-Large Council Member" },
    { name: "Dyana Forester", party: "Democratic", office: "At-Large Council Member" },
    { name: "Fred Hill", party: "Democratic", office: "At-Large Council Member" },
    { name: "Joe Jackson", party: "Democratic", office: "At-Large Council Member" },
    { name: "Leniqua'dominique Jenkins", party: "Democratic", office: "At-Large Council Member" },
    { name: "Candace Tiana Nelson", party: "Democratic", office: "At-Large Council Member" },
    { name: "Oye Owolewa", party: "Democratic", office: "At-Large Council Member" },
    { name: "Lisa Raymond", party: "Democratic", office: "At-Large Council Member" },
    { name: "Patricia Stamper", party: "Democratic", office: "At-Large Council Member" },
    { name: "Darrell Green", party: "Republican", office: "At-Large Council Member" },
    { name: "Rashida Brown", party: "Democratic", office: "Ward 1 Council Member" },
    { name: "Terry Lynch", party: "Democratic", office: "Ward 1 Council Member" },
    { name: "Aparna Raj", party: "Democratic", office: "Ward 1 Council Member" },
    { name: "Jackie Reyes Yanes", party: "Democratic", office: "Ward 1 Council Member" },
    { name: "Miguel Trindade Deramo", party: "Democratic", office: "Ward 1 Council Member" },
    { name: "Jett James Jasper", party: "Republican", office: "Ward 1 Council Member" },
    { name: "Bernita Carmichael", party: "Democratic", office: "Ward 5 Council Member" },
    { name: "Zachary Parker", party: "Democratic", office: "Ward 5 Council Member" },
    { name: "Jeffrey Kihien-Palza", party: "Republican", office: "Ward 5 Council Member" },
    { name: "Charles Allen", party: "Democratic", office: "Ward 6 Council Member" },
    { name: "Michael Murphy", party: "Democratic", office: "Ward 6 Council Member" },
    { name: "Gloria Ann Nauden", party: "Democratic", office: "Ward 6 Council Member" },
    { name: "Jorge Rice", party: "Republican", office: "Ward 6 Council Member" },
    { name: "Markus Batchelor", party: "Democratic", office: "United States Senator" },
    { name: "Robert Simmons", party: "Republican", office: "United States Senator" },
    { name: "Milton Hardy", party: "Republican", office: "United States Representative" }
  ];
}

/**
 * Merge approved responses into candidate list
 */
function mergeCandidatesWithResponses(allCandidates, approvedResponses) {
  return allCandidates.map(candidate => {
    // Find matching response by name and office
    const response = approvedResponses.find(r =>
      r.name.toLowerCase() === candidate.name.toLowerCase() &&
      r.office.toLowerCase() === candidate.office.toLowerCase()
    );

    if (response) {
      return {
        name: candidate.name,
        party: candidate.party,
        office: candidate.office,
        responded: true,
        supportsStatehood: response.statehoodSupport,
        responses: response.responses
      };
    } else {
      return {
        name: candidate.name,
        party: candidate.party,
        office: candidate.office,
        responded: false,
        supportsStatehood: null
      };
    }
  });
}

/**
 * Show JSON in sidebar for easy copying
 */
function showJSONSidebar(json, responseCount) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 15px;
          }
          .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
          }
          .instructions {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-size: 12px;
          }
          textarea {
            width: 100%;
            height: 400px;
            font-family: monospace;
            font-size: 11px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          button {
            background: #DC143C;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
            margin-top: 10px;
          }
          button:hover {
            background: #A00000;
          }
        </style>
      </head>
      <body>
        <div class="success">
          ✓ Generated JSON for ${responseCount} approved response(s)
        </div>

        <div class="instructions">
          <strong>Next Steps:</strong><br>
          1. Click "Copy JSON" below<br>
          2. Open <code>src/data/candidates.json</code><br>
          3. Replace entire contents with copied JSON<br>
          4. Commit and deploy
        </div>

        <textarea id="jsonOutput" readonly>${json}</textarea>

        <button onclick="copyToClipboard()">Copy JSON</button>

        <script>
          function copyToClipboard() {
            const textarea = document.getElementById('jsonOutput');
            textarea.select();
            document.execCommand('copy');
            alert('JSON copied to clipboard!');
          }
        </script>
      </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setTitle('Candidate Tracker JSON')
    .setWidth(500);

  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

/**
 * Show setup help
 */
function showSetupHelp() {
  const ui = SpreadsheetApp.getUi();

  ui.alert(
    'Setup Help',
    'REQUIRED COLUMN:\n' +
    '• Add a "Status" column to your sheet\n' +
    '• Mark each row as "Approved" or "Rejected"\n\n' +
    'COLUMN NAMES:\n' +
    '• Update CONFIG.columns at the top of the script\n' +
    '• Match your Google Form question text exactly\n\n' +
    'USAGE:\n' +
    '1. Review responses\n' +
    '2. Mark as Approved/Rejected\n' +
    '3. Click "Generate JSON"\n' +
    '4. Copy and paste into candidates.json',
    ui.ButtonSet.OK
  );
}
