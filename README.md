# Bremo Care

An AI-assisted care-matching platform that connects people with **licensed, verified**
care professionals — psychotherapists, registered dietitians, social workers, family
and couples therapists, child &amp; youth specialists, and wellness coaches.

People describe what they need once, in plain language; Bremo interprets the intake and
matches them to a professional who genuinely fits. Care is delivered by licensed humans —
AI does the finding, not the caring.

## Site structure (static, no build step)

```
index.html          Landing — value prop, services, how it works, provider CTA
find-care.html      Seeker intake form (the demand side)
join.html           Provider application form (the supply side) — collects licensing details
services.html       The full spectrum of care we match
how-it-works.html   Process + safety + where AI helps vs. where humans stay in charge
about.html          Mission and principles
crisis.html         Crisis resources (Canada + fallback) — always one click away
privacy.html        Plain-language privacy notice (TEMPLATE — needs legal review)
404.html            Friendly not-found page
assets/care.css     Design system (light + dark, responsive, accessible)
assets/care.js      Nav + progressive-enhancement form handling
assets/favicon.svg  Brand mark
```

The previous KOHO affiliate offer still lives under `offers/` and `assets/config.js` /
`assets/ab-test.js`; it is unchanged and preserved in git history.

## How the forms work today

Both intake and provider forms use progressive enhancement (`assets/care.js`):

- With **no backend wired up**, a submission is validated, stored in `localStorage`,
  and the user sees a confirmation — so nothing is silently lost during early testing.
- Add `data-endpoint="https://…"` to a `<form>` to POST the submission as JSON to a real
  collector (Formspree, a serverless function, your own API). The same success UI shows.

**This localStorage fallback is for prototyping only.** Intake data is sensitive health
information and must go to a secure, access-controlled backend before real users submit it.

## Before this touches a real person — required, not optional

1. **Legal + privacy review.** `privacy.html` is a template. Health-adjacent data in
   Canada is governed by PIPEDA and provincial health-privacy law (e.g. Ontario PHIPA).
   Have counsel finalise the privacy notice, terms of service, and provider agreements.
2. **A secure backend** for intake and provider data (encrypted at rest/in transit,
   access-controlled, audit-logged) — replacing the localStorage fallback.
3. **Real credential verification** for every provider (licence + standing confirmed with
   the relevant regulatory college/board) before any profile is matched.
4. **Crisis handling** reviewed by a clinician — the intake must reliably route apparent
   risk to 988/911 rather than into a matching queue.
5. **Verify crisis phone numbers** in `crisis.html` are current for each region served.

## Deploying

It's a plain static site — serve the folder from any static host (the repo's own host,
Netlify, Cloudflare Pages, S3, etc.). No build step, no server code required for the
marketing/intake site as-is.
