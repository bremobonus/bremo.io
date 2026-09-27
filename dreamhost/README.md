# Drop this on DreamHost

This folder is the `/gameplay` page for the live site. The public GitHub repo is not the DreamHost docroot. Agents and the private data files stay on the server (many of those paths return 403 to the public). Product copies these files up. Merging the GitHub PR does not publish bremo.io by itself.

## Why the slug 404s

A missing single-segment URL such as `/not-a-real-page` returns plain text:

```
Creator page not found.
```

That is the creator catch-all. It runs when the slug is not a real file. `strategy.php` is why `/strategy` is a page. `/gameplay` needs the same kind of file.

Today the server also has a `gameplay/` directory. `/gameplay` redirects to `/gameplay/`, and that folder’s old index is a static judgment hub (`bremo-gameplay-hub-20260926-v1`), not a game. `/gameplay.php` currently serves that same hub. Replace both.

## What to upload

Copy the contents of this folder into the DreamHost docroot (the same place `strategy.php` lives):

```
gameplay.php          required — keeps /gameplay.php a real file
gameplay.html         the page gameplay.php reads
gameplay/index.php    serves /gameplay/ if the directory stays
gameplay/index.html   same page, if DirectoryIndex prefers html
brains/bremo-god.json
brains/accountability.json
```

Delete the previous `gameplay/index.html` hub first, or overwrite it with this `index.html`. If the old hub file remains and Apache prefers `index.html`, visitors still see the static board.

After upload, these should all be the playable round, not “Creator page not found.”:

- `https://bremo.io/gameplay.php`
- `https://bremo.io/gameplay.html` (the server 301s `*.html` to the extensionless URL)
- `https://bremo.io/gameplay/`
- `https://bremo.io/gameplay` (redirects to `/gameplay/` while the directory exists)

Do not remove `gameplay.php` and leave only a directory. The creator router is what eats a slug with no file.

## What the page is

You play **Bremo God** (title: Bremo God, strategy tile BREMO GOD, color `#9F7AEA`, schedule 4:30pm ET).

The page has:

- The hero overseer
- Today’s judgment card
- A playable round: a job appears, you tap the accountability card that owns it, five clean handoffs clear the round
- Accountability cards for Growth, Conversion, Analytics, Product, Content, Partnerships, and Payouts
- A trap button, “Call this handoff revenue,” which he refuses

Impact paid is the word `UNKNOWN` on the page and in every message. There is no dollar amount. Clicks and handoffs are not revenue.

Sister boards linked from the page: `/strategy`, `/money`, `/analytics`, `/dealsanalytics`, `/content`, `/dailyprogress`, plus `/company/` and `/crew/`.

## Character → Analytics

Bremo God’s id on the crew map is `4885dc27` (`4885dc27-bremo-god`). Sims HQ also calls him `god`. This page sends `4885dc27`, the id the live speak panel already uses.

Lines post only when someone starts the round, taps a card, briefs, or marks UNKNOWN. Opening the page does not POST.

The POST matches `/company/` and `/crew/`:

```json
{
  "characterId": "4885dc27",
  "characterName": "Bremo God",
  "message": "Short line, 220 characters max.",
  "target": "analytics",
  "page": "https://bremo.io/gameplay"
}
```

`POST /api/gameplay-speak.php`

The same line is also a browser event so a listener can run even when that PHP file is missing (local preview):

```js
window.addEventListener("bremo:gameplay", function (e) {
  var msg = e.detail;
  // msg.impactPaid is always "UNKNOWN"
  // msg.characterId is "4885dc27"
  // msg.briefing is the line for the crew
});
```

`window.BremoGameplay` exposes `brain`, `accountability`, `queue`, `latest()`, and `onBriefing(fn)`. A `dataLayer` push uses `event: "bremo_gameplay"`. The last 40 lines sit in `localStorage` key `bremo_gameplay_briefing`.

DOM markers on `#bremo-gameplay`: `data-bremo-page`, `data-bremo-channel`, `data-impact-paid`, `data-character-id`, `data-last-event`, `data-line-id`.

Do not map `deliver_ok` or `gameplay_ready` to revenue or to Impact paid. Paid stays unknown until a receipt exists outside this page.

## Brains

`brains/bremo-god.json` is the character definition (id, color, 4:30pm ET, rules, speak contract).

`brains/accountability.json` is today’s judgment and the seven cards. Edit those files and re-upload. The HTML has a copy baked in so the round still runs if `/brains/` is not on the server. When `/brains/*.json` is reachable, the page uses the files.

## Checks after upload

1. `/gameplay/` shows “Play the 4:30 round,” not the old hub and not “Creator page not found.”
2. Start the round, tap the card he names, and the clean-handoff count moves.
3. “Call this handoff revenue” gets a refusal. Impact paid still reads UNKNOWN.
4. The network panel shows `POST /api/gameplay-speak.php` with `characterId` `4885dc27` and no dollar amount in the message.

## /company

`company/` is the full-screen office. Upload that folder over `public_html/company/` so `https://bremo.io/company/` is the game, not the old side panel. Steps are in `company/README.md`.
