# bremo.io

Static site for Bremo, running a KOHO affiliate offer with an A/B test.

## Structure

```
index.html                    Homepage — routes clicks into the A/B test
offers/koho-control.html      Variant A (control) — minimal CTA baseline
offers/koho.html              Variant B (treatment) — new landing page
assets/config.js              Affiliate URL + promo code (single source of truth)
assets/ab-test.js             50/50 split, persisted per visitor in localStorage
assets/style.css              Shared styles
```

## Before shipping

1. Open `assets/config.js` and replace `affiliateUrl` with the live Impact tracking URL from the KOHO dashboard.
2. Serve the static files (any static host works — Netlify, Cloudflare Pages, S3, etc.).

## A/B test

- Visitors are assigned `control` or `treatment` on first click and remembered via `localStorage`.
- Click events are stored locally under `bremo_koho_clicks`. Wire this to a real analytics pipeline (PostHog, GA4, etc.) before running the test for real — the localStorage log is a placeholder.
- Promo code `BREMO2026` and $20 bonus T&Cs appear on both variants.
