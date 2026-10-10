# Personal Nutrition, Fitness & Lifestyle Tracker — v2

A mobile-first, offline, vanilla HTML/CSS/JS personal health dashboard.

## Files

- `index.html` — app shell
- `app.js` — application, v1→v2 migration, local storage, scoring, trends, body tracking, backup/restore and dependency-free XLSX writer
- `style.css` — responsive/light/dark/auto UI
- `sw.js` — versioned cache-first app shell
- `manifest.webmanifest` — installable PWA manifest
- `icons/icon.svg` — app icon
- `tests.html` — browser self-test page / structural checks

## Storage

Primary data: `localStorage['ntl.v1']` (schemaVersion 2)

Safety keys:

- `ntl.v1.premigrate` — raw v1 JSON preserved before a v1→v2 migration
- `ntl.snapshots` — optional rolling snapshots, maximum 5
- `ntl.ui` — reserved for UI-only state
- `ntl.legacy.v1` — compatibility copy if the earlier generated build used `pnfl_tracker_v1`

The app never automatically deletes the premigration copy.

## v2 highlights

- Lossless v1→v2 migration with stable `lineageId`
- New week copies get new record IDs but preserve item lineage
- Editable stepper size, weights, key-item flag and scoring mode
- Optional daily tap logging with manual override marker
- Weighted consistency scoring with versioned formula
- Category score breakdown
- Weekly trend + rolling 4-week average
- Item lineage actual-vs-target trends
- Body weight/waist log + chart
- Week start preference: Mon / Sun / Sat without moving stored weeks
- Backfill/past-week creation with target review
- Weekly reflection prompts
- JSON backup/restore with replace or merge
- Web Share API file sharing when supported, download fallback
- Optional rolling snapshots (last 5)
- Persistent-storage request in Settings
- Dependency-free XLSX export with Body, Daily Log, Item Lineage and scoring metadata
- Installable PWA with cache-version cleanup

## GitHub Pages deployment

1. Create a repository and upload this folder's contents to the repository root.
2. In GitHub: **Settings → Pages**.
3. Select **Deploy from a branch**, choose the default branch and `/ (root)`.
4. Save and open the generated HTTPS Pages URL.
5. Open the site once on the device; the service worker can then cache the app shell for offline use.
6. On supported browsers, use **Install/Add to Home Screen**.

The service worker requires HTTPS (GitHub Pages provides it) or localhost. Opening `index.html` directly from `file://` still allows the core tracker/localStorage/export features, but PWA installation/service-worker caching will not work there.

## Self-test

Open `tests.html` from the same hosted folder. It covers migration, lineage invariants, weighted/capped scoring, week-start calculations, merge conflict behavior, XLSX structural assumptions and undo behavior. It is intentionally dependency-free.

## Defaults chosen

- Schema: v2
- Scoring formula: v1 of the new weighted scoring system
- Item weight: `1`
- Step: `1`, or `10` for units containing `gram`/`kg`
- Daily tracking: OFF
- Score by: Total
- Key item: OFF
- Days target: blank
- Week starts: Monday
- Consistency threshold: blank/off
- Backup reminder: 14 days
- Auto-snapshot: OFF
- Theme: Auto

## Device verification limitation

The project was syntax-checked with Node and packaged locally. Real iOS/Android install behavior, Web Share file handling, persistent-storage grants, and browser-specific localStorage quotas must still be verified on a physical device/browser.

### Personal thought card
- The Home screen includes 100 personal quotes with a tiny ↻ refresh control.
- Quotes are shuffled without repeating until the current set is exhausted.
- Quote shuffle state lives in `ntl.ui`, separate from tracker data, so quote changes never modify health/history records.
