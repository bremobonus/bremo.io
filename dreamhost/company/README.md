# /company/ — full-screen office

Upload this folder over `public_html/company/` on DreamHost (the directory that already answers `https://bremo.io/company/`).

```
company/index.html
company/index.php
company/app.js
company/styles.css
```

`/company` redirects to `/company/`. Replace the old side-panel page. If an old `app.js` or `styles.css` stays beside these files, the browser may keep the old game until the cache expires. These names are the ones the page loads.

## How to play

The canvas fills the screen. Eleven people are already walking, typing, carrying, and meeting.

- Tap or click a person to select them.
- Tap the floor, or use arrow keys / WASD, to walk them.
- On a phone the office zooms in so people stay big enough to tap. Drag the floor to look around. The view follows whoever you select.
- Work, Carry, and Meeting are orders.
- Brief Analytics sends that person’s line to Analytics.
- Rally works only for Bremo God. Everyone walks to God Hall, then back to their desk.

Impact paid on the HUD is the word UNKNOWN. Nothing on this page is a dollar amount. A handoff is not revenue.

## Analytics

Brief and Rally POST to the live hook:

`POST /api/gameplay-speak.php`

```json
{
  "characterId": "4885dc27",
  "characterName": "Bremo God",
  "message": "Short line.",
  "target": "analytics",
  "page": "https://bremo.io/company/"
}
```

`/api/company-speak.php` is not on the server (it returns a normal page-not-found). Use `gameplay-speak.php`.

The same payload is the browser event `bremo:company`. Character ids match the crew map (`4885dc27` is Bremo God). Idle wandering does not post, so the log is not flooded.

There is no paid figure in these lines. Do not map them to revenue.
