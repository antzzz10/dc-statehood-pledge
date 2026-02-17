#!/usr/bin/env node

/**
 * Generate a CSV tracking spreadsheet for candidate outreach
 *
 * Usage:
 *   node scripts/generate-tracking-sheet.js
 *
 * Outputs: candidate-outreach-tracking.csv
 *
 * IMPORTANT: This script preserves existing outreach tracking data!
 * When regenerating, it reads the existing CSV and carries forward:
 *   - Date Contacted
 *   - Follow-up Date
 *   - Questionnaire Sent
 *   - Notes
 *
 * Contact info sourced from DCBOE candidate filings.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Read existing CSV to preserve outreach data ===
const outputPath = path.join(__dirname, '..', 'candidate-outreach-tracking.csv');

function parseExistingCSV(csvPath) {
  if (!fs.existsSync(csvPath)) {
    return new Map();
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return new Map();

  // Parse header to find column indices
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  const colIndex = {
    name: headers.indexOf('Name'),
    office: headers.indexOf('Office'),
    dateContacted: headers.indexOf('Date Contacted'),
    followUpDate: headers.indexOf('Follow-up Date'),
    questionnaireSent: headers.indexOf('Questionnaire Sent'),
    notes: headers.indexOf('Notes')
  };

  // Build lookup map: "name|office" -> outreach data
  const outreachData = new Map();

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const name = values[colIndex.name] || '';
    const office = values[colIndex.office] || '';
    const key = `${name.toLowerCase()}|${office.toLowerCase()}`;

    outreachData.set(key, {
      dateContacted: values[colIndex.dateContacted] || '',
      followUpDate: values[colIndex.followUpDate] || '',
      questionnaireSent: values[colIndex.questionnaireSent] || '',
      notes: values[colIndex.notes] || ''
    });
  }

  return outreachData;
}

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
          i++; // skip escaped quote
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

// Load existing outreach data before regenerating
const existingOutreach = parseExistingCSV(outputPath);

// Load both data sources
const electedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/candidates.json'), 'utf-8')
);
const partyData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/party-candidates.json'), 'utf-8')
);

// Contact info from DCBOE filings (Jan 30, 2026 PDFs)
// Key is lowercase candidate name → { phone, email }
// Note: some emails are truncated in the PDF column; marked with "..." where incomplete
const CONTACT_INFO = {
  // === Democratic Primary — Delegate to the House of Representatives ===
  'deirdre brown': { phone: '202-641-2677', email: 'hello@deirdrefordc.com' },
  'gordon chaffin': { phone: '202-743-6196', email: 'info@gordonchaffin.com' },
  'trent holbrook': { phone: '202-256-2342', email: 'trent@trentholbrook.com' },
  'robert l. matthews': { phone: '202-993-4936', email: 'lamarious@gmail.com' },
  'greg maye': { phone: '202-573-6293', email: 'gregmayefordc@gmail.com' },
  'brooke pinto': { phone: '713-819-2675', email: 'drew@brookepintoforcongress.com' },
  'sandi stevens': { phone: '202-595-4999', email: 'sandistevens2034@gmail.com' },
  'robert white': { phone: '614-364-5649', email: 'manager@joinrobertwhite.com' },
  'kelly mikel williams': { phone: '202-540-0722', email: 'info@kellymikelfordc.com' },
  'kinney zalesne': { phone: '301-678-9348', email: 'haley@kinneyfordc.com' },
  'vince morris': { phone: '202-503-6802', email: 'vsmorris@gmail.com' },
  'mike smith': { phone: '240-831-0780', email: 'mikestutorial@yahoo.com' },
  'samuel greenfield': { phone: '240-561-6399', email: 'greenfieldforcongress@yahoo.com' },

  // === Democratic Primary — Mayor ===
  'josé font': { phone: '202-300-4768', email: 'drjosefont9@gmail.com' },
  'yaida ford': { phone: '202-792-4946', email: 'yaida4DC@gmail.com' },
  'janeese lewis george': { phone: '202-455-9908', email: 'shannon@janeesefordc.com' },
  'gary goodweather': { phone: '202-909-5354', email: 'anthony@goodweatherfordc.com' },
  'kathy henderson': { phone: '202-556-5823', email: 'khenderson029@aol.com' },
  'ernest johnson': { phone: '202-255-6928', email: 'ernestjohnsonformayor@yahoo.com' },
  'regan jones': { phone: '703-597-6353', email: 'regan@reganforwashingtondc.com' },
  'stanley v lawson sr': { phone: '202-749-2630', email: 'stanleylawsonover60@gmail.com' },
  'terri "ginger" little': { phone: '202-961-2760', email: 'dcadvocacy2026@gmail.com' },
  'kenyan r. mcduffie': { phone: '202-498-5232', email: 'brandi@kenyanmcduffie.com' },
  'anthony muhammad': { phone: '202-459-8501', email: 'nextdcmayormuhammad@gmail.com' },
  'vincent orange': { phone: '202-486-3201', email: 'vo40@aol.com' },
  'robert l. gross': { phone: '202-995-6262', email: 'robert@grossformayor.com' },
  'talib karim muhammad': { phone: '202-256-0499', email: 'talib@talibfordc.com' },
  'hope solomon': { phone: '202-494-8377', email: 'info@hopefordc.com' },

  // === Democratic Primary — Council Chairman ===
  'jack evans': { phone: '202-255-3300', email: 'jackevans1@aol.com' },
  'calvin gurley': { phone: '202-722-6126', email: 'chgurley@verizon.net' },
  'phil mendelson': { phone: '202-486-3871', email: 'phmendel@aol.com' },
  'patricia stamper chairman': { phone: '202-209-6462', email: 'patricia.anduha@gmail.com' },

  // === Democratic Primary — At-Large Council Member ===
  'kevin b. chavous': { phone: '202-907-7707', email: 'kevinbchavous@gmail.com' },
  'dwight davis': { phone: '609-510-9718', email: 'dwightmd@gmail.com' },
  'dyana forester': { phone: '202-277-5553', email: 'dyanafordc@gmail.com' },
  'eric goulet': { phone: '202-641-5122', email: 'ericjgoulet@gmail.com' },
  'michael graham': { phone: '240-619-0394', email: 'grahamforcitycouncil@gmail.com' },
  'greg jackson': { phone: '202-277-1719', email: 'gregory@jacksonfordc.com' },
  'fred hill': { phone: '202-893-2399', email: 'fredhill4dc@gmail.com' },
  'joe jackson': { phone: '202-486-3861', email: 'admin@runjoejackson.com' },
  "leniqua'dominique jenkins": { phone: '202-704-7663', email: 'leniquadominique@gmail.com' },
  'candace tiana nelson': { phone: '909-272-1836', email: 'info@candacefordc.com' },
  'oye owolewa': { phone: '202-390-9480', email: 'bob@vote4oye.com' },
  'lisa raymond': { phone: '202-316-5096', email: 'lisaraymond2026@gmail.com' },
  'patricia stamper': { phone: '240-413-9484', email: 'acaciakw@gmail.com' },

  // === Democratic Primary — Ward Council Members ===
  'rashida brown': { phone: '202-903-4561', email: 'rashidaforanc@gmail.com' },
  'terry lynch': { phone: '202-934-3934', email: 'terrylynchdc@gmail.com' },
  'aparna raj': { phone: '651-260-0735', email: 'info@aparnafordc.com' },
  'jackie reyes yanes': { phone: '202-413-7832', email: 'tony@jackieforward1.com' },
  'miguel trindade deramo': { phone: '202-570-4708', email: 'david@miguelward1.com' },
  'matthew frumin': { phone: '202-420-8126', email: 'jack@fruminforward3.com' },
  'adam j. prinzo': { phone: '202-596-2696', email: 'adamfordc@gmail.com' },
  'bernita carmichael': { phone: '240-343-5282', email: 'bcarmichael2026@gmail.com' },
  'zachary parker': { phone: '240-354-0257', email: 'sskinner@zacharyparker2026.com' },
  'charles allen': { phone: '202-210-5192', email: 'charles@charlesallen2026.com' },
  'michael murphy': { phone: '202-494-3531', email: 'info@murphyforward.com' },
  'gloria ann nauden': { phone: '202-528-9005', email: 'candidate@gloriaforward6.com' },
  'marquell merlin washington': { phone: '202-750-1270', email: 'marquell.washington@udc.edu' },

  // === Democratic Primary — Attorney General ===
  'brian l. schwalb': { phone: '719-649-5203', email: 'rebekah@brianfordc.com' },
  'j.p. szymkowicz': { phone: '202-607-5500', email: 'jp@szymkowicz.com' },

  // === Democratic Primary — US Senator / Representative ===
  'markus batchelor': { phone: '202-455-1032', email: 'mbforsenate@outlook.com' },
  'brandon l. winfield-dean': { phone: '', email: 'winfielddeancampaign@outlook.com' },
  'brian ready': { phone: '312-371-4745', email: 'breadyfs@gmail.com' },
  'paul strauss': { phone: '202-223-8664', email: 'strauss@paulstrausslaw.com' },
  'franklin garcia': { phone: '202-460-3046', email: 'fgarcia@maestropc.com' },

  // === Republican Primary — Elected offices ===
  'nelson rimensnyder': { phone: '202-550-0794', email: 'lmnicker@gmail.com' },
  'denise rosado': { phone: '862-220-8093', email: 'deerosado@gmail.com' },
  'myrtle patricia alexander': { phone: '202-341-6020', email: 'drmyrtlegalexander@gmail.com' },
  'christopher e. rossi': { phone: '202-202-9252', email: 'davagoliath@gmail.com' },
  'abi-ananiah prudent': { phone: '706-332-8886', email: 'abiananiah@gmail.com' },
  'darrell green': { phone: '202-251-2525', email: 'dgreen@aol.com' },
  'jett james jasper': { phone: '808-652-5122', email: 'jett@jettjasper4dcward1.com' },
  'jeffrey kihien-palza': { phone: '240-413-8688', email: 'kihien2005@gmail.com' },
  'jorge rice': { phone: '202-429-7673', email: 'jrice00281@gmail.com' },
  'manuel rivera': { phone: '202-415-4509', email: 'manuel.lawoffice@gmail.com' },
  'robert simmons': { phone: '202-930-0653', email: 'jrobert.simmons@alter-modus.com' },
  'milton hardy': { phone: '202-540-6186', email: 'csm0963@gmail.com' },
  'ciprian ivanof': { phone: '202-480-1565', email: 'ivanof4dc@gmail.com' },

  // === Statehood Green Party ===
  'graciela a. dacruz': { phone: '202-604-3110', email: 'gracielaamador@gmail.com' },
  'kymone freeman': { phone: '202-889-9797', email: 'kymonefreeman@gmail.com' },
  'muhsin boe umar': { phone: '240-304-4190', email: 'tlewis@warriorsempowerdc.org' },

  // === Special Election — At-Large Council ===
  'edward daniels': { phone: '703-853-9228', email: 'team@edwarddanielsatlarge.com' },
  'khalil lee': { phone: '202-650-9576', email: 'khalil.alphonso.lee@gmail.com' },
  'juan mccullum': { phone: '202-718-5226', email: 'mccullum.juan@gmail.com' },
  'jacque patterson': { phone: '202-834-2553', email: 'jacque4dc@gmail.com' },
  'ryan prince': { phone: '925-785-9914', email: 'rynprnc90@gmail.com' },
  'elizabeth "liz" reddick': { phone: '202-286-9087', email: 'geminiee@aol.com' },
  'addison sarter': { phone: '202-641-1367', email: 'addisonsarter93@gmail.com' },
  'elissa silverman': { phone: '202-386-2173', email: 'elissa.silverman@gmail.com' },
  'doug sloan': { phone: '202-277-7573', email: 'info@dougsloan4dc.com' },
  'nina taylor': { phone: '202-904-8285', email: 'NLTaylor74@gmail.com' },
  "de'andre anderson": { phone: '202-290-9440', email: 'andersonfordccouncilatlarge@gmail.com' },
  'senay emmanuel': { phone: '206-618-9015', email: 'senayemmanuel@gmail.com' },
  'darryl moch': { phone: '202-400-9197', email: 'nubianphoenix1@gmail.com' },

  // === Democratic State Committee — National ===
  'philip pannell': { phone: '202-480-9347', email: 'freedcslate@gmail.com' },
  'mike panetta': { phone: '202-253-6534', email: 'mike.panetta@gmail.com' },
  'kelsye adams': { phone: '202-480-9347', email: 'freedcslate@gmail.com' },
  'david meadows': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'wanda d. lockridge': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },

  // === Democratic State Committee — At-Large Committeemen ===
  'sam bonar': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'david sampe': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'andrew defrank': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'jordan kagelmayer': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'jerome hinkle': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'maleke glee': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'thomas elias': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'alan karnofsky': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'charles e. wilson': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'dave donaldson': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'john c. green': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'james s. bubar': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'stuart w. anderson': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'manny geraldo': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },

  // === Democratic State Committee — At-Large Committeewomen ===
  'samantha davis': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'emily siegel': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'aliyah mcneely': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'sonya joseph': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'tiffany pauls': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'lia lake kuduk': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'chioma iwuoha': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'irene kang': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'monica roaché': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'dionna maria lewis': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'linda l. gray': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'lisa r. gore': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'patricia (pat) elwood': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'maria patricia corrales': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },

  // === Democratic State Committee — Ward 1 ===
  'ethan arnheim': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'alex busbee': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'stanley j mayes': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'vida rangel': { phone: '202-480-9347', email: 'freedcslate@gmail.com' },
  'michelle chappell': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'rebecca ann washington': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'e. gail anderson holness': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },

  // === Democratic State Committee — Ward 2 ===
  'keaton dicapo': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'ben dalley': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'john fanning': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'steven m. mccarty': { phone: '202-480-9347', email: 'freedcslate@gmail.com' },
  'rachel lesniak': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'trupti patel': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'meg roggensack': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'janice ferebee': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },

  // === Democratic State Committee — Ward 3 ===
  'tarek maassarani': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'zachary tashman': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'enicia porter': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'elizabeth mitchell': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },

  // === Democratic State Committee — Ward 4 ===
  'slobodan milic': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'charlie burgess': { phone: '202-480-9347', email: 'freedcslate@gmail.com' },
  'antoine m. kirby': { phone: '202-834-0600', email: 'demsfreedc@gmail.com' },
  'michael cohen': { phone: '202-834-0600', email: 'demsfreedc@gmail.com' },
  'corey welcher': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'brianna gomez mcgowan': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'neena murphy martin': { phone: '571-293-0328', email: 'neena.murphymartin@gmail.com' },
  'melissa irby': { phone: '202-834-0600', email: 'demsfreedc@gmail.com' },

  // === Democratic State Committee — Ward 5 ===
  'aaron dickerson': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'art lloyd': { phone: '202-480-9347', email: 'freedcslate@gmail.com' },
  'john lucio': { phone: '202-375-8825', email: 'johnl0770@gmail.com' },
  'shango taylor': { phone: '202-491-9245', email: 'thomashazelb@aol.com' },
  'harry thomas jr.': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'timothy thomas': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'yolanda corbett': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'shealia tyson': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'cierra craig': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'angel alston johnson': { phone: '202-834-0600', email: 'charleswilsonhu@gmail.com' },
  'ana rodriguez': { phone: '202-491-9245', email: 'thomashazelb@aol.com' },
  'hazel b. thomas': { phone: '202-491-9245', email: 'thomashazelb@aol.com' },

  // === Democratic State Committee — Ward 6 ===
  'paul spires': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'avram reisman': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'lauren kuritz': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'daraja carroll': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },

  // === Democratic State Committee — Ward 7 ===
  'corey shaw': { phone: '202-480-9347', email: 'freedcslate@gmail.com' },
  'dia king': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'victor horton': { phone: '202-834-0600', email: 'demsfreedc@gmail.com' },
  'jimmie williams': { phone: '202-834-0600', email: 'demsfreedc@gmail.com' },
  'kenyatta smith': { phone: '202-480-9347', email: 'freedcslate@gmail.com' },
  'sonya t. waterhouse': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'ashley r. ruff': { phone: '202-834-0600', email: 'demsfreedc@gmail.com' },
  'patricia stamper ward 7': { phone: '202-834-0600', email: 'demsfreedc@gmail.com' },

  // === Democratic State Committee — Ward 8 ===
  'salim adofo': { phone: '202-455-6346', email: 'info@salimadofo.com' },
  'travon hawkins': { phone: '202-386-1031', email: '' },
  'tim durant jr': { phone: '301-237-8834', email: 'timdurantjr@gmail.com' },
  'joseph johnson': { phone: '202-957-1894', email: 'josephbjohnson1@outlook.com' },
  'alejaibra sloan': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'michael i. watts, jr.': { phone: '202-834-0600', email: 'demsfreedc@gmail.com' },
  'kelly mikel williams ward 8': { phone: '202-834-0600', email: 'demsfreedc@gmail.com' },
  'charnal chaney': { phone: '561-577-2308', email: 'freedcslate@gmail.com' },
  'georgette johnson': { phone: '202-480-9347', email: 'freedcslate@gmail.com' },
  'anaiah mitchell': { phone: '301-821-5627', email: 'anaiahmitchell1@yahoo.com' },
  'sandra v. williams': { phone: '202-294-0548', email: 'svwms1210@gmail.com' },
  'robbie woodland': { phone: '202-854-9580', email: 'msrobbiewoodland@gmail.com' },
  'robin mckinney': { phone: '202-834-0600', email: 'demsfreedc@gmail.com' },
  'regina sharlita pixley': { phone: '202-834-0600', email: 'demsfreedc@gmail.com' },
};

function getContact(name) {
  return CONTACT_INFO[name.toLowerCase()] || { phone: '', email: '' };
}

function getOutreach(name, office) {
  const key = `${name.toLowerCase()}|${office.toLowerCase()}`;
  return existingOutreach.get(key) || {
    dateContacted: '',
    followUpDate: '',
    questionnaireSent: '',
    notes: ''
  };
}

function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function getElectionType(office) {
  if (office.includes('Special Election')) return 'Special Election';
  return 'Primary';
}

const headers = [
  'Name',
  'Party',
  'Office',
  'Election Type',
  'Party Committee',
  'Slate',
  'Email Address',
  'Phone Number',
  'Date Contacted',
  'Follow-up Date',
  'Response Status',
  'Response Date',
  'Questionnaire Sent',
  'Questionnaire Returned',
  'Approved',
  'Notes'
];

const rows = [];

// Add elected office candidates
for (const c of electedData.candidates) {
  const contact = getContact(c.name);
  const outreach = getOutreach(c.name, c.office);
  rows.push([
    c.name,
    c.party,
    c.office,
    getElectionType(c.office),
    'No',
    '',  // no slate for elected office
    contact.email,
    contact.phone,
    outreach.dateContacted,
    outreach.followUpDate,
    c.declined ? 'Declined' : c.undeliverable ? 'Undeliverable' : c.responded ? 'Responded' : '',
    c.respondedDate || '',
    outreach.questionnaireSent,
    c.respondedDate || '',  // questionnaire returned (if they responded)
    c.responded ? 'Yes' : '',
    outreach.notes || (c.declined ? 'Declined to respond' : c.undeliverable ? 'No valid contact info' : '')
  ]);
}

// Add party committee candidates
for (const c of partyData.candidates) {
  const contact = getContact(c.name);
  const outreach = getOutreach(c.name, c.office);
  rows.push([
    c.name,
    'Democratic',  // all party committee candidates are Democratic
    c.office,
    'Primary',
    'Yes',
    c.slate,
    contact.email,
    contact.phone,
    outreach.dateContacted,
    outreach.followUpDate,
    c.responded ? 'Responded' : '',
    '',  // response date
    outreach.questionnaireSent,
    '',  // questionnaire returned
    '',  // approved
    outreach.notes
  ]);
}

// Sort: elected office first (by office, then name), then party committee (by slate, office, name)
rows.sort((a, b) => {
  // Party Committee column is index 4
  const aIsParty = a[4] === 'Yes';
  const bIsParty = b[4] === 'Yes';
  if (aIsParty !== bIsParty) return aIsParty ? 1 : -1;

  // Within elected: sort by office, then name
  if (!aIsParty) {
    const officeCompare = a[2].localeCompare(b[2]);
    if (officeCompare !== 0) return officeCompare;
    return a[0].localeCompare(b[0]);
  }

  // Within party: sort by slate, then office, then name
  const slateCompare = a[5].localeCompare(b[5]);
  if (slateCompare !== 0) return slateCompare;
  const officeCompare = a[2].localeCompare(b[2]);
  if (officeCompare !== 0) return officeCompare;
  return a[0].localeCompare(b[0]);
});

// Build CSV
const csvLines = [headers.map(escapeCSV).join(',')];
for (const row of rows) {
  csvLines.push(row.map(escapeCSV).join(','));
}

fs.writeFileSync(outputPath, csvLines.join('\n') + '\n', 'utf-8');

const electedCount = electedData.candidates.length;
const partyCount = partyData.candidates.length;

// Count how many have contact info
let withEmail = 0, withPhone = 0, missing = 0;
for (const row of rows) {
  if (row[6]) withEmail++;  // email column
  if (row[7]) withPhone++;  // phone column
  if (!row[6] && !row[7]) missing++;
}

// Count how many had existing outreach data preserved
let preservedCount = 0;
let newCount = 0;
for (const row of rows) {
  const key = `${row[0].toLowerCase()}|${row[2].toLowerCase()}`;
  if (existingOutreach.has(key)) {
    preservedCount++;
  } else {
    newCount++;
  }
}

console.log(`Generated ${outputPath}`);
console.log(`  ${electedCount} elected office candidates`);
console.log(`  ${partyCount} party committee candidates`);
console.log(`  ${electedCount + partyCount} total rows`);
console.log(`\n  Outreach data:`);
console.log(`  ${preservedCount} candidates with preserved tracking data`);
if (newCount > 0) {
  console.log(`  ${newCount} new candidates (no prior outreach data)`);
}
console.log(`\n  Contact info coverage:`);
console.log(`  ${withEmail} with email address`);
console.log(`  ${withPhone} with phone number`);
if (missing > 0) {
  console.log(`  ${missing} with no contact info (check DCBOE filings)`);
}

// List new candidates for easy reference
if (newCount > 0) {
  console.log('\n  New candidates added:');
  for (const row of rows) {
    const key = `${row[0].toLowerCase()}|${row[2].toLowerCase()}`;
    if (!existingOutreach.has(key)) {
      console.log(`    - ${row[0]} (${row[2]})`);
    }
  }
}

console.log('\nImport into Google Sheets:');
console.log('  1. Open Google Sheets → File → Import');
console.log('  2. Upload the CSV');
console.log('  3. Choose "Replace spreadsheet" or "Insert new sheet"');
console.log('  4. Your outreach tracking data has been preserved!');
