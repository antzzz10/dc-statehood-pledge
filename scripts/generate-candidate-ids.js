#!/usr/bin/env node

/**
 * Generate stable `id` fields for all candidates in candidates.json
 * and party-candidates.json.
 *
 * ID format: {name-slug}-{office-slug}
 * When two candidates share the same name+office (e.g. Robert L. Gross ran
 * as Democrat then refiled as Statehood Green), a party suffix is appended
 * to disambiguate.
 *
 * Run once, then commit the updated JSON files.
 * The update-candidates.js script also calls generateId() so new candidates
 * get IDs automatically on future runs.
 *
 * Usage: node scripts/generate-candidate-ids.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function generateId(name, office) {
  const nameSlug = name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents (é→e)
    .replace(/["\u201c\u201d]/g, '')                  // strip quotes
    .replace(/\s*\([^)]*\)\s*/g, ' ')                 // strip (parenthetical)
    .replace(/[^a-z0-9\s]/g, '')                      // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, '-');

  const officeSlug = (() => {
    if (/delegate to the house/i.test(office)) return 'delegate';
    if (/^mayor$/i.test(office)) return 'mayor';
    if (/council chairman/i.test(office)) return 'council-chair';
    if (/at-large council member \(special/i.test(office)) return 'at-large-special';
    if (/at-large council member/i.test(office)) return 'at-large';
    const ward = office.match(/ward (\d+) council member/i);
    if (ward) return `ward-${ward[1]}`;
    if (/attorney general/i.test(office)) return 'attorney-general';
    if (/united states senator/i.test(office)) return 'us-senator';
    if (/united states representative/i.test(office)) return 'us-representative';
    if (/national committeeman/i.test(office)) return 'natl-committeeman';
    if (/national committeewoman/i.test(office)) return 'natl-committeewoman';
    if (/at-large committeeman/i.test(office)) return 'at-large-committeeman';
    if (/at-large committeewoman/i.test(office)) return 'at-large-committeewoman';
    const wardCm = office.match(/ward (\d+) committeeman/i);
    if (wardCm) return `ward-${wardCm[1]}-committeeman`;
    const wardCw = office.match(/ward (\d+) committeewoman/i);
    if (wardCw) return `ward-${wardCw[1]}-committeewoman`;
    return office.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  })();

  return `${nameSlug}-${officeSlug}`;
}

function partyAbbrev(party) {
  if (!party) return 'ind';
  const p = party.toLowerCase();
  if (p === 'democratic') return 'd';
  if (p === 'republican') return 'r';
  if (p.includes('statehood')) return 'sg';
  if (p === 'independent') return 'ind';
  return p.replace(/[^a-z]/g, '').slice(0, 3);
}

function assignIds(candidates) {
  // First pass: generate base IDs
  const withIds = candidates.map(c => ({
    ...c,
    _baseId: generateId(c.name, c.office),
  }));

  // Find collisions
  const counts = {};
  for (const c of withIds) {
    counts[c._baseId] = (counts[c._baseId] || 0) + 1;
  }

  // Second pass: disambiguate collisions with party suffix
  for (const c of withIds) {
    if (counts[c._baseId] > 1) {
      c.id = `${c._baseId}-${partyAbbrev(c.party || c.slate)}`;
    } else {
      c.id = c._baseId;
    }
    delete c._baseId;
  }

  return withIds;
}

function processFile(filePath, label) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  data.candidates = assignIds(data.candidates);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`${label}: ${data.candidates.length} candidates, IDs written.`);
}

const candidatesPath = path.join(__dirname, '..', 'src', 'data', 'candidates.json');
const partyPath = path.join(__dirname, '..', 'src', 'data', 'party-candidates.json');

processFile(candidatesPath, 'candidates.json');
processFile(partyPath, 'party-candidates.json');

console.log('Done. Commit both JSON files.');
