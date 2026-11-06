# China Medical Concierge — v2

Static English landing page. Upload only `index.html`, `styles.css`, `app.js`, and `README.md` to the GitHub Pages root. No build step. Asset paths are relative; Google Fonts is optional (system font fallback).

## Channels
Edit the single `CONFIG` object at the top of `app.js`. Leave values empty until accounts exist. WhatsApp accepts a full international number (converted to digits for wa.me); email accepts an address; social channels accept complete HTTPS profile URLs. No accounts, numbers, or handles are invented. Empty or invalid social links show a polite toast and scroll to the live assessment form. WhatsApp, Gmail/email and social channels are visibly coming soon. Update coming-soon explanatory copy when channels launch.

## Form
Original fields, validation, payload and submission logic are preserved: probe `/api/health`, POST JSON to `/api/leads` when available; otherwise POST to `https://webhook.site/b044420a-e14f-4d6d-8ae1-3a5262be27e2`. API routes intentionally remain host-root paths; static assets remain relative. Local API POST errors do not trigger a second webhook POST (prevents duplicates). This temporary public webhook must be replaced with secure production intake before collecting sensitive health details. Never put private credentials in CONFIG.

## Preview
`python3 -m http.server 8765 --directory /workspace/opc-medical-mvp/gh-pages-v2`

Keyboard-friendly native FAQ, live status/toast, focus outlines, responsive layout and reduced-motion support. Social rail is hidden below 1100px; footer links remain available. SVG skyline is illustrative, not a hospital endorsement. No fake stats, testimonials, hospital logos or licensing claims. Screenshots and test artifacts are not deployment files.
