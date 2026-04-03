/**
 * Google Apps Script — paste this into your outreach tracking Google Sheet.
 *
 * Setup:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Replace the default code with this entire file
 * 4. Click Deploy → New deployment
 * 5. Type: Web app
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Click Deploy, authorize when prompted
 * 9. Copy the Web App URL — paste it into .env as SHEETS_WEBAPP_URL
 *
 * The web app accepts POST requests with JSON candidate data:
 *   - candidates: new rows to append (deduped by name+office)
 *   - updates: existing rows to update Ballot Status on (name+office key)
 *
 * Ballot Status conditional formatting (set up once in Sheets UI):
 *   Format → Conditional formatting → apply to Ballot Status column
 *     "Did Not Qualify" → red background (#f4cccc)
 *     "Withdrew"        → orange background (#fce5cd)
 *     "Active"          → green background (#d9ead3)
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var candidates = data.candidates || [];
    var updates = data.updates || [];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets().filter(function(s) { return s.getSheetId() === 293497211; })[0] || ss.getActiveSheet();

    // Column order must match sheet headers
    var headers = ['Name', 'Party', 'Office', 'Election Type', 'Party Committee',
                   'Slate', 'Email Address', 'Phone Number', 'Date Contacted',
                   'Follow-up Date', 'Response Status', 'Response Date',
                   'Questionnaire Sent', 'Questionnaire Returned', 'Approved', 'Notes',
                   'Ballot Status'];

    // Ensure Ballot Status column exists in the sheet — add it if missing
    var lastCol = sheet.getLastColumn();
    var sheetHeaderRow = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    var ballotStatusCol = sheetHeaderRow.indexOf('Ballot Status') + 1; // 1-indexed, 0 = not found
    if (ballotStatusCol === 0) {
      ballotStatusCol = lastCol + 1;
      sheet.getRange(1, ballotStatusCol).setValue('Ballot Status');
    }

    // Build row index: "name|office" -> row number
    var lastRow = sheet.getLastRow();
    var rowIndex = {};
    if (lastRow > 1) {
      var names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      var offices = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
      for (var i = 0; i < names.length; i++) {
        var key = (names[i][0] + '|' + offices[i][0]).toLowerCase().trim();
        rowIndex[key] = i + 2; // row number (1-indexed, +1 for header row)
      }
    }

    // Process ballot status updates on existing rows
    var statusUpdated = 0;
    for (var u = 0; u < updates.length; u++) {
      var upd = updates[u];
      var updKey = (upd['Name'] + '|' + upd['Office']).toLowerCase().trim();
      var rowNum = rowIndex[updKey];
      if (rowNum && upd['Ballot Status']) {
        sheet.getRange(rowNum, ballotStatusCol).setValue(upd['Ballot Status']);
        statusUpdated++;
      }
    }

    // Append new candidates (skip existing)
    var added = 0;
    var skipped = [];
    for (var j = 0; j < candidates.length; j++) {
      var c = candidates[j];
      var cKey = (c['Name'] + '|' + c['Office']).toLowerCase().trim();
      if (rowIndex[cKey] !== undefined) {
        skipped.push(c['Name']);
        continue;
      }
      var row = headers.map(function(h) { return c[h] || ''; });
      sheet.appendRow(row);
      rowIndex[cKey] = sheet.getLastRow();
      added++;
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      added: added,
      statusUpdated: statusUpdated,
      skipped: skipped,
      message: added + ' candidates added, ' + statusUpdated + ' ballot statuses updated, ' + skipped.length + ' already existed'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run from Apps Script editor to verify sheet access
function testAccess() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets().filter(function(s) { return s.getSheetId() === 293497211; })[0] || ss.getActiveSheet();
  Logger.log('Sheet name: ' + sheet.getName());
  Logger.log('Last row: ' + sheet.getLastRow());
  Logger.log('Last col: ' + sheet.getLastColumn());
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log('Headers: ' + headers.join(', '));
}
