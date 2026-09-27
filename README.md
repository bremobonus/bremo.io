# bremo.io

Static site for Bremo, running a KOHO affiliate offer with an A/B test.

## Structure

```
index.html                    Homepage — routes clicks into the A/B test
gameplay.html                 Playable /gameplay shift — you play Bremo God
offers/koho-control.html      Variant A (control) — minimal CTA baseline
offers/koho.html              Variant B (treatment) — new landing page
assets/config.js              Affiliate URL + promo code (single source of truth)
assets/ab-test.js             50/50 split, persisted per visitor in localStorage
assets/style.css              Shared styles
GAMEPLAY.md                   How Bremo God briefings reach Analytics
```

## /gameplay

`gameplay.html` is a game, not an article. On bremo.io’s Apache host, extensionless URLs are files: `/about.html` redirects to `/about`, and a trailing slash 404s. The same rule serves this file at `https://bremo.io/gameplay`.

You play **Bremo God** (title: Bremo God). Walk a visitor into range, then tap the crew desk that matches the job. Five clean handoffs win the shift. Impact paid is always the word UNKNOWN. The page never shows a dollar amount.

Character lines are messages. Analytics and the rest of the crew can read them from the `bremo:gameplay` event, `window.BremoGameplay`, the `dataLayer`, and the same `/api/bremo-event.php` pipe the homepage already uses. Details are in `GAMEPLAY.md`.

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
