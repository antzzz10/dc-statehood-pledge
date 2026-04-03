#!/usr/bin/env node

/**
 * Update candidates.json from Google Sheets CSV export
 *
 * Usage:
 *   npm run update-candidates path/to/responses.csv
 *
 * This script:
 * 1. Reads CSV export from Google Sheets
 * 2. Filters for "Approved" responses
 * 3. Updates candidates.json automatically
 * 4. Shows you what changed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateId } from './generate-candidate-ids.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nickname aliases: maps form submission names → canonical BASE_CANDIDATES names
// Add entries here when candidates submit responses using a different name variant
const NAME_ALIASES = {
  'gregory jackson': 'greg jackson',
  'david t gatling': 'david gatling',
};

// Base candidate list (same as Apps Script)
const BASE_CANDIDATES = [
  { name: "Gordon Chaffin", party: "Democratic", office: "Delegate to the House of Representatives", didNotQualify: true },
  { name: "Trent Holbrook", party: "Democratic", office: "Delegate to the House of Representatives" },
  { name: "Robert L. Matthews", party: "Democratic", office: "Delegate to the House of Representatives" },
  { name: "Brooke Pinto", party: "Democratic", office: "Delegate to the House of Representatives" },
  { name: "Sandi Stevens", party: "Democratic", office: "Delegate to the House of Representatives", didNotQualify: true },
  { name: "Robert White", party: "Democratic", office: "Delegate to the House of Representatives" },
  { name: "Kelly Mikel Williams", party: "Democratic", office: "Delegate to the House of Representatives" },
  { name: "Kinney Zalesne", party: "Democratic", office: "Delegate to the House of Representatives" },
  { name: "Deirdre Brown", party: "Democratic", office: "Delegate to the House of Representatives", didNotQualify: true },
  { name: "Vince Morris", party: "Democratic", office: "Delegate to the House of Representatives", withdrew: true },
  { name: "Mike Smith", party: "Democratic", office: "Delegate to the House of Representatives", didNotQualify: true },
  { name: "Samuel Greenfield", party: "Democratic", office: "Delegate to the House of Representatives", didNotQualify: true },
  { name: "Graciela A. DaCruz", party: "Statehood Green", office: "Delegate to the House of Representatives", didNotQualify: true },
  { name: "Nelson Rimensnyder", party: "Republican", office: "Delegate to the House of Representatives", didNotQualify: true },
  { name: "Denise Rosado", party: "Republican", office: "Delegate to the House of Representatives", declined: true },
  { name: "Kymone Freeman", party: "Statehood Green", office: "Delegate to the House of Representatives", undeliverable: true },
  { name: "Greg Maye", party: "Democratic", office: "Delegate to the House of Representatives", didNotQualify: true },
  { name: "Greg Jaczko", party: "Democratic", office: "Delegate to the House of Representatives" },
  { name: "Yaida Ford", party: "Democratic", office: "Mayor", didNotQualify: true },
  { name: "Janeese Lewis George", party: "Democratic", office: "Mayor" },
  { name: "Gary Goodweather", party: "Democratic", office: "Mayor" },
  { name: "Kathy Henderson", party: "Democratic", office: "Mayor" },
  { name: "Ernest Johnson", party: "Democratic", office: "Mayor" },
  { name: "Regan Jones", party: "Democratic", office: "Mayor", didNotQualify: true },
  { name: "Stanley V Lawson Sr", party: "Democratic", office: "Mayor" },
  { name: "Terri \"Ginger\" Little", party: "Democratic", office: "Mayor", didNotQualify: true },
  { name: "Kenyan R. McDuffie", party: "Democratic", office: "Mayor" },
  { name: "Anthony Muhammad", party: "Democratic", office: "Mayor", didNotQualify: true },
  { name: "Myrtle Patricia Alexander", party: "Republican", office: "Mayor", didNotQualify: true },
  { name: "Christopher E. Rossi", party: "Republican", office: "Mayor", didNotQualify: true },
  { name: "José Font", party: "Democratic", office: "Mayor", didNotQualify: true },
  { name: "Vincent Orange", party: "Democratic", office: "Mayor" },
  { name: "Robert L. Gross", party: "Democratic", office: "Mayor", withdrew: true },
  { name: "Robert L. Gross", party: "Statehood Green", office: "Mayor" },
  { name: "Talib Karim Muhammad", party: "Democratic", office: "Mayor", didNotQualify: true },
  { name: "Hope Solomon", party: "Democratic", office: "Mayor" },
  { name: "Rini Sampath", party: "Democratic", office: "Mayor" },
  { name: "Melodie Shuler", party: "Democratic", office: "Mayor", didNotQualify: true },
  { name: "Muhsin Boe Umar", party: "Statehood Green", office: "Mayor", didNotQualify: true },
  { name: "Alexis Littlefield", party: "Republican", office: "Mayor", didNotQualify: true },
  { name: "Esa Muhammad", party: "Republican", office: "Mayor", didNotQualify: true },
  { name: "Virginia Griggs", party: "Democratic", office: "Mayor", withdrew: true },
  { name: "David Gatling", party: "Democratic", office: "Mayor", didNotQualify: true },
  { name: "Ginny Griggs", party: "Statehood Green", office: "Mayor", didNotQualify: true },
  { name: "Brian L. Schwalb", party: "Democratic", office: "Attorney General" },
  { name: "J.P. Szymkowicz", party: "Democratic", office: "Attorney General" },
  { name: "Manuel Rivera", party: "Republican", office: "Attorney General" },
  { name: "Phil Mendelson", party: "Democratic", office: "Council Chairman" },
  { name: "Jack Evans", party: "Democratic", office: "Council Chairman" },
  { name: "Calvin Gurley", party: "Democratic", office: "Council Chairman" },
  { name: "Patricia Stamper", party: "Democratic", office: "Council Chairman", didNotQualify: true },
  { name: "Abi-Ananiah Prudent", party: "Republican", office: "Council Chairman" },
  { name: "Kevin B. Chavous", party: "Democratic", office: "At-Large Council Member" },
  { name: "Dwight Davis", party: "Democratic", office: "At-Large Council Member" },
  { name: "Dyana Forester", party: "Democratic", office: "At-Large Council Member" },
  { name: "Fred Hill", party: "Democratic", office: "At-Large Council Member" },
  { name: "Joe Jackson", party: "Democratic", office: "At-Large Council Member", didNotQualify: true },
  { name: "Leniqua'dominique Jenkins", party: "Democratic", office: "At-Large Council Member" },
  { name: "Candace Tiana Nelson", party: "Democratic", office: "At-Large Council Member" },
  { name: "Oye Owolewa", party: "Democratic", office: "At-Large Council Member" },
  { name: "Lisa Raymond", party: "Democratic", office: "At-Large Council Member" },
  { name: "Patricia Stamper", party: "Democratic", office: "At-Large Council Member", withdrew: true },
  { name: "Eric Goulet", party: "Democratic", office: "At-Large Council Member", withdrew: true },
  { name: "Michael Graham", party: "Democratic", office: "At-Large Council Member", didNotQualify: true },
  { name: "Greg Jackson", party: "Democratic", office: "At-Large Council Member" },
  { name: "Darrell Green", party: "Republican", office: "At-Large Council Member", undeliverable: true },
  { name: "Darryl Moch", party: "Statehood Green", office: "At-Large Council Member" },
  { name: "Rashida Brown", party: "Democratic", office: "Ward 1 Council Member" },
  { name: "Terry Lynch", party: "Democratic", office: "Ward 1 Council Member" },
  { name: "Aparna Raj", party: "Democratic", office: "Ward 1 Council Member" },
  { name: "Jackie Reyes Yanes", party: "Democratic", office: "Ward 1 Council Member" },
  { name: "Miguel Trindade Deramo", party: "Democratic", office: "Ward 1 Council Member" },
  { name: "Jude Crannitch", party: "Statehood Green", office: "Ward 1 Council Member" },
  { name: "Jett James Jasper", party: "Republican", office: "Ward 1 Council Member" },
  { name: "Matthew Frumin", party: "Democratic", office: "Ward 3 Council Member" },
  { name: "Adam J. Prinzo", party: "Democratic", office: "Ward 3 Council Member", didNotQualify: true },
  { name: "Elizabeth \"Liz\" Nagy", party: "Democratic", office: "Ward 3 Council Member",  withdrew: true },
  { name: "Bernita Carmichael", party: "Democratic", office: "Ward 5 Council Member" },
  { name: "Bridget K. French", party: "Democratic", office: "Ward 5 Council Member" },
  { name: "Zachary Parker", party: "Democratic", office: "Ward 5 Council Member" },
  { name: "Jeffrey Kihien-Palza", party: "Republican", office: "Ward 5 Council Member" },
  { name: "Joyce Robinson Paul", party: "Statehood Green", office: "Ward 5 Council Member" },
  { name: "Charles Allen", party: "Democratic", office: "Ward 6 Council Member" },
  { name: "Michael Murphy", party: "Democratic", office: "Ward 6 Council Member", undeliverable: true },
  { name: "Gloria Ann Nauden", party: "Democratic", office: "Ward 6 Council Member" },
  { name: "Jorge Rice", party: "Republican", office: "Ward 6 Council Member" },
  { name: "Marquell Merlin Washington", party: "Democratic", office: "Ward 6 Council Member", didNotQualify: true },
  { name: "Markus Batchelor", party: "Democratic", office: "United States Senator" },
  { name: "Robert Simmons", party: "Republican", office: "United States Senator", didNotQualify: true },
  { name: "Brandon L. Winfield-Dean", party: "Democratic", office: "United States Senator", undeliverable: true, didNotQualify: true },
  { name: "Milton Hardy", party: "Republican", office: "United States Representative", didNotQualify: true },
  { name: "Brian Ready", party: "Democratic", office: "United States Representative", didNotQualify: true },
  { name: "Paul Strauss", party: "Democratic", office: "United States Senator" },
  { name: "Franklin Garcia", party: "Democratic", office: "United States Representative" },
  { name: "Ciprian Ivanof", party: "Republican", office: "United States Representative", didNotQualify: true },
  // Special Election - At-Large Council Member (same date as primary)
  { name: "Edward Daniels", party: "Independent", office: "At-Large Council Member (Special Election)", didNotQualify: true },
  { name: "Khalil Lee", party: "Independent", office: "At-Large Council Member (Special Election)" },
  { name: "Juan McCullum", party: "Independent", office: "At-Large Council Member (Special Election)", didNotQualify: true },
  { name: "Jacque Patterson", party: "Independent", office: "At-Large Council Member (Special Election)" },
  { name: "Ryan Prince", party: "Independent", office: "At-Large Council Member (Special Election)", didNotQualify: true },
  { name: "Elizabeth \"Liz\" Reddick", party: "Independent", office: "At-Large Council Member (Special Election)", didNotQualify: true },
  { name: "Addison Sarter", party: "Independent", office: "At-Large Council Member (Special Election)", didNotQualify: true },
  { name: "Elissa Silverman", party: "Independent", office: "At-Large Council Member (Special Election)" },
  { name: "Doug Sloan", party: "Independent", office: "At-Large Council Member (Special Election)" },
  { name: "Nina Taylor", party: "Independent", office: "At-Large Council Member (Special Election)", didNotQualify: true },
  { name: "De'Andre Anderson", party: "Independent", office: "At-Large Council Member (Special Election)", didNotQualify: true },
  { name: "Senay Emmanuel", party: "Independent", office: "At-Large Council Member (Special Election)", didNotQualify: true },
  { name: "Darryl Moch", party: "Statehood Green", office: "At-Large Council Member (Special Election)", didNotQualify: true },
  { name: "Doni Crawford", party: "Independent", office: "At-Large Council Member (Special Election)" },
  { name: "Cynthia Phillips", party: "Independent", office: "At-Large Council Member (Special Election)", didNotQualify: true },
  { name: "Andrew Smith", party: "Independent", office: "At-Large Council Member (Special Election)", didNotQualify: true },
];

// Sort BASE_CANDIDATES: within each office group, Democratic first then other parties
// alphabetically, then by last name within each party
const officeOrder = [...new Set(BASE_CANDIDATES.map(c => c.office))];

function getLastName(name) {
  const cleaned = name.replace(/"[^"]*"\s*/g, '').replace(/\s+(Sr|Jr|III|II|IV)$/i, '');
  const parts = cleaned.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

