#!/usr/bin/env node

/**
 * Sync candidate data from DC Board of Elections PDFs
 *
 * Scrapes https://dcboe.org/elections/2026-elections to find current
 * candidate list PDFs, downloads and parses them, then compares against
 * the existing candidate-outreach-tracking.csv.
 *
 * Usage:
 *   node scripts/sync-boe.js          # Show diff report only
 *   node scripts/sync-boe.js --apply  # Apply changes to CSV
 *
 * The script preserves all tracking columns (Date Contacted, Follow-up Date,
 * Response Status, Notes, etc.) when updating.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOE_URL = 'https://dcboe.org/elections/2026-elections';
const CSV_PATH = path.join(__dirname, '..', 'candidate-outreach-tracking.csv');
const APPLY = process.argv.includes('--apply');

// ============================================================
// HTTP helpers
// ============================================================

function fetch(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirect = new URL(res.headers.location, url).href;
        return fetch(redirect).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ============================================================
// Step 1: Scrape BOE page to find current PDF links
// ============================================================

async function findPdfLinks() {
  console.log('Fetching BOE elections page...');
  const html = (await fetch(BOE_URL)).toString('utf-8');

  // Find links containing candidate list PDFs
  // Pattern: href="/getmedia/GUID/FILENAME.pdf"
  const linkRegex = /href="(\/getmedia\/[^"]+\.pdf)"/gi;
  const links = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1]);
  }

  // Find the primary candidates PDF and special election candidates PDF
  const primaryPdf = links.find(l =>
    /primary.*candidates/i.test(l) && !/calendar/i.test(l) && !/circulat/i.test(l)
  );
  const specialPdf = links.find(l =>
    /special.*election.*candidates/i.test(l) && !/calendar/i.test(l) && !/circulat/i.test(l)
  );

  if (!primaryPdf) {
    throw new Error('Could not find Primary Candidates PDF link on BOE page');
  }
  if (!specialPdf) {
    throw new Error('Could not find Special Election Candidates PDF link on BOE page');
  }

  return {
    primaryUrl: `https://dcboe.org${primaryPdf}`,
    specialUrl: `https://dcboe.org${specialPdf}`,
  };
}

// ============================================================
// Step 2: Download and parse PDFs
// ============================================================

async function downloadAndParse(url, label) {
  console.log(`Downloading ${label}...`);
  const buffer = await fetch(url);
  console.log(`  ${(buffer.length / 1024).toFixed(0)} KB downloaded`);

  // Dynamic import for pdf-parse (CJS module)
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  const text = result.pages.map(pg => pg.text).join('\n');
  return text;
}

// ============================================================
// Step 3: Parse candidate data from PDF text
// ============================================================

/**
 * Parse the primary election PDF text into candidate objects.
 *
 * Strategy:
 * 1. Split raw text into party sections using "Candidate's Name" header rows
 *    (these appear at the start of each party: Democratic, Republican, Statehood Green)
 * 2. Determine party from the footer within each section
 * 3. Within each section, handle multiline entries during parsing
 */
