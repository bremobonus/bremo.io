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

## How lead capture works

The intake and provider forms POST to a small, dependency-free PHP backend that runs on
stock shared hosting (DreamHost, etc.). Each submission is:

1. **Emailed** to the address in `api/config.php` (`notify_email`).
2. **Appended to a CSV** in `api/data/` (`intake.csv` / `provider.csv`) as a durable record.

```
api/config.php    Settings you edit: notify email, from address, rate limit
api/_lib.php      Shared validation + email + CSV logic (honeypot, rate limit, header-injection guards)
api/intake.php    Care-seeker endpoint  (find-care.html → data-endpoint="/api/intake.php")
api/provider.php  Provider endpoint     (join.html      → data-endpoint="/api/provider.php")
api/data/         Runtime storage — protected by .htaccess, CSVs git-ignored (never commit real leads)
```

`assets/care.js` submits via `fetch`; if the endpoint is ever unreachable it falls back to
`localStorage` so a lead is never silently lost. A hidden honeypot field and a per-IP hourly
rate limit block basic spam.

### Deploy the backend (DreamHost)

1. Upload the whole repo to your site's web root via SFTP/SSH.
2. Edit **`api/config.php`** → set `notify_email` to your inbox and `from_email` to an
   address on your own domain (e.g. `no-reply@bremo.io`) for deliverability.
3. Ensure `api/data/` is writable by the web server (`chmod 750 api/data`).
4. Submit a test lead and confirm the email arrives and a row appears in `api/data/intake.csv`.
5. Gmail can spam-filter PHP `mail()`. For reliable delivery, point `from_email` at a real
   mailbox on the domain, or upgrade `bremo_send_email()` to SMTP later.

> **Still required before real users:** the CSV+email backend is production-*capable* for
> capturing leads, but health intake data ultimately belongs in an encrypted, access-controlled,
> audit-logged store (see below). Treat CSV capture as the launch step, not the end state.

## Before this touches a real person — required, not optional

1. **Legal + privacy review.** `privacy.html` is a template. Health-adjacent data in
   Canada is governed by PIPEDA and provincial health-privacy law (e.g. Ontario PHIPA).
   Have counsel finalise the privacy notice, terms of service, and provider agreements.
2. **Harden the backend.** The PHP handler captures leads (email + CSV) today; before
   scaling, move intake data into an encrypted, access-controlled, audit-logged store and
   send notification email over authenticated SMTP.
3. **Real credential verification** for every provider (licence + standing confirmed with
   the relevant regulatory college/board) before any profile is matched.
4. **Crisis handling** reviewed by a clinician — the intake must reliably route apparent
   risk to 988/911 rather than into a matching queue.
5. **Verify crisis phone numbers** in `crisis.html` are current for each region served.

## Deploying

Upload the repo to a PHP-capable host (DreamHost shared hosting works out of the box) so
the `api/*.php` lead endpoints run. The marketing pages are plain static HTML/CSS/JS; only
lead capture needs PHP. See "Deploy the backend" above for the one config edit required.