BASE_CANDIDATES.sort((a, b) => {
  const officeDiff = officeOrder.indexOf(a.office) - officeOrder.indexOf(b.office);
  if (officeDiff !== 0) return officeDiff;
  const aDemo = a.party === 'Democratic' ? 0 : 1;
  const bDemo = b.party === 'Democratic' ? 0 : 1;
  if (aDemo !== bDemo) return aDemo - bDemo;
  if (a.party !== b.party) return a.party.localeCompare(b.party);
  return getLastName(a.name).localeCompare(getLastName(b.name));
});

function parseCSV(csvText) {
  // Properly parse CSV with quoted fields that may contain newlines and commas
  const records = [];
  let currentRecord = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++;
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true;
      } else if (char === ',') {
        // End of field
        currentRecord.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        // End of record
        currentRecord.push(currentField.trim());
        if (currentRecord.some(f => f)) {
          records.push(currentRecord);
        }
        currentRecord = [];
        currentField = '';
        if (char === '\r') i++;
      } else if (char !== '\r') {
        currentField += char;
      }
    }
  }

  // Don't forget the last field/record
  if (currentField || currentRecord.length > 0) {
    currentRecord.push(currentField.trim());
    if (currentRecord.some(f => f)) {
      records.push(currentRecord);
    }
  }

  if (records.length === 0) return [];

  // First record is headers
  const headers = records[0];
  const rows = [];

  for (let i = 1; i < records.length; i++) {
    const row = {};
    records[i].forEach((value, index) => {
      if (headers[index]) {
        row[headers[index]] = value;
      }
    });
    rows.push(row);
  }

  return rows;
}