function parsePrimaryCandidates(text) {
  const candidates = [];

  // Split into sections by "Candidate's Name" header rows (on raw text).
  const rawLines = text.split('\n');
  const sections = [];
  let currentLines = [];

  for (const line of rawLines) {
    if (line.trim().startsWith("Candidate's Name")) {
      if (currentLines.length > 0) {
        sections.push(currentLines);
      }
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines.length > 0) {
    sections.push(currentLines);
  }

  // Determine party for each section from its footer line
  const partyFooterRegex = /District of Columbia Board of Elections\s*-\s*(.+?)\s*Party Candidates/;

  for (const sectionLines of sections) {
    let party = 'Democratic'; // default for first section
    for (const line of sectionLines) {
      const footerMatch = line.match(partyFooterRegex);
      if (footerMatch) {
        party = footerMatch[1].trim();
        break;
      }
    }
    candidates.push(...parsePrimarySection(sectionLines, party));
  }

  return candidates;
}

function parsePrimarySection(rawLines, party) {
  const candidates = [];
  let currentOffice = '';
  // Buffer for multiline candidate entries: a name line (no tabs) followed
  // by a data line (with tabs, possibly starting with "(Currently,...")
  let pendingName = '';

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    // Skip page timestamps
    if (/^\d+\/\d+\/\d{4}\s+\d+:\d+\s+(AM|PM)$/i.test(line)) continue;

    // Skip footer lines
    if (line.includes('Board of Elections')) continue;

    // Skip "Write-in, if any"
    if (/^Write-in/i.test(line)) {
      pendingName = '';
      continue;
    }

    // Detect office headers
    if (!line.includes('\t') && isOfficeHeader(line)) {
      currentOffice = normalizeOffice(line);
      pendingName = '';
      continue;
    }

    // Line with tabs = candidate data
    if (line.includes('\t') && currentOffice) {
      let fullLine = line;
      // If there was a pending name (previous line with no tabs), prepend it
      if (pendingName) {
        fullLine = pendingName + ' ' + line;
        pendingName = '';
      }
      const candidate = parseCandidateLine(fullLine, party, currentOffice);
      if (candidate) {
        candidates.push(candidate);
      }
    } else if (!line.includes('\t') && currentOffice) {
      // No tabs — this is likely a candidate name that continues on the next line
      // (e.g., "Anthony ADC Muhammad" followed by data on the next line)
      // Or a "(Currently..." continuation
      if (line.startsWith('(Currently,')) {
        // Append to pending name (the data line will follow)
        pendingName += ' ' + line;
      } else {
        pendingName = line;
      }
    }
  }

  return candidates;
}

/**
 * Parse the special election PDF text into candidate objects.
 * This PDF has a Party column since candidates are from different parties.
 * Handles multiline entries (e.g., Darryl Moch with Statehood Green split).
 */
function parseSpecialElectionCandidates(text) {
  const candidates = [];
  const rawLines = text.split('\n');
  let pendingName = '';

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    // Skip headers, footers, timestamps
    if (line.startsWith("Candidate's Name")) continue;
    if (/^\d+\/\d+\/\d{4}\s+\d+:\d+\s+(AM|PM)$/i.test(line)) continue;
    if (line.includes('Board of Elections')) continue;

    if (line.includes('\t')) {
      let fullLine = line;
      if (pendingName) {
        fullLine = pendingName + ' ' + line;
        pendingName = '';
      }
      const candidate = parseSpecialElectionLine(fullLine);
      if (candidate) {
        candidates.push(candidate);
      }
    } else {
      // No tabs — name continuation or "(Currently..." note
      if (line.startsWith('(Currently,')) {
        pendingName += ' ' + line;
      } else {
        pendingName = pendingName ? pendingName + ' ' + line : line;
      }
    }
  }

  return candidates;
}

function isOfficeHeader(line) {
  const officePatterns = [
    /^Delegate to the House/i,
    /^Mayor/i,
    /^Chairman of the Council/i,
    /^At-large Member of the Council$/i,
    /^Ward \d+ Member of the Council$/i,
    /^Attorney General/i,
    /^United States Senator$/i,
    /^United States Representative$/i,
    /^National Committeeman/i,
    /^National Committeewoman/i,
    /^At-large Committeeman/i,
    /^At-large Committeewoman/i,
    /^Ward \d+ Committeeman/i,
    /^Ward \d+ Committeewoman/i,
    /^Republican Chairperson/i,
  ];
  return officePatterns.some(p => p.test(line));
}

