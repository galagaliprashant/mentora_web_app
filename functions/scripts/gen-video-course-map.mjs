// Generates functions/src/video-course-map.json from the canonical course data
// in src/data/courses-videos.json. Run before building/deploying functions so the
// OTP function's video->course allowlist always matches the frontend catalog.
//
// Output shape: { [videoId: string]: string[] }  // courseIds the video belongs to
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(here, '../../src/data/courses-videos.json');
const outPath = resolve(here, '../src/video-course-map.json');

const data = JSON.parse(readFileSync(srcPath, 'utf8'));
const map = {};

for (const course of data.courses ?? []) {
  for (const subject of course.subjects ?? []) {
    for (const video of subject.videos ?? []) {
      const id = video.videoId;
      if (!id) continue;
      (map[id] ??= []).push(course.courseId);
    }
  }
}

// Dedupe courseIds per video
for (const id of Object.keys(map)) {
  map[id] = [...new Set(map[id])];
}

writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n');
console.log(`Wrote ${Object.keys(map).length} video->course entries to ${outPath}`);