function parseStatehoodAnswer(answer) {
  if (!answer) return null;

  const text = answer.toLowerCase().trim();

  if (text.startsWith('yes')) return 'Yes';
  if (text.startsWith('no')) return 'No';
  if (text.includes('maybe') || text.includes('depends') || text.includes('conditional')) {
    return 'Conditional';
  }

  return answer.trim();
}

// Normalize office names from form responses to match BASE_CANDIDATES
// These map Google Form "Position running for?" values to BASE_CANDIDATES office values
const OFFICE_ALIASES = {
  // Google Form exact values (from dropdown options)
  'dc delegate': 'Delegate to the House of Representatives',
  'dc democratic party': 'DC Democratic Party',  // handled separately — matches party-candidates.json
  'at-large council member (special election)': 'At-Large Council Member (Special Election)',
  // New form options — ward-specific entries (added Feb 2026)
  'ward 1 council member': 'Ward 1 Council Member',
  'ward 3 council member': 'Ward 3 Council Member',
  'ward 5 council member': 'Ward 5 Council Member',
  'ward 6 council member': 'Ward 6 Council Member',
  // Legacy form option — fallback matching by name only
  'ward council member (specify ward in comments)': 'Ward Council Member',
  'ward council member': 'Ward Council Member',
  'shadow u.s. senator': 'United States Senator',
  'shadow u.s. representative': 'United States Representative',
  // Short aliases
  'delegate': 'Delegate to the House of Representatives',
  'delegate to the house': 'Delegate to the House of Representatives',
  'shadow senator': 'United States Senator',
  'shadow representative': 'United States Representative',
  'us senator': 'United States Senator',
  'us representative': 'United States Representative',
  'council chairman': 'Council Chairman',
  'chairman': 'Council Chairman',
  'attorney general': 'Attorney General',
  'ag': 'Attorney General',
};

