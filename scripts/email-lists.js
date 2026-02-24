#!/usr/bin/env node

/**
 * Generate email lists for candidate outreach.
 *
 * Cross-references the site JSON (who responded) with the tracking CSV
 * (email addresses) to produce copy-paste-ready email lists.
 *
 * Usage:
 *   node scripts/email-lists.js            # Show all 3 lists
 *   node scripts/email-lists.js --copy     # Copy non-responders to clipboard (macOS)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '..', 'candidate-outreach-tracking.csv');
const ELECTED_JSON = path.join(__dirname, '..', 'src', 'data', 'candidates.json');
const PARTY_JSON = path.join(__dirname, '..', 'src', 'data', 'party-candidates.json');
const COPY = process.argv.includes('--copy');

// Parse CSV
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  values.push(current);
  return values;
}

function readCSV() {
  const text = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = text.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    rows.push(row);
  }
  return rows;
}

// Build email lookup from CSV: normalized name → email
function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

function buildEmailMap(csvRows) {
  const map = new Map();
  for (const row of csvRows) {
    const key = normalizeName(row['Name']);
    if (row['Email Address']) {
      map.set(key, { email: row['Email Address'], name: row['Name'] });
    }
  }
  return map;
}

// Read site JSON
function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')).candidates;
}

// Categorize candidates
function categorize(candidates, emailMap) {
  const responded = [];
  const notResponded = [];
  const noEmail = [];

  for (const c of candidates) {
    const key = normalizeName(c.name);
    const emailEntry = emailMap.get(key);
    const email = emailEntry?.email;

    if (c.responded) {
      if (email) responded.push({ name: c.name, email, office: c.office });
    } else if (c.declined || c.undeliverable) {
      // Skip declined and undeliverable candidates
      continue;
    } else {
      if (email) {
        notResponded.push({ name: c.name, email, office: c.office });
      } else {
        noEmail.push({ name: c.name, office: c.office });
      }
    }
  }

  return { responded, notResponded, noEmail };
}

function printList(label, entries) {
  if (entries.length === 0) {
    console.log(`\n${label}: (none)\n`);
    return '';
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`${label} (${entries.length})`);
  console.log('='.repeat(60));

  // Print details
  for (const e of entries) {
    console.log(`  ${e.name} — ${e.office}`);
  }

  // Print deduplicated comma-separated emails (copy-paste ready)
  const uniqueEmails = [...new Set(entries.map(e => e.email))];
  const emails = uniqueEmails.join(', ');
  const dupeNote = uniqueEmails.length < entries.length
    ? ` (${uniqueEmails.length} unique)`
    : '';
  console.log(`\nEmails${dupeNote}:\n${emails}\n`);

  return emails;
}

function main() {
  const csvRows = readCSV();
  const emailMap = buildEmailMap(csvRows);

  const elected = readJSON(ELECTED_JSON);
  const party = readJSON(PARTY_JSON);

  const electedResult = categorize(elected, emailMap);
  const partyResult = categorize(party, emailMap);

  // Non-responders
  const electedEmails = printList(
    'ELECTED OFFICE — NOT YET RESPONDED',
    electedResult.notResponded
  );
  const partyEmails = printList(
    'PARTY COMMITTEE — NOT YET RESPONDED',
    partyResult.notResponded
  );

  // Responders (combined)
  const allResponded = [...electedResult.responded, ...partyResult.responded];
  printList('ALL RESPONDERS (elected + party)', allResponded);

  // Missing emails
  const allNoEmail = [...electedResult.noEmail, ...partyResult.noEmail];
  if (allNoEmail.length > 0) {
    console.log(`${'='.repeat(60)}`);
    console.log(`NO EMAIL ON FILE (${allNoEmail.length})`);
    console.log('='.repeat(60));
    for (const e of allNoEmail) {
      console.log(`  ${e.name} — ${e.office}`);
    }
    console.log();
  }

  // Summary
  console.log('-'.repeat(60));
  console.log(`Summary:`);
  console.log(`  Elected non-responders with email: ${electedResult.notResponded.length}`);
  console.log(`  Party non-responders with email:   ${partyResult.notResponded.length}`);
  console.log(`  Responders with email:             ${allResponded.length}`);
  console.log(`  No email on file:                  ${allNoEmail.length}`);
  console.log('-'.repeat(60));

  // Copy to clipboard if requested
  if (COPY) {
    const allNonResponders = [electedEmails, partyEmails].filter(Boolean).join(', ');
    if (allNonResponders) {
      try {
        execSync('pbcopy', { input: allNonResponders });
        console.log('\nAll non-responder emails copied to clipboard!');
      } catch {
        console.log('\nCould not copy to clipboard (pbcopy not available)');
      }
    }
  }
}

main();
