# Bremo Company Sims HQ

Drop-in pack for `https://bremo.io/company/`.

Release marker: `bremo-company-sims-20260927-v5` (see `<meta name="bremo-release">` in `index.html`).

This replaces the thin demo (flat rooms, circle bots, dashboard dock). It is a full-screen isometric office: walls, carpets, desks, chairs, monitors, plants, a plumbob, and pathfinding around furniture. Employees walk, type, carry, meet, drink coffee, and — only when a player order or the talk box asks them to — post a real line to Analytics.

Do not invent Impact paid dollars. Click-outs are not paid. Impact stays UNKNOWN.

This pack does not touch Soft bank, KOHO, All Bonuses capture, or the lawyer-finder Book-a-call flow. Upload it only into `company/`.

## Files

```
company/index.html          Full-screen game shell + release meta
company/styles.css          Sims-style control plate (not a site dashboard)
company/game.js             Office, pathfinding, idle loops, speak client
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
   `meta name="bremo-release" content="bremo-company-sims-20260927-v5"`.

## What “working” looks like

- The office is an isometric dollhouse: cream walls, carpets, wood hall, desks, chairs, monitors, a huddle table, coffee bar, plants. Not circles on a blank grid, and not a flat stick-figure office.
- Eleven distinct Sims: Bremo God, CEO, Growth, Markets, Product, Content, Partnerships, Conversion, Analytics, Grok Analytics (purple `#8B5CF6`, crew id `e5335dff`, own desk in ops), and Payouts.
- Click a Sim (or a name on the plate). A green plumbob sits on the selected Sim. Mood and energy bars track that Sim.
- WASD or arrow keys walk. Click a carpet tile and the Sim pathfinds around walls and furniture (green dots mark the path).
- On a phone the camera zooms in so people stay large enough to tap. Drag the floor to look around. Selecting a Sim follows them again.
- Orders: Work at desk, Check funnel, Partner outreach, Write content, Rally team, Speak to Analytics, Rest / coffee. Keys 1–7.
- Work (and the other orders) path to a real station, play a visible loop (typing, pointing, phone, coffee, cheer), and drain or restore energy. Those player orders post a line.
- **Rally team** sends every Sim to the huddle, then each walks back to their desk and starts a work loop.
- When nobody is giving orders, Sims idle on their own: they wander their carpet, type at the desk, carry a folder, or step into a short meet. Those loops are visible and they do **not** post.
- Talk: type a line as the selected Sim and Send. They walk to Analytics and the line is posted. A `$` in the box is refused.

## Speak API

Same-origin `POST /api/gameplay-speak.php` with `Content-Type: application/json`.

Player orders and the talk box only. Idle wandering, typing, carrying, and meeting do not post.

```json
{
  "characterId": "e5335dff",
  "characterName": "Grok Analytics",
  "message": "Grok Analytics read the log in plain words. Impact UNKNOWN. No paid figure.",
  "target": "analytics",
  "page": "https://bremo.io/company/"
}
```

`characterId` is the crew id (Grok Analytics is `e5335dff`). `characterName` is the display name. `target` is always `"analytics"`. `page` is always `"https://bremo.io/company/"`.

Verified on the live host (2026-09-27):

- `200 {"ok":true,"queued":true}` when `message` is non-empty
- `{"error":"bad_message"}` when `message` is missing or empty
- `405 {"error":"method_not_allowed"}` on GET
- CORS allow-origin is `https://bremo.io` only, so the page must be served from bremo.io (not as a local file)

The contract is also commented above `sendSpeak` in `game.js`. A queued line shows a toast: “Grok Analytics → Analytics queued”. Lines are character signals. They are not paid receipts. The client refuses any message that contains `$`.