function normalizeOffice(office) {
  if (!office) return '';
  const trimmed = office.trim();
  const lower = trimmed.toLowerCase();
  return OFFICE_ALIASES[lower] || trimmed;
}

// Find a response matching a candidate, with fallback strategies
function findResponse(responses, candidateName, candidateOffice) {
  const nameLower = candidateName.toLowerCase();
  const officeLower = candidateOffice.toLowerCase();

  // Build list of name variants to match against (canonical + any aliases that map to it)
  const nameVariants = [nameLower];
  for (const [alias, canonical] of Object.entries(NAME_ALIASES)) {
    if (canonical === nameLower) nameVariants.push(alias);
  }

  // 1. Exact match on name (or alias) + office
  const exact = responses.find(r =>
    nameVariants.includes(r.name?.toLowerCase()) &&
    r.office?.toLowerCase() === officeLower
  );
  if (exact) return exact;

  // 2. "Ward Council Member" fallback — form doesn't include ward number,
  //    so match by name if the candidate is a ward council member
  if (candidateOffice.match(/^Ward \d+ Council Member$/)) {
    const wardFallback = responses.find(r =>
      nameVariants.includes(r.name?.toLowerCase()) &&
      r.office === 'Ward Council Member'
    );
    if (wardFallback) return wardFallback;
  }

  return null;
}