function normalizeOffice(raw) {
  // Map BOE office names to our tracking spreadsheet names
  const office = raw.trim();

  if (/Delegate to the House/i.test(office)) return 'Delegate to the House of Representatives';
  if (/Mayor/i.test(office)) return 'Mayor';
  if (/Chairman of the Council/i.test(office)) return 'Council Chairman';
  if (/^At-large Member of the Council$/i.test(office)) return 'At-Large Council Member';
  if (/^Ward (\d+) Member of the Council$/i.test(office)) {
    const ward = office.match(/Ward (\d+)/i)[1];
    return `Ward ${ward} Council Member`;
  }
  if (/Attorney General/i.test(office)) return 'Attorney General';
  if (/United States Senator/i.test(office)) return 'United States Senator';
  if (/United States Representative/i.test(office)) return 'United States Representative';
  if (/National Committeeman/i.test(office)) return 'National Committeeman';
  if (/National Committeewoman/i.test(office)) return 'National Committeewoman';
  if (/At-large Committeeman/i.test(office)) return 'At-Large Committeeman';
  if (/At-large Committeewoman/i.test(office)) return 'At-Large Committeewoman';
  if (/Ward (\d+) Committeeman/i.test(office)) {
    const ward = office.match(/Ward (\d+)/i)[1];
    return `Ward ${ward} Committeeman`;
  }
  if (/Ward (\d+) Committeewoman/i.test(office)) {
    const ward = office.match(/Ward (\d+)/i)[1];
    return `Ward ${ward} Committeewoman`;
  }
  if (/Republican Chairperson Ward (\d+)/i.test(office)) {
    const ward = office.match(/Ward (\d+)/i)[1];
    return `Republican Chairperson Ward ${ward}`;
  }

  return office;
}

function parseCandidateLine(line, party, office) {
  // Primary PDF format (tab-separated):
  // Name [ContactPerson/Slate] Address Zip Phone Email PickupDate DateFiled
  //
  // The tricky part: contact person and slate are optional and in the same
  // column as the address. We need to extract phone and email reliably.

  const parts = line.split('\t').map(s => s.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  let name = parts[0];

  // Check for withdrawal
  let withdrew = false;
  const withdrawMatch = name.match(/\(withdrew\s+[\d/]+\)/i);
  if (withdrawMatch) {
    withdrew = true;
    name = name.replace(/\s*\(withdrew\s+[\d/]+\)/i, '').trim();
  }

  // Clean up ballot name notes
  name = name.replace(/\n?\(Currently,.*?\)/gs, '').trim();
  // Remove trailing quotes/nicknames for cleaner matching but keep the original form
  name = name.split('\n')[0].trim();

  // Find phone (pattern: XXX-XXX-XXXX)
  const phoneRegex = /(\d{3}-\d{3}-\d{4})/;
  // Find email
  const emailRegex = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/;

  const fullLine = parts.join(' ');
  const phoneMatch = fullLine.match(phoneRegex);
  const emailMatch = fullLine.match(emailRegex);

  // Find zip code (5-digit number)
  const zipRegex = /\b(\d{5})\b/;
  const zipMatch = fullLine.match(zipRegex);

  // Detect slate from the parts (appears before the address)
  let slate = '';
  const slatePatterns = [
    'Free DC Slate',
    'Democrats United to Free DC',
    'Fight For Statehood|Free D.C.',
    'Act Now DC',
  ];
  for (const sp of slatePatterns) {
    if (fullLine.includes(sp)) {
      slate = sp;
      break;
    }
  }

  // Detect if this is a party committee position
  const isPartyCommittee = /Commit(tee)?(?:man|woman)|Chairperson/i.test(office);

  // Find date filed (last date pattern M/D/YYYY)
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4})/g;
  const dates = [...fullLine.matchAll(dateRegex)].map(m => m[1]);
  const dateFiled = dates.length > 0 ? dates[dates.length - 1] : '';

  return {
    name: cleanName(name),
    party,
    office,
    electionType: 'Primary',
    isPartyCommittee,
    slate,
    phone: phoneMatch ? phoneMatch[1] : '',
    email: emailMatch ? emailMatch[1] : '',
    dateFiled,
    withdrew,
  };
}

