#!/usr/bin/env python3
"""
Sync new VdoCipher videos into src/data/courses-videos.json.

Usage:
    VDOCIPHER_API_KEY=<key> python3 scripts/sync-vdocipher-videos.py [--dry-run]

Run from the repo root. Requires git and gh CLI on PATH.
The calling machine's IP must be whitelisted in VdoCipher's account settings.
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

JSON_PATH = "src/data/courses-videos.json"

GENERAL_COURSES_DEFAULT = [
    "1_year_foundation",
    "2_year_foundation",
    "3_year_foundation",
    "apmc_1_0",
    "apmc_2_0",
]

API_BASE = "https://dev.vdocipher.com/api"
DRY_RUN = "--dry-run" in sys.argv

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def api_get(path: str, api_key: str) -> dict:
    url = API_BASE + path
    req = urllib.request.Request(url, headers={"Authorization": f"Apisecret {api_key}"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"HTTP {e.code} {e.reason} for {url}: {body}") from e


def loose(name: str) -> str:
    """Lowercase, strip trailing digits."""
    return re.sub(r"\d+$", "", name.lower()).strip()


def loose_course(course_id: str) -> str:
    """Lowercase, strip digits and underscores (for specialty matching)."""
    return re.sub(r"[\d_]+", "", course_id.lower())


def seconds_to_duration(sec: int) -> str:
    h = sec // 3600
    m = (sec % 3600) // 60
    s = sec % 60
    return f"{h}:{m:02d}:{s:02d}"


def clean_title(raw: str) -> str:
    # Strip leading NN_ prefix (e.g. "01_", "003_")
    title = re.sub(r"^\d+[_\-]\s*", "", raw)
    # Strip .mkv / .mp4 suffix
    title = re.sub(r"\.(mkv|mp4)$", "", title, flags=re.IGNORECASE)
    # Collapse multiple spaces
    title = re.sub(r"\s{2,}", " ", title).strip()
    return title


def slugify(name: str) -> str:
    """Turn a folder name into a subjectId."""
    slug = re.sub(r"[^\w\s]", "", name).strip()
    slug = re.sub(r"\s+", "_", slug)
    slug = slug.lower()
    slug = re.sub(r"\d+$", "", slug).rstrip("_")
    return slug


def fetch_all_videos(folder_id: str, api_key: str) -> list:
    """Paginate through all videos in a folder."""
    videos = []
    page = 1
    while True:
        data = api_get(f"/videos?folderId={folder_id}&page={page}&limit=200", api_key)
        rows = data.get("rows", [])
        videos.extend(rows)
        if len(rows) < 200:
            break
        page += 1
    return videos


def run(cmd: list, check=True) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=check, capture_output=True, text=True)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    api_key = os.environ.get("VDOCIPHER_API_KEY", "").strip()
    if not api_key:
        print("ERROR: VDOCIPHER_API_KEY is not set.", file=sys.stderr)
        sys.exit(1)

    # -----------------------------------------------------------------------
    # 1. Fetch folders
    # -----------------------------------------------------------------------
    print("Fetching VdoCipher folders…")
    folder_data = api_get("/videos/folders/root", api_key)
    folders = folder_data.get("folderList", [])
    print(f"  Found {len(folders)} folder(s): {[f['name'] for f in folders]}")

    # -----------------------------------------------------------------------
    # 2. Fetch videos per folder
    # -----------------------------------------------------------------------
    folder_videos: dict[str, list] = {}  # folder_id -> [video, …]
    for folder in folders:
        fid = folder["id"]
        fname = folder["name"]
        print(f"  Fetching videos for folder '{fname}' (id={fid})…")
        vids = fetch_all_videos(fid, api_key)
        folder_videos[fid] = vids
        print(f"    {len(vids)} video(s)")

    # -----------------------------------------------------------------------
    # 3. Load existing JSON
    # -----------------------------------------------------------------------
    with open(JSON_PATH) as f:
        data = json.load(f)

    courses = data["courses"]

    # Identify general vs specialty courses
    # specialty: courseId loose-match equals exactly one folder's loose name
    folder_loose_names = {loose(folder["name"]) for folder in folders}

    specialty_courses: dict[str, str] = {}  # courseId -> folder loose name it specialises in
    general_course_ids: list[str] = []

    for course in courses:
        cid = course["courseId"]
        cl = loose_course(cid)
        if cl in folder_loose_names:
            specialty_courses[cid] = cl
        else:
            general_course_ids.append(cid)

    print(f"\nGeneral courses: {general_course_ids}")
    print(f"Specialty courses: {specialty_courses}")

    # Build lookup: courseId -> course object
    course_map = {c["courseId"]: c for c in courses}

    # Build lookup: (courseId, subjectId) -> subject object
    def get_subject(course_obj, subject_id):
        for s in course_obj["subjects"]:
            if s["subjectId"] == subject_id:
                return s
        return None

    # Build set of existing videoIds per (courseId, subjectId)
    existing_ids: dict[tuple, set] = {}
    for course in courses:
        for subj in course["subjects"]:
            existing_ids[(course["courseId"], subj["subjectId"])] = {
                v["videoId"] for v in subj["videos"]
            }

    # Build existing subjectIds across all courses
    existing_subject_ids: set[str] = set()
    for course in courses:
        for subj in course["subjects"]:
            existing_subject_ids.add(subj["subjectId"])

    # -----------------------------------------------------------------------
    # 4 & 6. Map folders to subjects, process new videos
    # -----------------------------------------------------------------------
    added_videos: list[dict] = []        # for PR body
    skipped_videos: list[dict] = []      # for PR body
    new_subjects_created: list[dict] = []

    for folder in folders:
        fid = folder["id"]
        fname = folder["name"]
        fl = loose(fname)                # folder loose name (e.g. "ecology")

        # Determine subjectId for this folder
        # Match loose folder name against existing subjectIds
        matched_subject_id = None
        for sid in existing_subject_ids:
            if loose(sid) == fl:
                matched_subject_id = sid
                break

        if matched_subject_id is None:
            # New subject
            matched_subject_id = slugify(fname)
            new_subject_obj = {
                "subjectId": matched_subject_id,
                "displayName": fname,
                "icon": "fas fa-book",
                "videos": [],
            }
            print(f"\nNew subject detected: '{fname}' -> subjectId='{matched_subject_id}'")
            new_subjects_created.append({"folder": fname, "subjectId": matched_subject_id})
            existing_subject_ids.add(matched_subject_id)

            # Add new subject to all GENERAL courses
            for cid in general_course_ids:
                c = course_map[cid]
                c["subjects"].append(json.loads(json.dumps(new_subject_obj)))
                existing_ids[(cid, matched_subject_id)] = set()

        # Determine which courses receive videos from this folder
        target_course_ids = list(general_course_ids)  # always general
        for cid, spec_loose in specialty_courses.items():
            if spec_loose == fl:
                target_course_ids.append(cid)

        # Collect global set of videoIds already present in ANY course for dedup
        global_existing = set()
        for cid in target_course_ids:
            global_existing |= existing_ids.get((cid, matched_subject_id), set())

        videos_in_folder = folder_videos.get(fid, [])
        print(f"\nFolder '{fname}' -> subject '{matched_subject_id}': {len(videos_in_folder)} video(s) from VdoCipher")

        for vid in videos_in_folder:
            video_id = vid["id"]
            raw_title = vid.get("title", "")
            length_sec = int(vid.get("length", 0))

            # Skip test videos
            if "test" in raw_title.lower():
                print(f"  SKIP (test): {raw_title}")
                skipped_videos.append({"title": raw_title, "videoId": video_id, "folder": fname, "reason": "test"})
                continue

            # Check if already present in all target courses
            already_in_all = all(
                video_id in existing_ids.get((cid, matched_subject_id), set())
                for cid in target_course_ids
            )
            if already_in_all:
                continue

            title = clean_title(raw_title)
            duration = seconds_to_duration(length_sec)

            print(f"  NEW: [{video_id}] {title} ({duration})")

            # Append to each target course
            courses_touched = []
            for cid in target_course_ids:
                if video_id in existing_ids.get((cid, matched_subject_id), set()):
                    continue  # already there in this specific course
                c = course_map[cid]
                subj = get_subject(c, matched_subject_id)
                if subj is None:
                    # Subject doesn't exist in this course yet (shouldn't happen for general)
                    continue
                max_order = max((v["order"] for v in subj["videos"]), default=0)
                entry = {
                    "videoId": video_id,
                    "title": title,
                    "duration": duration,
                    "order": max_order + 1,
                }
                subj["videos"].append(entry)
                existing_ids.setdefault((cid, matched_subject_id), set()).add(video_id)
                courses_touched.append(cid)

            if courses_touched:
                added_videos.append({
                    "subject": matched_subject_id,
                    "title": title,
                    "duration": duration,
                    "videoId": video_id,
                    "courses": courses_touched,
                })

    # -----------------------------------------------------------------------
    # 5. Check for changes
    # -----------------------------------------------------------------------
    if not added_videos and not new_subjects_created:
        print("\nNo new videos. Exiting.")
        sys.exit(0)

    print(f"\nAdding {len(added_videos)} new video(s) across courses.")

    if DRY_RUN:
        print("--dry-run: JSON not written, no git operations.")
        sys.exit(0)

    # -----------------------------------------------------------------------
    # 7. Write JSON
    # -----------------------------------------------------------------------
    with open(JSON_PATH, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Written: {JSON_PATH}")

    # -----------------------------------------------------------------------
    # 8. Git operations
    # -----------------------------------------------------------------------
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    branch = f"sync/videos-{today}"
    n = len(added_videos)
    commit_msg = f"feat: sync {n} new VdoCipher video{'s' if n != 1 else ''} ({today})"

    run(["git", "checkout", "-b", branch])
    run(["git", "add", JSON_PATH])
    run(["git", "commit", "-m", commit_msg])
    run(["git", "push", "-u", "origin", branch])
    print(f"Pushed branch '{branch}'")

    # -----------------------------------------------------------------------
    # 9. Build PR body and open PR
    # -----------------------------------------------------------------------
    def fmt_list(items, fmt_fn):
        return "\n".join(f"- {fmt_fn(i)}" for i in items) or "_None_"

    added_section = fmt_list(
        added_videos,
        lambda v: f"**{v['subject']}** | {v['title']} ({v['duration']}) | `{v['videoId']}` | courses: {', '.join(v['courses'])}"
    )
    new_subjects_section = fmt_list(
        new_subjects_created,
        lambda s: f"Folder `{s['folder']}` -> subjectId `{s['subjectId']}` added to general courses"
    )
    skipped_section = fmt_list(
        skipped_videos,
        lambda v: f"[{v['reason']}] `{v['videoId']}` — {v['title']} (folder: {v['folder']})"
    )

    pr_body = f"""## VdoCipher video sync — {today}

### Added videos ({n})
{added_section}

### New subjects created ({len(new_subjects_created)})
{new_subjects_section}

### Skipped / test videos ({len(skipped_videos)})
{skipped_section}
"""

    result = run(
        [
            "gh", "pr", "create",
            "--title", commit_msg,
            "--body", pr_body,
            "--base", "main",
            "--head", branch,
        ]
    )
    print(result.stdout.strip())
    print("Done.")


if __name__ == "__main__":
    main()
