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
 * The web app accepts POST requests with JSON candidate data and
 * appends new rows to the sheet, skipping candidates already present.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var candidates = data.candidates;
    if (!candidates || !candidates.length) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', added: 0, message: 'No candidates provided' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Use the specific sheet tab by gid or first sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets().filter(function(s) { return s.getSheetId() === 293497211; })[0] || ss.getActiveSheet();

    // Read existing names+offices to avoid duplicates
    var lastRow = sheet.getLastRow();
    var existing = new Set();
    if (lastRow > 1) {
      var names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      var offices = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
      for (var i = 0; i < names.length; i++) {
        var key = (names[i][0] + '|' + offices[i][0]).toLowerCase().trim();
        existing.add(key);
      }
    }

    // Column order must match sheet headers
    var headers = ['Name', 'Party', 'Office', 'Election Type', 'Party Committee',
                   'Slate', 'Email Address', 'Phone Number', 'Date Contacted',
                   'Follow-up Date', 'Response Status', 'Response Date',
                   'Questionnaire Sent', 'Questionnaire Returned', 'Approved', 'Notes'];

    var added = 0;
    var skipped = [];
    for (var j = 0; j < candidates.length; j++) {
      var c = candidates[j];
      var key = (c['Name'] + '|' + c['Office']).toLowerCase().trim();
      if (existing.has(key)) {
        skipped.push(c['Name']);
        continue;
      }

      var row = headers.map(function(h) { return c[h] || ''; });
      sheet.appendRow(row);
      existing.add(key);
      added++;
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      added: added,
      skipped: skipped,
      message: added + ' candidates added, ' + skipped.length + ' already existed'
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
  Logger.log('Headers: ' + sheet.getRange(1, 1, 1, 16).getValues()[0].join(', '));
}
