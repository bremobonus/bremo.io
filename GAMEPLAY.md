# /gameplay briefings

`gameplay.html` is the playable shift at `https://bremo.io/gameplay`. You play **Bremo God** (title: Bremo God). The page is a game. The same lines he says are structured messages so Analytics can brief the crew.

Bremo.io serves each page as a static HTML file. `/about.html` redirects to `/about`. This page follows that: the file is `gameplay.html`, the public URL is `/gameplay`. Do not add a `gameplay/` folder — a folder would take the URL and the game would miss it.

## What Bremo God tells the crew

On load, and again when a shift starts, he sends one briefing:

> Bremo God speaking. /gameplay is a playable shift. I oversee Growth, Conversion Daily, Analytics, Grok Analytics, Product, Content, Partnerships, Payouts Tracker, Markets, and CEO Allastair. Push the partner handoff. A click-out is not revenue. A handoff is not revenue. Impact paid stays UNKNOWN until a real receipt lands.

Impact paid is the word `UNKNOWN` on every message. The game has no receipt feed, so it must not invent a paid number. Score counts are clean handoffs, visitors who left, and refused paid stamps. Those counts are not money.

## How to listen

Same message, four hooks. Use whichever one Product already has.

1. **Browser event** `bremo:gameplay` on `window`. The message is `event.detail`.
2. **`window.BremoGameplay`** — `roster`, `queue`, `latest()`, and `onBriefing(fn)`.
3. **`dataLayer`** push with `event: "bremo_gameplay"` for the tag manager. Flat fields only: `gameplay_event`, `line_id`, `speaker_id`, `page`, `impact_paid`.
4. **POST `/api/bremo-event.php`**, the same endpoint the homepage uses. Body shape matches that pipe (`event`, `timestamp`, `pagePath`, `sessionId`, `attribution`) plus a `gameplay` object with the full line. `event` is `gameplay_briefing`. `pagePath` is `/gameplay`. If the file is opened off bremo.io and the endpoint is missing, the game still runs.

A copy of the latest lines also sits in `localStorage` under `bremo_gameplay_briefing` (last 40). That is a stand-in until the pipe above is confirmed in the dashboard, same idea as `bremo_koho_clicks`.

DOM markers if you need them without a listener: `main#bremo-gameplay` has `data-bremo-page`, `data-bremo-channel`, `data-impact-paid`, `data-last-event`, and `data-line-id`. The static contract is the JSON block `#bremo-gameplay-contract`.

## Message shape

```json
{
  "v": 1,
  "page": "/gameplay",
  "channel": "bremo:gameplay",
  "event": "deliver_ok",
  "speaker": { "id": "bremo-god", "name": "Bremo God", "title": "Bremo God" },
  "audience": ["growth", "conversion-daily", "analytics", "grok-analytics", "product", "content", "partnerships", "payouts-tracker", "markets", "ceo-allastair"],
  "impactPaid": "UNKNOWN",
  "ts": "2026-09-27T00:00:00.000Z",
  "lineId": "bg.deliver.conversion-daily",
  "text": "Short line Bremo God just said.",
  "briefing": "One line the crew can act on.",
  "mentions": ["conversion-daily"],
  "score": { "cleanHandoffs": 1, "drops": 0, "fouls": 0 }
}
```

`shift_start` and `gameplay_ready` also include `roster`.

## Events

| event | when |
| --- | --- |
| `gameplay_ready` | Page opened. Brief the crew that /gameplay exists. |
| `shift_start` | Player pressed Play. Roster included. |
| `visitor_spawn` | A visitor walked on with a job. |
| `pickup` | Bremo God reached them. |
| `deliver_ok` | Right desk. This is a clean handoff, not a payment. |
| `deliver_wrong` | Wrong desk. Visitor still in hand. |
| `foul_paid_stamp` | Player tried to stamp the handoff as paid. Refused. |
| `need_visitor` | A desk was tapped with empty hands. |
| `visitor_drop` | Visitor left before the handoff. |
| `shift_win` | Five clean handoffs. Ask Analytics to brief the crew. |
| `shift_lose` | Time ran out. |

## Wire-up example

```js
window.addEventListener("bremo:gameplay", function (e) {
  var msg = e.detail;
  // msg.impactPaid is always "UNKNOWN"
  // msg.briefing is the line to forward to the crew
});
```

Listener notes for Product: treat `gameplay_ready` as the page briefing and `deliver_ok` as a clean handoff. Do not map either event to revenue or to Impact paid. Paid stays unknown until a receipt exists outside this game.