function parseSpecialElectionLine(line) {
  const parts = line.split('\t').map(s => s.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  let name = parts[0];
  name = name.replace(/\n?\(Currently,.*?\)/gs, '').trim();
  name = name.split('\n')[0].trim();

  const fullLine = parts.join(' ');

  // Detect party from the line (check before cleaning name since party
  // may be embedded in the name field for multiline entries)
  let party = 'Independent';
  if (/\bDemocratic\b/.test(fullLine)) party = 'Democratic';
  else if (/\bRepublican\b/.test(fullLine)) party = 'Republican';
  else if (/\bStatehood\s*Green\b/i.test(fullLine)) party = 'Statehood Green';

  // Strip party name from the name field (happens with multiline entries
  // where the party got merged into the name, e.g., "Darryl Moch Statehood Green ...")
  name = name.replace(/\s*(Independent|Democratic|Republican|Statehood\s*Green)\b.*/i, '').trim();

  const phoneMatch = fullLine.match(/(\d{3}-\d{3}-\d{4})/);
  const emailMatch = fullLine.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4})/g;
  const dates = [...fullLine.matchAll(dateRegex)].map(m => m[1]);
  const dateFiled = dates.length > 0 ? dates[dates.length - 1] : '';

  return {
    name: cleanName(name),
    party,
    office: 'At-Large Council Member (Special Election)',
    electionType: 'Special Election',
    isPartyCommittee: false,
    slate: '',
    phone: phoneMatch ? phoneMatch[1] : '',
    email: emailMatch ? emailMatch[1] : '',
    dateFiled,
    withdrew: false,
  };
}

function cleanName(name) {
  // Remove exclamation marks some candidates add (e.g., "Darryl!" → "Darryl")
  name = name.replace(/!/g, '');
  // Normalize quotes
  name = name.replace(/\u201c|\u201d/g, '"');
  // Collapse whitespace
  name = name.replace(/\s+/g, ' ').trim();
  return name;
}

// ============================================================
// Step 4: Read existing CSV
// ============================================================

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

function readExistingCSV() {
  if (!fs.existsSync(CSV_PATH)) {
    return { headers: [], rows: [] };
  }

  const text = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };

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

  return { headers, rows };
}

// ============================================================
// Step 5: Compare and generate diff
// ============================================================

/**
 * Normalize a name for fuzzy matching. Strips middle initials, suffixes,
 * nicknames, and other variations to allow matching between slightly
 * different name forms.
 */
