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
empire/                       Network status board (noindex) — see below
```

## Empire board

`empire/index.html` is a cream-and-purple status board for the 12 Bremo network sites. It loads `./data.json` with `cache: "no-store"` and shows name, role, phase, HTTP status, latency, and notes, plus total / up / down / average speed. Those figures are reachability checks, not visitors or revenue.

This repo’s root is the web root, including on DreamHost. Publishing the `empire/` directory serves:

- `https://bremo.io/empire/` from `empire/index.html`
- `https://bremo.io/empire` via the host’s directory index (Apache on DreamHost redirects the bare path to the trailing-slash URL, so `./data.json` stays inside `empire/`)

The page sends `noindex,nofollow`, and `robots.txt` disallows `/empire`, same idea as the control offer page. It is not in the sitemap.

## Attribution

Attribution runs through the **promo code `BREMO2026`** entered during KOHO sign-up. CTAs send visitors to `https://www.koho.ca/` and auto-copy the promo code to their clipboard on click, so pasting it at sign-up is one tap.

If an Impact tracking URL is provisioned later, swap `affiliateUrl` in `assets/config.js`.

## Before shipping

1. Serve the static files (any static host works — Netlify, Cloudflare Pages, S3, etc.).
2. Replace the localStorage click log with real analytics (GA4, PostHog, etc.).

## A/B test

- Visitors are assigned `control` or `treatment` on first click and remembered via `localStorage`.
- Click events are stored locally under `bremo_koho_clicks`. Wire this to a real analytics pipeline (PostHog, GA4, etc.) before running the test for real — the localStorage log is a placeholder.
- Promo code `BREMO2026` and $20 bonus T&Cs appear on both variants.
