# public/ — Vite static assets

Files here are served at the site root (e.g. `public/tank-farm.webp` → `/tank-farm.webp`).

## Splash background photo

The splash screen (`src/App.tsx` → `Splash`) looks for:

    /tank-farm.webp

Drop your compressed tank-farm image here with that exact name.
If the file is absent, the splash silently falls back to the plain
deep-petroleum background — nothing breaks.

**Compress before committing** (the raw PNG is multi-MB; target ~150–250 KB):
- Easiest: https://squoosh.app → load the PNG → choose WebP, quality ~75 →
  crop to the tank cluster (left ~two-thirds) → download → rename to
  `tank-farm.webp`.
- The splash overlays this heavily, so moderate compression is invisible.

## Logo

The splash logo comes from **Admin → Branding** (the `logoUrl` setting),
not from this folder. Upload `Tankonomics_Logo_White.png` there and it flows
to the splash automatically. No file needed here for the logo.