function normalizeName(name) {
  let n = name.toLowerCase();
  // Remove quotes, parens content (nicknames, ballot notes)
  n = n.replace(/["\u201c\u201d]/g, '');
  n = n.replace(/\s*\([^)]*\)\s*/g, ' ');
  // Remove common suffixes
  n = n.replace(/\b(jr\.?|sr\.?|ii|iii|iv)\b/gi, '');
  // Remove single-letter middle initials (e.g., "N. M." or "E.")
  n = n.replace(/\b[a-z]\.\s*/g, '');
  // Remove "ADC", "VO" and similar mid-name additions
  n = n.replace(/\badc\b/g, '');
  // Remove all non-alphabetic characters (handles DaCruz vs Da Cruz, etc.)
  n = n.replace(/[^a-z]/g, '');
  return n;
}

function candidateKey(name, office) {
  return `${normalizeName(name)}|${office.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}

function compareCandidates(boeCandidates, existingRows) {
  const existingMap = new Map();
  // Also keep a secondary map by normalized name for fuzzy matching
  const existingByNormalized = new Map();
  for (const row of existingRows) {
    const key = candidateKey(row['Name'], row['Office']);
    existingMap.set(key, row);
    existingByNormalized.set(key, row);
  }

  const boeMap = new Map();
  for (const c of boeCandidates) {
    const key = candidateKey(c.name, c.office);
    boeMap.set(key, c);
  }

  const newCandidates = [];
  const withdrawals = [];
  const contactChanges = [];
  const removed = [];
  const matchedExistingKeys = new Set();

  // Find new candidates and changes
  for (const [key, boe] of boeMap) {
    const existing = existingByNormalized.get(key);

    if (boe.withdrew) {
      withdrawals.push(boe);
      // Mark as matched so it doesn't show as "removed" too
      if (existing) matchedExistingKeys.add(key);
      continue;
    }

    if (!existing) {
      newCandidates.push(boe);
    } else {
      matchedExistingKeys.add(key);
      // Check for contact info changes
      const changes = [];
      if (boe.email && boe.email !== existing['Email Address'] && existing['Email Address']) {
        changes.push({ field: 'Email', old: existing['Email Address'], new: boe.email });
      }
      if (boe.phone && boe.phone !== existing['Phone Number'] && existing['Phone Number']) {
        changes.push({ field: 'Phone', old: existing['Phone Number'], new: boe.phone });
      }
      if (changes.length > 0) {
        contactChanges.push({ candidate: boe, changes, existingRow: existing });
      }
    }
  }

  // Find candidates in CSV but not in BOE PDFs
  for (const [key, row] of existingByNormalized) {
    if (!matchedExistingKeys.has(key) && !boeMap.has(key)) {
      // Only flag elected office candidates as potentially removed
      // Party committee candidates may just not be in the PDF yet
      if (row['Party Committee'] !== 'Yes') {
        removed.push(row);
      }
    }
  }

  return { newCandidates, withdrawals, contactChanges, removed };
}

// ============================================================
// Step 5b: Compare BOE candidates against live site data
// ============================================================

function readSiteData() {
  const candidatesPath = path.join(__dirname, '..', 'src', 'data', 'candidates.json');
  const partyPath = path.join(__dirname, '..', 'src', 'data', 'party-candidates.json');

  const elected = fs.existsSync(candidatesPath)
    ? JSON.parse(fs.readFileSync(candidatesPath, 'utf-8')).candidates
    : [];
  const party = fs.existsSync(partyPath)
    ? JSON.parse(fs.readFileSync(partyPath, 'utf-8')).candidates
    : [];

  return [...elected, ...party];
}

function compareBoeToSite(boeCandidates) {
  const siteCandidates = readSiteData();

  // Build a set of normalized keys from the site data
  const siteKeys = new Set();
  for (const c of siteCandidates) {
    siteKeys.add(candidateKey(c.name, c.office));
  }

  // Build a map from site key to candidate for withdrawal check
  const siteMap = new Map();
  for (const c of siteCandidates) {
    siteMap.set(candidateKey(c.name, c.office), c);
  }

  const notOnSite = [];
  const withdrawalsOnSite = [];

  for (const boe of boeCandidates) {
    const key = candidateKey(boe.name, boe.office);

    if (boe.withdrew) {
      // Check if this withdrawn candidate is still on the site
      if (siteKeys.has(key)) {
        withdrawalsOnSite.push(boe);
      }
      continue;
    }

    if (!siteKeys.has(key) && !boe.isPartyCommittee) {
      // Only flag elected office candidates missing from the elected site
      // Party committee candidates are in a separate JSON
      notOnSite.push(boe);
    } else if (!siteKeys.has(key) && boe.isPartyCommittee) {
      notOnSite.push(boe);
    }
  }

  return {
    notOnSite,
    withdrawalsOnSite,
    totalOnSite: siteCandidates.length,
  };
}

// ============================================================
// Step 6: Print diff report
// ============================================================

function printReport(diff, boeCandidates, siteComparison) {
  const { newCandidates, withdrawals, contactChanges, removed } = diff;
  const { notOnSite, withdrawalsOnSite, totalOnSite } = siteComparison;

  console.log('\n' + '='.repeat(60));
  console.log('BOE SYNC REPORT');
  console.log('='.repeat(60));
  console.log(`Total candidates in BOE PDFs: ${boeCandidates.filter(c => !c.withdrew).length}`);
  console.log(`Total candidates on live site: ${totalOnSite}`);

  const csvHasChanges = newCandidates.length > 0 || withdrawals.length > 0 ||
      contactChanges.length > 0 || removed.length > 0;
  const siteHasChanges = notOnSite.length > 0 || withdrawalsOnSite.length > 0;

  if (!csvHasChanges && !siteHasChanges) {
    console.log('\n  No changes detected. Tracking CSV and live site are up to date.');
    return;
  }

  // --- CSV changes ---

  if (newCandidates.length > 0) {
    console.log(`\n NEW CANDIDATES — not in tracking CSV (${newCandidates.length}):`);
    for (const c of newCandidates) {
      console.log(`  + ${c.name} (${c.party}) — ${c.office}`);
      console.log(`    Phone: ${c.phone || 'N/A'}  Email: ${c.email || 'N/A'}  Filed: ${c.dateFiled}`);
      if (c.slate) console.log(`    Slate: ${c.slate}`);
    }
  }

  if (withdrawals.length > 0) {
    console.log(`\n WITHDRAWALS (${withdrawals.length}):`);
    for (const c of withdrawals) {
      console.log(`  - ${c.name} (${c.party}) — ${c.office}`);
    }
  }

  if (contactChanges.length > 0) {
    console.log(`\n CONTACT INFO CHANGES (${contactChanges.length}):`);
    for (const { candidate, changes } of contactChanges) {
      console.log(`  ~ ${candidate.name} — ${candidate.office}`);
      for (const ch of changes) {
        console.log(`    ${ch.field}: "${ch.old}" → "${ch.new}"`);
      }
    }
  }

  if (removed.length > 0) {
    console.log(`\n ⚠ IN CSV BUT NOT IN BOE PDF (${removed.length}):`);
    console.log('  (These may have been removed or the PDF parsing missed them)');
    for (const row of removed) {
      console.log(`  ? ${row['Name']} — ${row['Office']}`);
    }
  }

  // --- Site comparison ---

  if (notOnSite.length > 0) {
    console.log(`\n NOT YET ON SITE — in BOE PDF but not on candidates.representdc.org (${notOnSite.length}):`);
    console.log('  (Add these to BASE_CANDIDATES in update-candidates.js, then run npm run update-candidates)');
    for (const c of notOnSite) {
      const label = c.isPartyCommittee ? 'party-candidates.json' : 'candidates.json';
      console.log(`  + ${c.name} (${c.party}) — ${c.office}  [→ ${label}]`);
    }
  }

  if (withdrawalsOnSite.length > 0) {
    console.log(`\n WITHDRAWALS STILL ON SITE — should be removed (${withdrawalsOnSite.length}):`);
    console.log('  (Add withdrew: true in BASE_CANDIDATES, then run npm run update-candidates)');
    for (const c of withdrawalsOnSite) {
      console.log(`  ! ${c.name} (${c.party}) — ${c.office}`);
    }
  }

  if (!APPLY && csvHasChanges) {
    console.log('\n' + '-'.repeat(60));
    console.log('Run with --apply to update the CSV:');
    console.log('  npm run sync-boe -- --apply');
    console.log('-'.repeat(60));
  }
}

// ============================================================
// Step 7: Apply changes to CSV
// ============================================================

function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function applyChanges(diff, boeCandidates, existingData) {
  const { newCandidates, withdrawals, contactChanges } = diff;
  let { headers, rows } = existingData;

  // Ensure we have all needed headers
  if (headers.length === 0) {
    headers = [
      'Name', 'Party', 'Office', 'Election Type', 'Party Committee', 'Slate',
      'Email Address', 'Phone Number', 'Date Contacted', 'Follow-up Date',
      'Response Status', 'Response Date', 'Questionnaire Sent',
      'Questionnaire Returned', 'Approved', 'Notes'
    ];
  }

  // Build a lookup for existing rows
  const rowMap = new Map();
  for (const row of rows) {
    const key = candidateKey(row['Name'], row['Office']);
    rowMap.set(key, row);
  }

  // Apply contact changes (use the matched existing row directly)
  for (const { candidate, changes, existingRow } of contactChanges) {
    if (existingRow) {
      for (const ch of changes) {
        if (ch.field === 'Email') existingRow['Email Address'] = ch.new;
        if (ch.field === 'Phone') existingRow['Phone Number'] = ch.new;
      }
    }
  }

  // Mark withdrawals in Notes
  for (const w of withdrawals) {
    const key = candidateKey(w.name, w.office);
    const row = rowMap.get(key);
    if (row) {
      if (!row['Notes'].includes('Withdrew')) {
        row['Notes'] = row['Notes'] ? `${row['Notes']}; Withdrew` : 'Withdrew';
      }
    }
  }

  // Add new candidates
  for (const c of newCandidates) {
    const newRow = {};
    for (const h of headers) newRow[h] = '';

    newRow['Name'] = c.name;
    newRow['Party'] = c.party;
    newRow['Office'] = c.office;
    newRow['Election Type'] = c.electionType;
    newRow['Party Committee'] = c.isPartyCommittee ? 'Yes' : 'No';
    newRow['Slate'] = c.slate;
    newRow['Email Address'] = c.email;
    newRow['Phone Number'] = c.phone;
    newRow['Notes'] = `Added from BOE PDF (filed ${c.dateFiled})`;

    rows.push(newRow);
  }

  // Sort rows: elected office first, then party committee; within each group by office then name
  rows.sort((a, b) => {
    const aIsParty = a['Party Committee'] === 'Yes';
    const bIsParty = b['Party Committee'] === 'Yes';
    if (aIsParty !== bIsParty) return aIsParty ? 1 : -1;

    if (!aIsParty) {
      const officeCompare = a['Office'].localeCompare(b['Office']);
      if (officeCompare !== 0) return officeCompare;
      return a['Name'].localeCompare(b['Name']);
    }

    const slateCompare = (a['Slate'] || '').localeCompare(b['Slate'] || '');
    if (slateCompare !== 0) return slateCompare;
    const officeCompare = a['Office'].localeCompare(b['Office']);
    if (officeCompare !== 0) return officeCompare;
    return a['Name'].localeCompare(b['Name']);
  });

  // Write CSV
  const csvLines = [headers.map(escapeCSV).join(',')];
  for (const row of rows) {
    csvLines.push(headers.map(h => escapeCSV(row[h])).join(','));
  }

  fs.writeFileSync(CSV_PATH, csvLines.join('\n') + '\n', 'utf-8');

  console.log(`\nCSV updated: ${CSV_PATH}`);
  console.log(`  ${newCandidates.length} new candidates added`);
  console.log(`  ${withdrawals.length} withdrawals marked`);
  console.log(`  ${contactChanges.length} contact info updates`);
  console.log(`  ${rows.length} total rows`);
}

// ============================================================
// Main
// ============================================================

async function main() {
  try {
    // Step 1: Find PDF links
    const { primaryUrl, specialUrl } = await findPdfLinks();
    console.log(`  Primary PDF: ${primaryUrl.split('/').pop()}`);
    console.log(`  Special PDF: ${specialUrl.split('/').pop()}`);

    // Step 2: Download and parse PDFs
    const primaryText = await downloadAndParse(primaryUrl, 'Primary Candidates PDF');
    const specialText = await downloadAndParse(specialUrl, 'Special Election Candidates PDF');

    // Step 3: Parse candidate data
    const primaryCandidates = parsePrimaryCandidates(primaryText);
    const specialCandidates = parseSpecialElectionCandidates(specialText);
    const allBoeCandidates = [...primaryCandidates, ...specialCandidates];

    console.log(`\nParsed ${primaryCandidates.length} primary candidates`);
    console.log(`Parsed ${specialCandidates.length} special election candidates`);

    // Step 4: Read existing CSV
    const existingData = readExistingCSV();
    console.log(`Existing CSV has ${existingData.rows.length} rows`);

    // Step 5: Compare against CSV
    const diff = compareCandidates(allBoeCandidates, existingData.rows);

    // Step 5b: Compare against live site
    const siteComparison = compareBoeToSite(allBoeCandidates);
    console.log(`Live site has ${siteComparison.totalOnSite} candidates`);

    // Step 6: Print report
    printReport(diff, allBoeCandidates, siteComparison);

    // Step 7: Apply if requested
    if (APPLY && (diff.newCandidates.length > 0 || diff.withdrawals.length > 0 ||
        diff.contactChanges.length > 0)) {
      applyChanges(diff, allBoeCandidates, existingData);
    }
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    process.exit(1);
  }
}

main();
