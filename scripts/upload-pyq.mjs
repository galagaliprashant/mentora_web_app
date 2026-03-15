import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH || join(import.meta.dirname, '..', 'serviceAccountKey.json');
const PDF_ROOT = process.env.PDF_ROOT;
const OUTPUT_JSON = join(import.meta.dirname, '..', 'src', 'data', 'pyq-data.json');
const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || 'mentoraiasmobile.firebasestorage.app';

if (!PDF_ROOT) {
  console.error('Error: PDF_ROOT environment variable is required.');
  console.error('Usage: PDF_ROOT="/path/to/papers" node scripts/upload-pyq.mjs');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: BUCKET_NAME,
});

const bucket = getStorage(app).bucket();

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const ROMAN_MAP = { 'i': 1, 'ii': 2, 'iii': 3, 'iv': 4 };

function extractPaperNumber(name) {
  // Normalize separators for matching: replace dashes/underscores with spaces
  const n = name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  let m;

  // Special: "GS11" = GS II (2015 naming), "GS111" = GS III
  m = n.match(/\bgs\s*(1{2,4})\b/i);
  if (m) return m[1].length; // gs11→2, gs111→3

  // Trailing roman numeral: "-IV", " III", "-II", "-I" at end
  m = n.match(/[-\s](iv|iii|ii|i)\s*$/i);
  if (m) return ROMAN_MAP[m[1].toLowerCase()];

  // Trailing digit at end: "Paper 3", "P4", "GS4", trailing "2"
  m = n.match(/([1-4])\s*$/);
  if (m) return parseInt(m[1]);

  // "paper" or "P" followed by digit: "Paper-3", "P2"
  m = n.match(/(?:paper|p)\s*(\d)/i);
  if (m) return parseInt(m[1]);

  // "paper" followed by roman: "Paper-IV"
  m = n.match(/paper\s*(iv|iii|ii|i)\b/i);
  if (m) return ROMAN_MAP[m[1].toLowerCase()];

  return null;
}

