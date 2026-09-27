# Bremo Company Sims HQ

Drop-in pack for `https://bremo.io/company/`.

Release marker: `bremo-company-sims-20260927-v2` (see `<meta name="bremo-release">` in `index.html`).

This replaces the thin demo (flat rooms, circle bots, dashboard dock). It is a full-screen isometric office. Employees walk, type, drink coffee, and post real lines to Analytics.

Do not invent Impact paid dollars. Click-outs are not paid. Impact stays UNKNOWN.

This pack does not touch Soft bank, KOHO, All Bonuses capture, or the lawyer-finder Book-a-call flow. Upload it only into `company/`.

## Files

```
company/index.html          Full-screen game shell + release meta
company/styles.css          Sims-style control plate (not a site dashboard)
company/game.js             Office, pathfinding, work loops, speak client
company/assets/plumbob.svg  Plumbob gem (favicon + plate)
company/README.md           This deploy note
company/.htaccess           No-cache + noindex for this directory only
```

## DreamHost deploy

The live site is Apache on DreamHost. `https://bremo.io/company/` is the `company/` directory on the bremo.io document root (today it serves the thin `index.html`, `styles.css`, `app.js`, and `cast.json`).

1. Back up the current `company/` folder (download it, or rename it to `company-prev/`).
2. Upload **the contents of this pack** into `company/` so these paths exist:
   - `company/index.html`
   - `company/styles.css`
   - `company/game.js`
   - `company/assets/plumbob.svg`
   - `company/.htaccess` (optional but stops the old 10-minute HTML cache)
3. Remove the retired demo files if they are still in that folder: `app.js`, `cast.json`. Leaving them is harmless; the new `index.html` does not load them.
4. Do **not** upload this pack over the site root, `offers/`, Soft bank, KOHO, All Bonuses, or lawyer-finder pages.
5. Open `https://bremo.io/company/` and hard-refresh (the previous response was `Cache-Control: max-age=600`).
6. View source and confirm:
   `meta name="bremo-release" content="bremo-company-sims-20260927-v2"`.

## What “working” looks like

- The office is an isometric dollhouse: cream walls, carpets, wood hall, desks, chairs, monitors, a huddle table, coffee bar, plants. Not circles on a blank grid.
- Ten distinct Sims: Bremo God, CEO, Growth, Markets, Product, Content, Partnerships, Conversion, Analytics, Payouts.
- Click a Sim (or a name on the plate). A green plumbob sits on the selected Sim. Mood and energy bars track that Sim.
- WASD or arrow keys walk. Click a carpet tile and the Sim pathfinds around walls and furniture (green dots mark the path).
- Orders: Work at desk, Check funnel, Partner outreach, Write content, Rally team, Speak to Analytics, Rest / coffee. Keys 1–7.
- Work (and the other orders) path to a real station, play a visible loop (typing, pointing, phone, coffee, cheer), and drain or restore energy.
- **Rally team** sends every Sim to the huddle, then each walks back to their desk and starts a work loop.
- Idle Sims wander their room or fidget at a desk. They are not frozen.
- Talk: type a line as the selected Sim and Send. They walk to Analytics and the line is posted.

## Speak API

Same-origin `POST /api/gameplay-speak.php` with `Content-Type: application/json`.

```json
{
  "character": "Growth",
  "message": "Growth worked the desk and fair-scored lander outs. Click-outs are not paid. Impact UNKNOWN.",
  "source": "company-sims"
}
```

Verified on the live host (2026-09-27):

- `200 {"ok":true,"queued":true}` when `message` is non-empty
- `{"error":"bad_message"}` when `message` is missing or empty
- `405 {"error":"method_not_allowed"}` on GET
- CORS allow-origin is `https://bremo.io` only, so the page must be served from bremo.io (not as a local file)

The contract is also commented above `sendSpeak` in `game.js`. A queued line shows a toast: “Growth → Analytics queued”. Lines are character signals. They are not paid receipts.