function updateCandidates(csvText) {
  console.log('📊 Reading CSV...');
  const rows = parseCSV(csvText);

  console.log(`   Found ${rows.length} total responses`);

  // Filter for approved responses (trim to handle trailing characters from CSV export)
  const approved = rows.filter(row => row['Status']?.trim() === 'Approved');
  console.log(`   ${approved.length} approved responses`);

  if (approved.length === 0) {
    console.log('\n⚠️  No approved responses found. Make sure you have a "Status" column with "Approved" values.');
    process.exit(0);
  }

  // Helper: find a row value by header prefix (avoids issues with newlines in headers)
  const getField = (row, prefix) => {
    const key = Object.keys(row).find(k => k.startsWith(prefix));
    return key ? row[key]?.trim() || '' : '';
  };

  // Parse timestamp to ISO date string
  const parseTimestamp = (ts) => {
    if (!ts) return null;
    // Format: "1/27/2026 22:44:51"
    const match = ts.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match) return null;
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Parse responses
  const responses = approved.map(row => ({
    name: row['Name of candidate']?.trim(),
    office: normalizeOffice(row['Position running for?']),
    respondedDate: parseTimestamp(row['Timestamp']),
    statehoodSupport: parseStatehoodAnswer(getField(row, '1. Do you support DC Statehood')),
    responses: {
      statehoodSupport: getField(row, '1. Do you support DC Statehood'),
      topThreeActions: getField(row, '2. What are the top three actions'),
      intendedActions: getField(row, '3. What specific actions'),
      congressResponse: getField(row, '4. If elected, how will you respond'),
      partners: getField(row, '5. Name the top 2-3 partners'),
      voterInvolvement: getField(row, '6. How do you intend to involve'),
      additionalComments: getField(row, '7. Is there anything else')
    }
  }));

  // Split responses into elected office vs party committee
  const electedResponses = responses.filter(r => r.office !== 'DC Democratic Party');
  const partyResponses = responses.filter(r => r.office === 'DC Democratic Party');

  // === Update elected office candidates ===
  console.log('\n🔄 Updating elected office candidates...');
  const withdrew = BASE_CANDIDATES.filter(c => c.withdrew);
  const didNotQualify = BASE_CANDIDATES.filter(c => c.didNotQualify);
  if (withdrew.length) console.log(`   ↩ ${withdrew.length} candidates excluded (withdrew)`);
  if (didNotQualify.length) console.log(`   ✗ ${didNotQualify.length} candidates excluded (did not qualify for ballot)`);
  const activeCandidates = BASE_CANDIDATES.filter(c => !c.withdrew && !c.didNotQualify);
  const updated = activeCandidates.map(candidate => {
    const response = findResponse(electedResponses, candidate.name, candidate.office);

    if (response) {
      console.log(`   ✓ ${candidate.name} (${candidate.office}) — responded ${response.respondedDate}`);
      return {
        name: candidate.name,
        party: candidate.party,
        office: candidate.office,
        id: generateId(candidate.name, candidate.office),
        responded: true,
        respondedDate: response.respondedDate,
        declined: false,
        supportsStatehood: response.statehoodSupport,
        responses: response.responses
      };
    }

    const result = {
      name: candidate.name,
      party: candidate.party,
      office: candidate.office,
      id: generateId(candidate.name, candidate.office),
      responded: false,
      supportsStatehood: null
    };

    if (candidate.declined) {
      result.declined = true;
      console.log(`   ✗ ${candidate.name} (${candidate.office}) - declined`);
    }

    if (candidate.undeliverable) {
      result.undeliverable = true;
      console.log(`   ⚠ ${candidate.name} (${candidate.office}) - no valid contact`);
    }

    return result;
  });

  // Check for unmatched elected responses (account for aliases)
  const isNameMatch = (responseName, candidateName) => {
    const rLower = responseName?.toLowerCase();
    const cLower = candidateName.toLowerCase();
    if (rLower === cLower) return true;
    return NAME_ALIASES[rLower] === cLower;
  };
  const withdrawnCandidates = BASE_CANDIDATES.filter(c => c.withdrew);
  const unmatchedElected = electedResponses.filter(r =>
    !updated.some(c => c.responded && isNameMatch(r.name, c.name))
  );
  const unmatchedWithdrawn = unmatchedElected.filter(r =>
    withdrawnCandidates.some(c => isNameMatch(r.name, c.name))
  );
  const unmatchedUnknown = unmatchedElected.filter(r =>
    !withdrawnCandidates.some(c => isNameMatch(r.name, c.name))
  );
  if (unmatchedWithdrawn.length > 0) {
    console.log('\n   ↩ Skipping responses from withdrawn candidates:');
    unmatchedWithdrawn.forEach(r => {
      console.log(`     "${r.name}" — "${r.office}"`);
    });
  }
  if (unmatchedUnknown.length > 0) {
    console.log('\n⚠️  Unmatched elected office responses:');
    unmatchedUnknown.forEach(r => {
      console.log(`   "${r.name}" — "${r.office}"`);
    });
  }

  // Write elected office candidates
  const electedOutputPath = path.join(__dirname, '../src/data/candidates.json');
  fs.writeFileSync(electedOutputPath, JSON.stringify({ candidates: updated }, null, 2), 'utf-8');

  const electedMatched = updated.filter(c => c.responded).length;
  console.log(`\n✅ Updated ${electedOutputPath}`);
  console.log(`   ${electedMatched} responded, ${activeCandidates.length - electedMatched} pending`);

  // === Update party committee candidates ===
  if (partyResponses.length > 0) {
    console.log('\n🔄 Updating party committee candidates...');

    const partyDataPath = path.join(__dirname, '../src/data/party-candidates.json');
    const partyData = JSON.parse(fs.readFileSync(partyDataPath, 'utf-8'));

    let partyMatched = 0;
    const unmatchedParty = [];

    for (const response of partyResponses) {
      // Match by name only (office varies: "Ward 5 Committeeman", etc.)
      const candidate = partyData.candidates.find(c =>
        c.name.toLowerCase() === response.name?.toLowerCase()
      );

      if (candidate) {
        candidate.responded = true;
        candidate.respondedDate = response.respondedDate;
        candidate.supportsStatehood = response.statehoodSupport;
        candidate.responses = response.responses;
        partyMatched++;
        console.log(`   ✓ ${candidate.name} (${candidate.office}) — responded ${response.respondedDate}`);
      } else {
        unmatchedParty.push(response);
      }
    }

    if (unmatchedParty.length > 0) {
      console.log('\n⚠️  Unmatched party committee responses:');
      unmatchedParty.forEach(r => {
        console.log(`   "${r.name}" — "${r.office}"`);
      });
    }

    fs.writeFileSync(partyDataPath, JSON.stringify(partyData, null, 2) + '\n', 'utf-8');
    console.log(`\n✅ Updated ${partyDataPath}`);
    console.log(`   ${partyMatched} responded`);
  }

  // === Update Ballot Status in tracking CSV ===
  const trackingPath = path.join(__dirname, '../candidate-outreach-tracking.csv');
  if (fs.existsSync(trackingPath)) {
    // Build status map from full BASE_CANDIDATES list (includes withdrew/didNotQualify)
    const statusMap = new Map();
    for (const c of BASE_CANDIDATES) {
      const key = `${c.name.toLowerCase()}|${c.office.toLowerCase()}`;
      statusMap.set(key, c.withdrew ? 'Withdrew' : c.didNotQualify ? 'Did Not Qualify' : 'Active');
    }

    const trackingText = fs.readFileSync(trackingPath, 'utf-8');
    const trackingRows = parseCSV(trackingText);

    // Extract headers from first raw line (none have special chars so simple split is safe)
    const trackingHeaders = trackingText.split('\n')[0].replace(/\r$/, '').split(',').map(h => h.replace(/^"|"$/g, ''));
    if (!trackingHeaders.includes('Ballot Status')) trackingHeaders.push('Ballot Status');

    function escapeCSVField(value) {
      if (value == null) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }

    let ballotUpdated = 0;
    const outputLines = [trackingHeaders.map(escapeCSVField).join(',')];
    for (const row of trackingRows) {
      const key = `${(row['Name'] || '').toLowerCase()}|${(row['Office'] || '').toLowerCase()}`;
      const status = statusMap.get(key);
      if (status) { row['Ballot Status'] = status; ballotUpdated++; }
      outputLines.push(trackingHeaders.map(h => escapeCSVField(row[h] || '')).join(','));
    }
    fs.writeFileSync(trackingPath, outputLines.join('\n') + '\n', 'utf-8');
    console.log(`\n📋 Tracking CSV: ${ballotUpdated} candidates updated with Ballot Status`);
  }

  console.log('\n📝 Next steps:');
  console.log('   git diff src/data/  # Review changes');
  console.log('   npm run build       # Verify no errors');
  console.log('   npm run deploy      # Push to candidates.representdc.org');
}

// Google Sheets CSV export URL (uses gviz endpoint which works with "anyone with link" sharing)
const SHEET_ID = '1uPXHjcu8u2RHaZ1VgOIcEuvwvSzXy_N4zGH0pbkakNw';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

async function fetchSheet(url) {
  const https = await import('https');
  return new Promise((resolve, reject) => {
    https.default.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchSheet(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} fetching Google Sheet`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Main
const csvPath = process.argv[2];

if (csvPath) {
  // Local file mode
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: File not found: ${csvPath}`);
    process.exit(1);
  }
  updateCandidates(fs.readFileSync(csvPath, 'utf-8'));
} else {
  // Fetch from Google Sheets directly
  console.log('Fetching responses from Google Sheets...');
  try {
    const csvText = await fetchSheet(SHEET_CSV_URL);
    updateCandidates(csvText);
  } catch (err) {
    console.error(`Error fetching Google Sheet: ${err.message}`);
    console.error('\nFallback: download CSV manually and run:');
    console.error('  npm run update-candidates ~/Downloads/file.csv');
    process.exit(1);
  }
}