function normalizePaperName(filename, examType) {
  const raw = filename;
  // Normalize: strip extension, website references, parens with digits, noise suffixes
  const name = filename
    .replace(/\.pdf$/i, '')
    .replace(/www\.upscportal\.com/gi, '')
    .replace(/\(\d+\)/g, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[-\s]+[0a]\s*$/i, '')   // strip trailing "_0", "_a", " 0" noise
    .replace(/^\d{2,4}[-\s]+/, '')    // strip leading year prefix: "2024_", "19-", "23-"
    .trim();

  if (examType === 'prelims') {
    // Check for Paper II / CSAT indicators
    if (/csat/i.test(name)) {
      return { name: 'GS Paper II (CSAT)', slug: 'gs-paper-2-csat', order: 2 };
    }
    const num = extractPaperNumber(name);
    if (num === 2) {
      return { name: 'GS Paper II (CSAT)', slug: 'gs-paper-2-csat', order: 2 };
    }
    return { name: 'GS Paper I', slug: 'gs-paper-1', order: 1 };
  }

  // Mains classification
  // Essay (handle typo "EASSY")
  if (/\bess?a[sy]+y?\b|\beassy\b/i.test(name)) {
    return { name: 'Essay', slug: 'essay', order: 1 };
  }

  // English compulsory (handle "ENG_COMP", "ENGLISH-COMP", "English(Compulsory)", "ENGLISH (COM)")
  if (/\bengl?(?:ish)?\s*[-_(]?\s*com/i.test(name)) {
    return { name: 'English (Compulsory)', slug: 'english-compulsory', order: 6 };
  }

  // Hindi compulsory
  if (/hindi/i.test(name)) {
    return { name: 'Hindi (Compulsory)', slug: 'hindi-compulsory', order: 7 };
  }

  // Mechanical Engineering (handle "mac_eng1", "MECH_ENGG2", "MECHANICAL1")
  if (/mech|mac\s*eng/i.test(name)) {
    const num = extractPaperNumber(name);
    if (num === 2) {
      return { name: 'Mechanical Engg. Paper II', slug: 'mechanical-engg-paper-2', order: 9 };
    }
    return { name: 'Mechanical Engg. Paper I', slug: 'mechanical-engg-paper-1', order: 8 };
  }

  // General Studies papers - detect any GS-related naming
  if (/general|gen.*stud|gen.*st|gs/i.test(name)) {
    const num = extractPaperNumber(name);
    const gsMap = {
      1: { name: 'GS Paper I', slug: 'gs-paper-1', order: 2 },
      2: { name: 'GS Paper II', slug: 'gs-paper-2', order: 3 },
      3: { name: 'GS Paper III', slug: 'gs-paper-3', order: 4 },
      4: { name: 'GS Paper IV', slug: 'gs-paper-4', order: 5 },
    };
    if (num && gsMap[num]) return gsMap[num];
    return { name: 'GS Paper I', slug: 'gs-paper-1', order: 2 };
  }

  // Fallback
  console.warn(`  [UNCLASSIFIED] ${raw} -> using raw name`);
  const fallbackSlug = slugify(raw.replace(/\.pdf$/i, ''));
  return { name: raw.replace(/\.pdf$/i, ''), slug: fallbackSlug, order: 99 };
}

async function uploadFile(localPath, storagePath) {
  const destination = storagePath;
  const token = crypto.randomUUID();
  await bucket.upload(localPath, {
    destination,
    metadata: {
      contentType: 'application/pdf',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  // Use public Firebase Storage URL (requires storage rules to allow public read on pyq/)
  const encodedPath = encodeURIComponent(destination);
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodedPath}?alt=media&token=${token}`;
}

async function main() {
  const allYears = [];
  let totalUploaded = 0;
  let totalFailed = 0;

  const yearFolders = readdirSync(PDF_ROOT)
    .filter(f => /^\d{4}$/.test(f))
    .sort((a, b) => Number(b) - Number(a));

  for (const yearStr of yearFolders) {
    const year = Number(yearStr);
    const yearPath = join(PDF_ROOT, yearStr);
    const yearData = { year, prelims: [], mains: [] };

    const examTypes = readdirSync(yearPath)
      .filter(f => statSync(join(yearPath, f)).isDirectory());

    for (const rawExamType of examTypes) {
      const examType = rawExamType.trim().toLowerCase();
      if (examType !== 'prelims' && examType !== 'mains') {
        console.warn(`Skipping unknown exam type: ${rawExamType} in ${yearStr}`);
        continue;
      }

      const examPath = join(yearPath, rawExamType);
      const pdfFiles = readdirSync(examPath)
        .filter(f => extname(f).toLowerCase() === '.pdf');

      const seenSlugs = new Set();
      for (const pdfFile of pdfFiles) {
        const localPath = join(examPath, pdfFile);
        const normalized = normalizePaperName(pdfFile, examType);

        if (seenSlugs.has(normalized.slug)) {
          console.warn(`  [DUPLICATE] ${yearStr}/${examType}/${pdfFile} -> ${normalized.slug} (skipping)`);
          continue;
        }
        seenSlugs.add(normalized.slug);

        const storagePath = `pyq/${year}/${examType}/${normalized.slug}.pdf`;

        try {
          console.log(`Uploading: ${yearStr}/${examType}/${pdfFile} -> ${storagePath}`);
          const url = await uploadFile(localPath, storagePath);
          yearData[examType].push({
            name: normalized.name,
            url,
            order: normalized.order,
          });
          totalUploaded++;
        } catch (err) {
          console.error(`FAILED: ${storagePath}`, err.message);
          totalFailed++;
        }
      }

      // Sort papers by order within each exam type
      yearData[examType].sort((a, b) => a.order - b.order);
      // Remove the order field from output
      yearData[examType] = yearData[examType].map(({ name, url }) => ({ name, url }));
    }

    allYears.push(yearData);
  }

  // Write JSON
  writeFileSync(OUTPUT_JSON, JSON.stringify(allYears, null, 2));
  console.log(`\n=== DONE ===`);
  console.log(`Uploaded: ${totalUploaded}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Output: ${OUTPUT_JSON}`);
}

main().catch(console.error);
