import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH || join(import.meta.dirname, '..', 'serviceAccountKey.json');
const NCERT_ROOT = process.env.NCERT_ROOT;
const OUTPUT_JSON = join(import.meta.dirname, '..', 'src', 'data', 'ncert-data.json');
const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || 'mentoraiasmobile.firebasestorage.app';

if (!NCERT_ROOT) {
  console.error('Error: NCERT_ROOT environment variable is required.');
  console.error('Usage: NCERT_ROOT="/path/to/NCERTs" node scripts/upload-ncert.mjs');
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

/** Extract class number from filename */
function extractClass(filename) {
  const m = filename.match(/class[\s\-_]*(\d{1,2})/i);
  return m ? parseInt(m[1]) : 99;
}

/** Clean up display name from filename */
function cleanDisplayName(filename, subjectName) {
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/\s*\(\d+\)\s*/g, '')   // remove (1) suffixes
    .replace(/\s+/g, ' ')
    .trim();
}

async function uploadFile(localPath, storagePath) {
  const token = crypto.randomUUID();
  await bucket.upload(localPath, {
    destination: storagePath,
    metadata: {
      contentType: 'application/pdf',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const encodedPath = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodedPath}?alt=media&token=${token}`;
}

async function main() {
  const subjects = [];
  let totalUploaded = 0;
  let totalFailed = 0;

  const subjectFolders = readdirSync(NCERT_ROOT)
    .filter(f => statSync(join(NCERT_ROOT, f)).isDirectory())
    .sort();

  for (const folderName of subjectFolders) {
    const folderPath = join(NCERT_ROOT, folderName);

    // Extract subject name and class range from folder name
    // e.g. "Geography NCERT 6-12" -> subject: "Geography", range: "6-12"
    const match = folderName.match(/^(.+?)\s*NCERT\s*(\d+-\d+)$/i);
    const subjectName = match ? match[1].trim() : folderName;
    const classRange = match ? match[2] : '';

    const pdfFiles = readdirSync(folderPath)
      .filter(f => extname(f).toLowerCase() === '.pdf');

    const books = [];

    for (const pdfFile of pdfFiles) {
      const localPath = join(folderPath, pdfFile);
      const classNum = extractClass(pdfFile);
      const displayName = cleanDisplayName(pdfFile, subjectName);
      const slug = slugify(pdfFile.replace(/\.pdf$/i, ''));
      const storagePath = `study-material/ncerts/${slugify(subjectName)}/${slug}.pdf`;

      try {
        console.log(`Uploading: ${folderName}/${pdfFile} -> ${storagePath}`);
        const url = await uploadFile(localPath, storagePath);
        books.push({ name: displayName, url, classNum });
        totalUploaded++;
      } catch (err) {
        console.error(`FAILED: ${storagePath}`, err.message);
        totalFailed++;
      }
    }

    // Sort by class number
    books.sort((a, b) => a.classNum - b.classNum);

    subjects.push({
      subject: subjectName,
      classRange,
      books: books.map(({ name, url }) => ({ name, url })),
    });
  }

  writeFileSync(OUTPUT_JSON, JSON.stringify(subjects, null, 2));
  console.log(`\n=== DONE ===`);
  console.log(`Uploaded: ${totalUploaded}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Output: ${OUTPUT_JSON}`);
}

main().catch(console.error);
