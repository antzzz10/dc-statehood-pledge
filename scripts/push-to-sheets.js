#!/usr/bin/env node

/**
 * Push new candidates from the tracking CSV to Google Sheets.
 *
 * Reads candidate-outreach-tracking.csv and POSTs all rows to the
 * Google Apps Script web app, which deduplicates and appends only
 * new candidates. Your existing outreach data in the sheet is never
 * touched — this only ADDS rows.
 *
 * Setup:
 *   1. Deploy the Apps Script (see scripts/google-apps-script-push.gs)
 *   2. Set the web app URL:
 *      export SHEETS_WEBAPP_URL="https://script.google.com/macros/s/YOUR_ID/exec"
 *      (or add it to .env)
 *
 * Usage:
 *   node scripts/push-to-sheets.js           # Push all candidates (deduped by sheet)
 *   node scripts/push-to-sheets.js --dry-run  # Show what would be sent without pushing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '..', 'candidate-outreach-tracking.csv');
const DRY_RUN = process.argv.includes('--dry-run');

// Load .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envLines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of envLines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

const WEBAPP_URL = process.env.SHEETS_WEBAPP_URL;
if (!WEBAPP_URL && !DRY_RUN) {
  console.error('Error: SHEETS_WEBAPP_URL not set.');
  console.error('Set it via: export SHEETS_WEBAPP_URL="https://script.google.com/macros/s/YOUR_ID/exec"');
  console.error('Or add it to .env');
  process.exit(1);
}

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

async function post(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    redirect: 'follow',
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { status: 'ok', raw: text };
  }
}

async function main() {
  const rows = readCSV();
  console.log(`Read ${rows.length} candidates from CSV`);

  // Only send the contact/identity columns — never overwrite outreach data
  const sendFields = ['Name', 'Party', 'Office', 'Election Type', 'Party Committee',
                      'Slate', 'Email Address', 'Phone Number', 'Notes'];

  const candidates = rows.map(row => {
    const slim = {};
    for (const f of sendFields) {
      slim[f] = row[f] || '';
    }
    return slim;
  });

  if (DRY_RUN) {
    console.log(`\nDry run — would send ${candidates.length} candidates to Google Sheets`);
    console.log('(The sheet deduplicates, so only new ones would be added)\n');
    const sample = candidates.slice(0, 5);
    for (const c of sample) {
      console.log(`  ${c.Name} | ${c.Party} | ${c.Office}`);
    }
    if (candidates.length > 5) {
      console.log(`  ... and ${candidates.length - 5} more`);
    }
    return;
  }

  console.log(`Pushing to Google Sheets...`);
  const result = await post(WEBAPP_URL, { candidates });

  if (result.raw) {
    // Got HTML or non-JSON response — show a snippet for debugging
    const snippet = result.raw.substring(0, 500);
    if (snippet.includes('Error') || snippet.includes('error') || snippet.includes('<!DOCTYPE')) {
      console.error(`\nApps Script returned non-JSON response:\n${snippet}...`);
      process.exit(1);
    }
  }

  if (result.status === 'error') {
    console.error(`Error from Apps Script: ${result.message}`);
    process.exit(1);
  }

  console.log(`\n${result.added || 0} candidates added, ${result.skipped?.length || 0} already existed`);
  if (result.skipped && result.skipped.length > 0 && result.skipped.length <= 10) {
    console.log(`Skipped: ${result.skipped.join(', ')}`);
  }
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
