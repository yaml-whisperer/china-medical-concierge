# China Medical Concierge — v5 carousel draft (not published)

This folder is a **draft-only** copy of the v4 landing page plus a homepage hospital-photo carousel. Do **not** deploy it, do **not** push it to `main` or `gh-pages`, and do **not** replace the live GitHub Pages site at https://yaml-whisperer.github.io/china-medical-concierge/. Go-live stays blocked until the owner approves.

## Preview locally

```bash
python3 -m http.server 8766 --directory /workspace/opc-medical-mvp/v5-carousel-draft
```

Then open http://127.0.0.1:8766/ (English) and http://127.0.0.1:8766/zh-hant.html (Traditional Chinese).

## Carousel

A `#facilities` section sits after the hero and trust strip, before `#who`. It has a short intro, three anonymous setting blurbs (a major tertiary general hospital, a specialty / international-department setting, and a modern surgical campus — no hospital names), and one unified 16:9 photo carousel of six real Pexels photographs. Auto-slide left every 5 seconds, pause on hover/focus, no autoplay when `prefers-reduced-motion` is set; previous/next, dots, pointer swipe, and keyboard arrows when the carousel is focused. Photo licenses and source URLs are in `PHOTO-SOURCES.md`. A header nav link was not added, because the existing nav is already tight on mid-width screens.

# China Medical Concierge — v2

Static bilingual landing page (English and Traditional Chinese). Deploy `index.html`, `zh-hant.html`, `styles.css`, `app.js`, `README.md`, and the complete `assets/` folder to the GitHub Pages root. Preserve the folder structure. Do not upload `shots/` or test scripts. No build step. Asset paths are relative; Google Fonts is optional (system font fallback).

## Channels
Edit the single `CONFIG` object at the top of `app.js`. Leave values empty until accounts exist. WhatsApp accepts a full international number (converted to digits for wa.me); email accepts an address; social channels accept complete HTTPS profile URLs. No accounts, numbers, or handles are invented. Empty or invalid social links show a polite toast and scroll to the live assessment form. WhatsApp, Gmail/email and social channels are visibly coming soon. Update coming-soon explanatory copy when channels launch.

## Form
Original field names, IDs, option values, payload schema and transport behavior are preserved (no page_lang field added, for compatibility): probe `/api/health`, POST JSON to `/api/leads` when available; otherwise POST to `https://webhook.site/b044420a-e14f-4d6d-8ae1-3a5262be27e2`. API routes intentionally remain host-root paths; static assets remain relative. Local API POST errors do not trigger a second webhook POST (prevents duplicates). This temporary public webhook must be replaced with secure production intake before collecting sensitive health details. Never put private credentials in CONFIG.

## Preview
`python3 -m http.server 8766 --directory /workspace/opc-medical-mvp/v5-carousel-draft` (draft preview only)

Keyboard-friendly native FAQ, live status/toast, focus outlines, responsive layout and reduced-motion support. Social rail is hidden below 1100px; footer links remain available. SVG skyline is illustrative, not a hospital endorsement. No fake stats, testimonials, hospital logos or licensing claims. Screenshots and test artifacts are not deployment files.

## Languages and accessibility
English is `index.html` (`lang="en"`), Traditional Chinese is `zh-hant.html` (`lang="zh-Hant"`). Both have relative language-switch and hreflang links. Shared app.js selects an i18n dictionary from the document language for toasts, validation, sending, success and error states. Static copy, placeholders, option labels, image descriptions and accessible names are translated; submitted values are identical. Base body size is 18px desktop / 17px mobile; labels and supporting text have also been enlarged. Font stack: Inter, Noto Sans TC, PingFang TC, Microsoft JhengHei, system sans-serif.

## Original illustrations
All 10 SVG files in assets/ are original illustrative vectors: five service scenes, four patient-journey scenes, and one subtle cloud/window-lattice tile. They do not depict actual hospitals, employees or patients. PVG denotes Shanghai Pudong arrival, not a travel-service guarantee. A small red 滬 seal and jade/teal palette reference Shanghai without medical branding or endorsements. The hero card has no transform; its skyline is separated from its heading and coordinates have inset padding.

## Verification
Chromium browser checks and screenshot captures are recorded in `shots/bilingual-self-check.json`. Form success/failure branches are tested with locally intercepted requests only. No real webhook POST is performed. Test harness is outside deployment folder at `/workspace/opc-medical-mvp/test-bilingual-v2.cjs`.
