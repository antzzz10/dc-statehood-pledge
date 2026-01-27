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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base candidate list (same as Apps Script)
const BASE_CANDIDATES = [
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

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Simple CSV parsing (handles quoted fields)
    const row = {};
    const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];

    values.forEach((value, index) => {
      const cleaned = value.trim().replace(/^"|"$/g, '');
      row[headers[index]] = cleaned;
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

function updateCandidates(csvPath) {
  console.log('📊 Reading CSV file...');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Error: File not found: ${csvPath}`);
    process.exit(1);
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvText);

  console.log(`   Found ${rows.length} total responses`);

  // Filter for approved responses
  const approved = rows.filter(row => row['Status'] === 'Approved');
  console.log(`   ${approved.length} approved responses`);

  if (approved.length === 0) {
    console.log('\n⚠️  No approved responses found. Make sure you have a "Status" column with "Approved" values.');
    process.exit(0);
  }

  // Parse responses
  const responses = approved.map(row => ({
    name: row['Name of candidate']?.trim(),
    office: row['Position running for?']?.trim(),
    statehoodSupport: parseStatehoodAnswer(row['1. Do you support DC Statehood?']),
    responses: {
      statehoodSupport: row['1. Do you support DC Statehood?']?.trim() || '',
      topThreeActions: row['2. What are the top three actions you are most proud of having already taken for Statehood over the last two years? \n\n(Note: these can be professional or personal actions.) ']?.trim() || '',
      intendedActions: row['3. What specific actions do you intend to take to promote DC Statehood and protect Home Rule, as a DC elected official?']?.trim() || '',
      congressResponse: row['4. If elected, how will you respond when Congress attempts to overturn DC laws or block DC\'s budget? Please name at least one specific action you would take.']?.trim() || '',
      partners: row['5. Name the top 2-3 partners you intend to work with in promoting Statehood, and what your relationship is with those partners today.']?.trim() || '',
      voterInvolvement: row['6. How do you intend to involve DC voters and residents in the fight for Statehood?']?.trim() || '',
      additionalComments: row['7. Is there anything else you would like to share with DC voters about your stance on DC Statehood?']?.trim() || ''
    }
  }));

  // Merge with base candidates
  console.log('\n🔄 Updating candidates...');
  const updated = BASE_CANDIDATES.map(candidate => {
    const response = responses.find(r =>
      r.name?.toLowerCase() === candidate.name.toLowerCase() &&
      r.office?.toLowerCase() === candidate.office.toLowerCase()
    );

    if (response) {
      console.log(`   ✓ ${candidate.name} (${candidate.office})`);
      return {
        name: candidate.name,
        party: candidate.party,
        office: candidate.office,
        responded: true,
        supportsStatehood: response.statehoodSupport,
        responses: response.responses
      };
    }

    return {
      name: candidate.name,
      party: candidate.party,
      office: candidate.office,
      responded: false,
      supportsStatehood: null
    };
  });

  // Write to file
  const outputPath = path.join(__dirname, '../src/data/candidates.json');
  const json = JSON.stringify({ candidates: updated }, null, 2);

  fs.writeFileSync(outputPath, json, 'utf-8');

  console.log(`\n✅ Updated ${outputPath}`);
  console.log(`   ${approved.length} candidates with responses`);
  console.log(`   ${BASE_CANDIDATES.length - approved.length} candidates without responses`);
  console.log('\n📝 Next steps:');
  console.log('   git diff src/data/candidates.json  # Review changes');
  console.log('   git add src/data/candidates.json');
  console.log('   git commit -m "Update candidate responses"');
  console.log('   npm run deploy');
}

// Main
const csvPath = process.argv[2];

if (!csvPath) {
  console.log('Usage: npm run update-candidates path/to/responses.csv');
  console.log('\nSteps:');
  console.log('1. Open your Google Sheet');
  console.log('2. File → Download → Comma Separated Values (.csv)');
  console.log('3. Run: npm run update-candidates ~/Downloads/[filename].csv');
  process.exit(1);
}

updateCandidates(csvPath);
