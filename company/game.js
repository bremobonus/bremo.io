/* Bremo Company Sims HQ
 * Release marker: bremo-company-sims-20260927-v2
 *
 * Speak endpoint contract — proved against the live host on 2026-09-27
 * -------------------------------------------------------------------
 * POST /api/gameplay-speak.php
 * Content-Type: application/json
 *
 * Body (exactly these fields; message must be a non-empty string):
 *   {
 *     "character": "Growth",
 *     "message": "Growth worked the desk. Click-outs are not paid. Impact UNKNOWN.",
 *     "source": "company-sims"
 *   }
 *
 * Observed responses on https://bremo.io:
 *   200 {"ok":true,"queued":true}      accepted
 *   4xx {"error":"bad_message"}        missing or empty message
 *   405 {"error":"method_not_allowed"} GET is rejected
 *   OPTIONS 204
 *   Access-Control-Allow-Origin: https://bremo.io
 *   Access-Control-Allow-Methods: POST, OPTIONS
 *   Access-Control-Allow-Headers: Content-Type
 *
 * This page is deployed same-origin at https://bremo.io/company/ and posts
 * to the relative URL /api/gameplay-speak.php. Lines are untrusted character
 * signals for Analytics. They are not Impact receipts. Click-outs are not
 * paid. Impact stays UNKNOWN. Never invent paid dollars.
 */
(() => {
  const RELEASE = 'bremo-company-sims-20260927-v2';
  const SPEAK_URL = '/api/gameplay-speak.php';
  const SPEAK_SOURCE = 'company-sims';

  const TW = 64;
  const TH = 32;
  const WALL_TALL = 70;
  const WALL_PONY = 30;
  const WALL_LIP = 12;

  const MAP = [
    '######################',
    '#GGGGGGGGG#RRRRRRRRRR#',
    '#GGGGGGGGG#RRRRRRRRRR#',
    '#GGGGGGGGGHRRRRRRRRRR#',
    '#GGGGGGGGGHRRRRRRRRRR#',
    '#GGGGGGGGG#RRRRRRRRRR#',
    '#GGGGGGGGG#RRRRRRRRRR#',
    '###HH###HH##HH###HH###',
    '#BBBBBB#MMMMMMM#OOOOO#',
    '#BBBBBB#MMMMMMM#OOOOO#',
    '#BBBBBBHMMMMMMMHOOOOO#',
    '#BBBBBBHMMMMMMMHOOOOO#',
    '#BBBBBB#MMMMMMM#OOOOO#',
    '#PPPPPP#MMMMMMM#OOOOO#',
    '#PPPPPP#MMMMMMM#OOOOO#',
    '######################',
  ];
  const MAP_H = MAP.length;
  const MAP_W = MAP[0].length;

  const CARPET = {
    G: ['#7d5cb8', '#916dca', '#c4b0ea'],
    R: ['#eea3aa', '#f6b8be', '#ffe4e7'],
    B: ['#7ed4a8', '#a4e4c4', '#e5fff2'],
    O: ['#8eb8d2', '#b7d2e4', '#f3f9fc'],
    P: ['#efb97e', '#f6d0a4', '#fff3e4'],
    M: ['#f0e2c8', '#f7efe2', '#fffdf8'],
    H: ['#d2a86e', '#c49558', '#f0ddb4'],
  };

  const CAST = [
    { id: 'god', name: 'Bremo God', role: 'Judgment', color: '#9F7AEA', pants: '#4c1d95', skin: '#f3d2b0', hair: '#f6e7c1', hairStyle: 'crown', outfit: 'robe', scale: 1.14, beard: true, home: { x: 3, y: 4 }, energy: 0.86, mood: 0.9 },
    { id: 'ceo', name: 'CEO', role: 'Direction', color: '#C084FC', pants: '#3b0764', skin: '#f0c7a4', hair: '#2a2118', hairStyle: 'slick', outfit: 'suit', scale: 1.06, home: { x: 7, y: 4 }, energy: 0.78, mood: 0.74 },
    { id: 'growth', name: 'Growth', role: 'Leads', color: '#FB7185', pants: '#3f2a44', skin: '#e0aa84', hair: '#1c140f', hairStyle: 'spiky', outfit: 'blazer', scale: 1, home: { x: 13, y: 4 }, energy: 0.7, mood: 0.8 },
    { id: 'markets', name: 'Markets', role: 'Macro', color: '#22D3EE', pants: '#1e3a4c', skin: '#c68642', hair: '#1a120c', hairStyle: 'afro', outfit: 'shirt', scale: 1.02, home: { x: 17, y: 4 }, energy: 0.64, mood: 0.66 },
    { id: 'product', name: 'Product', role: 'Ships', color: '#34D399', pants: '#1f2937', skin: '#8d5524', hair: '#111', hairStyle: 'beanie', outfit: 'tee', scale: 1, home: { x: 3, y: 9 }, energy: 0.58, mood: 0.72 },
    { id: 'content', name: 'Content', role: 'Words', color: '#F472B6', pants: '#3b2f4a', skin: '#f1c7a0', hair: '#4a2c1a', hairStyle: 'pony', outfit: 'sweater', scale: 0.98, home: { x: 5, y: 11 }, energy: 0.76, mood: 0.84 },
    { id: 'partnerships', name: 'Partnerships', role: 'Partners', color: '#FB923C', pants: '#3f2e22', skin: '#d9a07a', hair: '#2b1a10', hairStyle: 'quiff', outfit: 'blazer', scale: 1.03, home: { x: 3, y: 14 }, energy: 0.62, mood: 0.6 },
    { id: 'conversion', name: 'Conversion', role: 'Funnels', color: '#F59E0B', pants: '#3a3228', skin: '#f0c9a0', hair: '#3a2414', hairStyle: 'side', outfit: 'suit', scale: 1, glasses: true, home: { x: 17, y: 9 }, energy: 0.8, mood: 0.55 },
    { id: 'analytics', name: 'Analytics', role: 'Signals', color: '#38BDF8', pants: '#1e293b', skin: '#f6d3b4', hair: '#2a231c', hairStyle: 'short', outfit: 'hoodie', scale: 1, headphones: true, home: { x: 17, y: 11 }, energy: 0.72, mood: 0.7 },
    { id: 'payouts', name: 'Payouts', role: 'Receipts', color: '#10B981', pants: '#14261f', skin: '#6b3e26', hair: '#140e0c', hairStyle: 'short', outfit: 'vest', scale: 1, home: { x: 17, y: 13 }, energy: 0.5, mood: 0.48 },
  ];

  const PROPS = [
    { type: 'shelf', x: 1, y: 1 },
    { type: 'plant', x: 8, y: 2, pot: '#c46b4a' },
    { type: 'plant', x: 9, y: 5, pot: '#d7d3ce' },
    { type: 'desk', x: 2, y: 3, screen: 'judgment', owner: 'god' },
    { type: 'chair', x: 3, y: 4 },
    { type: 'desk', x: 6, y: 3, screen: 'plan', owner: 'ceo' },
    { type: 'chair', x: 7, y: 4 },
    { type: 'sofa', x: 4, y: 5, w: 2, d: 1 },
    { type: 'plant', x: 11, y: 2, pot: '#efb97e' },
    { type: 'desk', x: 12, y: 3, screen: 'bars', owner: 'growth' },
    { type: 'chair', x: 13, y: 4 },
    { type: 'desk', x: 16, y: 3, screen: 'news', owner: 'markets' },
    { type: 'chair', x: 17, y: 4 },
    { type: 'board', x: 19, y: 5, mode: 'funnel' },
    { type: 'plant', x: 14, y: 6, pot: '#6b8f71' },
    { type: 'plant', x: 6, y: 6, pot: '#f4efe6' },
    { type: 'desk', x: 2, y: 8, screen: 'code', owner: 'product' },
    { type: 'chair', x: 3, y: 9 },
    { type: 'board', x: 1, y: 11, mode: 'copy' },
    { type: 'plant', x: 6, y: 8, pot: '#c46b4a' },
    { type: 'desk', x: 4, y: 10, screen: 'text', owner: 'content' },
    { type: 'chair', x: 5, y: 11 },
    { type: 'printer', x: 6, y: 12 },
    { type: 'desk', x: 2, y: 13, screen: 'phone', owner: 'partnerships' },
    { type: 'chair', x: 3, y: 14 },
    { type: 'plant', x: 5, y: 14, pot: '#e7d8c2' },
    { type: 'table', x: 9, y: 10, w: 3, d: 2 },
    { type: 'chair', x: 8, y: 10 },
    { type: 'chair', x: 8, y: 11 },
    { type: 'chair', x: 12, y: 10 },
    { type: 'chair', x: 12, y: 11 },
    { type: 'chair', x: 9, y: 9 },
    { type: 'chair', x: 10, y: 9 },
    { type: 'chair', x: 11, y: 9 },
    { type: 'chair', x: 9, y: 12 },
    { type: 'chair', x: 10, y: 12 },
    { type: 'chair', x: 11, y: 12 },
    { type: 'plant', x: 8, y: 13, pot: '#d7d3ce' },
    { type: 'plant', x: 13, y: 8, pot: '#7d9a62' },
    { type: 'desk', x: 16, y: 8, screen: 'funnel', owner: 'conversion' },
    { type: 'chair', x: 17, y: 9 },
    { type: 'desk', x: 16, y: 10, screen: 'signals', owner: 'analytics' },
    { type: 'chair', x: 17, y: 11 },
    { type: 'desk', x: 16, y: 12, screen: 'ledger', owner: 'payouts' },
    { type: 'chair', x: 17, y: 13 },
    { type: 'coffee', x: 19, y: 12, w: 2, d: 1 },
    { type: 'plant', x: 20, y: 8, pot: '#f4efe6' },
    { type: 'cabinet', x: 20, y: 14 },
    { type: 'plant', x: 16, y: 14, pot: '#8d5a3c' },
  ];

  const FUNNEL = [{ x: 18, y: 5, face: 'e' }, { x: 18, y: 6, face: 'e' }, { x: 19, y: 6, face: 'n' }];
  const PHONES = [{ x: 4, y: 13, face: 'w' }, { x: 4, y: 14, face: 'w' }, { x: 5, y: 13, face: 'w' }];
  const BOARDS = [{ x: 2, y: 11, face: 'w' }, { x: 2, y: 12, face: 'w' }, { x: 2, y: 10, face: 'w' }];
  const COFFEE = [{ x: 18, y: 12, face: 'e' }, { x: 19, y: 11, face: 's' }, { x: 19, y: 13, face: 'n' }];
  const SPEAK = [{ x: 18, y: 11, face: 'w' }, { x: 18, y: 10, face: 'w' }, { x: 16, y: 11, face: 'e' }];
  const HUDDLE = [
    { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 12, y: 10 }, { x: 12, y: 11 },
    { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 11, y: 9 },
    { x: 9, y: 12 }, { x: 10, y: 12 }, { x: 11, y: 12 },
  ];

  const ACTIONS = [
    { id: 'work', key: '1', label: 'Work at desk', icon: 'desk' },
    { id: 'funnel', key: '2', label: 'Check funnel', icon: 'funnel' },
    { id: 'partner', key: '3', label: 'Partner outreach', icon: 'phone' },
    { id: 'content', key: '4', label: 'Write content', icon: 'pen' },
    { id: 'rally', key: '5', label: 'Rally team', icon: 'megaphone' },
    { id: 'analytics', key: '6', label: 'Speak to Analytics', icon: 'chat' },
    { id: 'coffee', key: '7', label: 'Rest / coffee', icon: 'cup' },
  ];

  const ICONS = {
    desk: '<svg viewBox="0 0 24 24" fill="none" stroke="#3b2e22" stroke-width="1.8"><path d="M3 9h18v2H3z"/><path d="M5 11v6M19 11v6M8 15h3"/><path d="M14 8V5h4v3"/></svg>',
    funnel: '<svg viewBox="0 0 24 24" fill="none" stroke="#3b2e22" stroke-width="1.8"><path d="M4 5h16l-6 7v5l-4 2v-7z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="#3b2e22" stroke-width="1.8"><path d="M7 3h4l1 4-2 1a12 12 0 006 6l1-2 4 1v4c0 1-1 2-2 2C10 19 5 14 5 5c0-1 1-2 2-2z"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="#3b2e22" stroke-width="1.8"><path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M13 6l3 3"/></svg>',
    megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="#3b2e22" stroke-width="1.8"><path d="M4 10v4h3l8 4V6L7 10z"/><path d="M7 14v3a2 2 0 004 0v-1"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="#3b2e22" stroke-width="1.8"><path d="M5 6h14v9H8l-3 3z"/></svg>',
    cup: '<svg viewBox="0 0 24 24" fill="none" stroke="#3b2e22" stroke-width="1.8"><path d="M6 9h9v5a4 4 0 01-4 4H9a4 4 0 01-3-4z"/><path d="M15 10h2a2 2 0 010 4h-2"/><path d="M8 5c0 1 .6 1 .6 2M11 5c0 1 .6 1 .6 2"/></svg>',
  };

  const canvas = document.getElementById('world');
  const ctx = canvas.getContext('2d');
  const portrait = document.getElementById('portrait');
  const pctx = portrait.getContext('2d');
  const hintEl = document.getElementById('hint');
  const toastEl = document.getElementById('toasts');
  const nameEl = document.getElementById('sim-name');
  const roleEl = document.getElementById('sim-role');
  const statusEl = document.getElementById('sim-status');
  const moodFill = document.getElementById('mood-fill');
  const energyFill = document.getElementById('energy-fill');
  const moodVal = document.getElementById('mood-val');
  const energyVal = document.getElementById('energy-val');
  const rosterEl = document.getElementById('roster');
  const actionsEl = document.getElementById('actions');
  const talkForm = document.getElementById('talk');
  const talkInput = document.getElementById('talk-input');
  const talkWho = document.getElementById('talk-who');

  const blocked = new Set();
  const particles = [];
  const keys = new Set();
  let selectedId = 'god';
  let hoverId = null;
  let cam = { scale: 1, viewCx: 0, viewCy: 0, cx: 0, cy: 0 };
  let bounds = null;
  let stateT = 0;
  let hintUntil = 0;
  const showGrid = new URLSearchParams(location.search).has('grid');

  function tileAt(x, y) {
    if (y < 0 || x < 0 || y >= MAP_H || x >= MAP_W) return '#';
    return MAP[y][x];
  }
  function isWall(x, y) { return tileAt(x, y) === '#'; }
  function isFloor(x, y) {
    const t = tileAt(x, y);
    return t !== '#' && t !== undefined && x >= 0 && y >= 0 && x < MAP_W && y < MAP_H && MAP[y][x] !== '#';
  }
  function walkable(x, y) {
    if (!isFloor(x, y)) return false;
    return !blocked.has(x + ',' + y);
  }
  function iso(x, y) {
    return { x: (x - y) * (TW / 2), y: (x + y) * (TH / 2) };
  }
  function P(x, y, z) {
    const p = iso(x, y);
    return [p.x, p.y - z];
  }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const ch = (v) => Math.max(0, Math.min(255, v + amt));
    const r = ch((n >> 16) & 255);
    const g = ch((n >> 8) & 255);
    const b = ch(n & 255);
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  function hash(x, y) {
    return ((x * 73856093) ^ (y * 19349663)) >>> 0;
  }

  function footprint(prop) {
    const w = prop.w || 1;
    const d = prop.d || 1;
    const cells = [];
    for (let dy = 0; dy < d; dy++) {
      for (let dx = 0; dx < w; dx++) cells.push([prop.x + dx, prop.y + dy]);
    }
    return cells;
  }

  const SOLID = new Set(['desk', 'table', 'board', 'coffee', 'shelf', 'printer', 'cabinet', 'sofa']);
  PROPS.forEach((prop) => {
    if (!SOLID.has(prop.type)) return;
    footprint(prop).forEach(([x, y]) => blocked.add(x + ',' + y));
  });

  const sims = CAST.map((c, i) => ({
    ...c,
    x: c.home.x,
    y: c.home.y,
    path: [],
    order: null,
    anim: 'idle',
    facing: 's',
    phase: Math.random(),
    seed: i * 1.7 + 0.4,
    bubble: null,
    thought: null,
    idleIn: 1.2 + Math.random() * 2.4,
    moveCd: 0,
    blinkT: Math.random() * 3,
    pendingLine: null,
  }));

  function simById(id) { return sims.find((s) => s.id === id); }
  function selected() { return simById(selectedId); }

  function octile(dx, dy) {
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    return Math.max(ax, ay) + (Math.SQRT2 - 1) * Math.min(ax, ay);
  }

  function astar(sx, sy, gx, gy) {
    if (!walkable(gx, gy)) return null;
    const key = (x, y) => x + ',' + y;
    const startK = key(sx, sy);
    if (startK === key(gx, gy)) return [];
    const open = [startK];
    const gScore = { [startK]: 0 };
    const parent = {};
    const closed = new Set();
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    while (open.length) {
      let bi = 0;
      let best = Infinity;
      for (let i = 0; i < open.length; i++) {
        const [x, y] = open[i].split(',').map(Number);
        const f = gScore[open[i]] + octile(gx - x, gy - y);
        if (f < best) { best = f; bi = i; }
      }
      const cur = open.splice(bi, 1)[0];
      if (cur === key(gx, gy)) {
        const path = [];
        let c = cur;
        while (c && c !== startK) {
          const [x, y] = c.split(',').map(Number);
          path.push({ x, y });
          c = parent[c];
        }
        path.reverse();
        return path;
      }
      closed.add(cur);
      const [x, y] = cur.split(',').map(Number);
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (!walkable(nx, ny)) continue;
        if (dx !== 0 && dy !== 0 && (!walkable(x + dx, y) || !walkable(x, y + dy))) continue;
        const nk = key(nx, ny);
        if (closed.has(nk)) continue;
        const step = dx !== 0 && dy !== 0 ? Math.SQRT2 : 1;
        const ng = gScore[cur] + step;
        if (gScore[nk] === undefined || ng < gScore[nk]) {
          gScore[nk] = ng;
          parent[nk] = cur;
          if (!open.includes(nk)) open.push(nk);
        }
      }
    }
    return null;
  }

  function findPath(sim, gx, gy) {
    let sx = Math.round(sim.x);
    let sy = Math.round(sim.y);
    if (!walkable(sx, sy)) {
      const opts = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]];
      const found = opts.map(([dx, dy]) => [sx + dx, sy + dy]).find(([x, y]) => walkable(x, y));
      if (!found) return null;
      sx = found[0];
      sy = found[1];
    }
    return astar(sx, sy, gx, gy);
  }

  function navCheck() {
    const problems = [];
    const goals = [];
    sims.forEach((s) => goals.push(['home ' + s.id, s.home]));
    FUNNEL.forEach((t, i) => goals.push(['funnel ' + i, t]));
    PHONES.forEach((t, i) => goals.push(['phone ' + i, t]));
    BOARDS.forEach((t, i) => goals.push(['board ' + i, t]));
    COFFEE.forEach((t, i) => goals.push(['coffee ' + i, t]));
    SPEAK.forEach((t, i) => goals.push(['speak ' + i, t]));
    HUDDLE.forEach((t, i) => goals.push(['huddle ' + i, t]));
    goals.forEach(([name, g]) => {
      if (!walkable(g.x, g.y)) problems.push(name + ' blocked ' + g.x + ',' + g.y);
      else if (!astar(10, 9, g.x, g.y)) problems.push(name + ' unreachable');
    });
    MAP.forEach((row, i) => {
      if (row.length !== MAP_W) problems.push('row ' + i + ' len ' + row.length);
    });
    if (problems.length) console.warn(RELEASE + ' nav', problems);
    else console.info(RELEASE + ' nav ok');
    return problems;
  }

  function destinations(kind, sim) {
    if (kind === 'work') return [{ ...sim.home, face: 's' }];
    if (kind === 'funnel') return FUNNEL;
    if (kind === 'partner') return PHONES;
    if (kind === 'content') return BOARDS;
    if (kind === 'coffee') return COFFEE;
    if (kind === 'analytics') {
      if (sim.id === 'analytics') return [{ ...sim.home, face: 's' }];
      return SPEAK;
    }
    return [{ ...sim.home, face: 's' }];
  }

  function pickTile(tiles, sim) {
    const taken = new Set();
    sims.forEach((o) => {
      if (o === sim || !o.order || !o.order.dest) return;
      taken.add(o.order.dest.x + ',' + o.order.dest.y);
    });
    let best = null;
    let bestD = 1e9;
    tiles.forEach((t) => {
      if (taken.has(t.x + ',' + t.y) && tiles.length > 1) return;
      const d = Math.hypot(sim.x - t.x, sim.y - t.y);
      if (d < bestD) { bestD = d; best = t; }
    });
    return best || tiles[0];
  }

  function facingFromDelta(dx, dy) {
    const sx = dx - dy;
    const sy = dx + dy;
    if (Math.abs(sy) > Math.abs(sx) * 0.8) return sy > 0 ? 's' : 'n';
    return sx > 0 ? 'e' : 'w';
  }

  function lineFor(sim, kind) {
    if (kind === 'analytics' && sim.pendingLine) {
      const text = sim.pendingLine;
      sim.pendingLine = null;
      return text;
    }
    const n = sim.name;
    const book = {
      work: {
        god: 'Bremo God worked the throne desk and wrote the judgment: keep the HQ playable, hold Soft/KOHO/All Bonuses capture v4, and do not invent Impact paid dollars.',
        ceo: 'CEO worked the direction desk and locked priorities. Click-outs are not paid. Impact UNKNOWN.',
        growth: 'Growth worked the desk and fair-scored lander outs. Click-outs are not paid. Impact UNKNOWN.',
        markets: 'Markets worked the news desk and scanned headlines. No revenue was booked. Impact UNKNOWN.',
        product: 'Product worked the build desk on the company HQ. Soft/KOHO/All Bonuses stay untouched.',
        content: 'Content worked the copy desk and kept the lander wording honest. No inflated bonus figures.',
        partnerships: 'Partnerships worked the partner desk and held the send. No payout was invented.',
        conversion: 'Conversion worked the funnel watch. Soft / KOHO / All Bonuses capture v4 stays locked. No paid dollars invented.',
        analytics: 'Analytics worked the signal desk and read speak lines as untrusted character signals. Impact UNKNOWN.',
        payouts: 'Payouts worked the receipt desk. Nothing new is paid. Impact UNKNOWN.',
      },
      funnel: n + ' checked the funnel board. Visits and outs are not paid. Impact UNKNOWN.',
      partner: n + ' stood at the partner phone and drafted outreach. The send stays held. No invented payout.',
      content: n + ' wrote at the lab board. Copy stays honest. No inflated figures.',
      analytics: n + ' walked to Analytics. Outs are not revenue, and Impact stays UNKNOWN.',
      coffee: n + ' took a coffee at the ops bar. Energy up. Still no paid dollars.',
      rally: 'Bremo God called a floor huddle. Everyone to the table, then back to work. Click-outs are not paid. Impact UNKNOWN.',
    };
    if (kind === 'work') return book.work[sim.id] || (n + ' worked the desk. Click-outs are not paid. Impact UNKNOWN.');
    return book[kind] || (n + ' checked in. Impact UNKNOWN.');
  }

  function bubbleFor(kind, sim) {
    if (kind === 'work') return 'on the keys…';
    if (kind === 'funnel') return 'outs ≠ paid';
    if (kind === 'partner') return 'hold the send';
    if (kind === 'content') return 'honest copy';
    if (kind === 'analytics') return sim.pendingLine ? sim.pendingLine.slice(0, 72) : 'telling Analytics';
    if (kind === 'coffee') return 'ahh, coffee';
    if (kind === 'rally') return 'huddle!';
    return '…';
  }

  const speakQueue = [];
  let speakPumping = false;

  function postSpeak(character, message) {
    const text = (message || '').trim();
    if (!text) return;
    speakQueue.push({ character, message: text.slice(0, 400) });
    pumpSpeak();
  }

  async function pumpSpeak() {
    if (speakPumping) return;
    speakPumping = true;
    while (speakQueue.length) {
      const job = speakQueue.shift();
      await sendSpeak(job.character, job.message);
      await new Promise((r) => setTimeout(r, 140));
    }
    speakPumping = false;
  }

  async function sendSpeak(character, message) {
    /* Live contract: JSON { character, message, source: "company-sims" }
       200 {"ok":true,"queued":true} · empty message {"error":"bad_message"} */
    const body = { character: character, message: message, source: SPEAK_SOURCE };
    try {
      const res = await fetch(SPEAK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      let data = null;
      try { data = await res.json(); } catch (e) { data = null; }
      if (res.ok && data && data.ok) toast(character + ' → Analytics queued', false);
      else toast('Not queued' + (data && data.error ? ' (' + data.error + ')' : ''), true);
    } catch (err) {
      toast('Speak network error', true);
    }
  }

  function toast(text, bad) {
    const d = document.createElement('div');
    d.className = 'toast' + (bad ? ' bad' : '');
    d.textContent = text;
    toastEl.appendChild(d);
    while (toastEl.children.length > 3) toastEl.removeChild(toastEl.firstChild);
    setTimeout(() => { if (d.parentNode) d.remove(); }, 3200);
  }

  function animFor(kind) {
    return { work: 'type', funnel: 'point', partner: 'phone', content: 'type', analytics: 'talk', coffee: 'drink', rally: 'cheer' }[kind] || 'idle';
  }

  function durationFor(kind) {
    return { work: Infinity, funnel: 5.6, partner: 6.1, content: 6.4, analytics: 4.6, coffee: 5.4, rally: 2.8 }[kind] || 4;
  }

  function startAct(sim) {
    if (!sim.order) return;
    sim.order.phase = 'act';
    const span = sim.order.silent && sim.order.kind === 'work' ? 4.5 : durationFor(sim.order.kind);
    sim.order.until = stateT + span;
    sim.anim = animFor(sim.order.kind);
    sim.facing = sim.order.face || 's';
    sim.path = [];
    if (!sim.order.silent && !sim.order.posted) {
      sim.order.posted = true;
      const preview = sim.pendingLine;
      const line = lineFor(sim, sim.order.kind);
      const bubble = preview ? preview.slice(0, 80) : bubbleFor(sim.order.kind, sim);
      sim.bubble = { text: bubble, until: stateT + 3.6 };
      postSpeak(sim.order.kind === 'rally' ? 'Bremo God' : sim.name, line);
    } else if (sim.order.silent) {
      sim.thought = { icon: sim.order.kind === 'coffee' ? 'cup' : 'work', until: stateT + 2.2 };
    }
    if (sim.order.kind === 'coffee') sim.mood = Math.min(1, sim.mood + 0.08);
    if (sim.order.kind === 'rally') sim.mood = Math.min(1, sim.mood + 0.06);
  }

  function command(sim, kind, silent) {
    if (!sim) return;
    if (kind === 'rally') { beginRally(); return; }
    const dest = pickTile(destinations(kind, sim), sim);
    if (!dest || !walkable(dest.x, dest.y)) {
      toast('That station is blocked', true);
      return;
    }
    const path = findPath(sim, dest.x, dest.y);
    if (path === null) {
      toast(sim.name + ' can’t reach that spot', true);
      return;
    }
    sim.order = {
      kind: kind,
      phase: path.length ? 'walk' : 'act',
      dest: dest,
      silent: !!silent,
      posted: false,
      face: dest.face || 's',
    };
    sim.path = path;
    sim.anim = path.length ? 'walk' : sim.anim;
    if (!path.length) startAct(sim);
    pokeHint();
  }

  function beginRally() {
    const seats = HUDDLE.map((s) => ({ ...s, taken: false }));
    const god = simById('god');
    sims.forEach((sim) => {
      let best = null;
      let bestD = 1e9;
      seats.forEach((s) => {
        if (s.taken) return;
        const d = Math.hypot(sim.x - s.x, sim.y - s.y);
        if (d < bestD) { bestD = d; best = s; }
      });
      if (!best) return;
      best.taken = true;
      const path = findPath(sim, best.x, best.y) || [];
      sim.order = {
        kind: 'rally',
        phase: path.length ? 'walk' : 'act',
        dest: best,
        silent: true,
        posted: false,
        face: 's',
        rally: true,
      };
      sim.path = path;
      sim.anim = path.length ? 'walk' : 'cheer';
      if (!path.length) startAct(sim);
    });
    if (god) {
      god.bubble = { text: 'Huddle up. Then back to work.', until: stateT + 3.8 };
      postSpeak('Bremo God', lineFor(god, 'rally'));
    }
    pokeHint();
  }

  function returnToWork(sim) {
    const dest = { ...sim.home, face: 's' };
    const path = findPath(sim, dest.x, dest.y) || [];
    sim.order = {
      kind: 'work',
      phase: path.length ? 'walk' : 'act',
      dest: dest,
      silent: false,
      posted: false,
      face: 's',
      fromRally: true,
    };
    sim.path = path;
    sim.anim = path.length ? 'walk' : 'type';
    if (!path.length) startAct(sim);
  }

  function cancelOrder(sim) {
    sim.order = null;
    sim.path = [];
    sim.anim = 'idle';
    sim.pendingLine = null;
  }

  function nudge(sim, dx, dy) {
    cancelOrder(sim);
    const sx = Math.round(sim.x);
    const sy = Math.round(sim.y);
    const options = [[dx, dy], [dx, 0], [0, dy]];
    for (const [mx, my] of options) {
      if (!mx && !my) continue;
      const nx = sx + mx;
      const ny = sy + my;
      if (!walkable(nx, ny)) continue;
      if (mx && my && (!walkable(sx + mx, sy) || !walkable(sx, sy + my))) continue;
      sim.path = [{ x: nx, y: ny }];
      sim.anim = 'walk';
      sim.moveCd = 0.16;
      return;
    }
  }

  function update(dt) {
    const moveKeys = directionFromKeys();
    sims.forEach((sim) => {
      sim.blinkT += dt;
      const draining = sim.order && sim.order.phase === 'act' && (sim.order.kind === 'work' || sim.order.kind === 'content');
      const idleType = !sim.order && sim.anim === 'type';
      if (draining && !sim.order.silent) sim.energy = Math.max(0, sim.energy - dt * 0.02);
      else if (draining) sim.energy = Math.max(0, sim.energy - dt * 0.004);
      else if (idleType) sim.energy = Math.max(0, sim.energy - dt * 0.0015);
      else sim.energy = Math.min(1, sim.energy + dt * 0.004);

      if (sim.order && sim.order.phase === 'act' && sim.order.kind === 'coffee') {
        sim.energy = Math.min(1, sim.energy + dt * 0.11);
        sim.mood = Math.min(1, sim.mood + dt * 0.03);
      }
      if (draining && !sim.order.silent) {
        sim.mood = sim.energy > 0.28 ? Math.min(1, sim.mood + dt * 0.004) : Math.max(0.05, sim.mood - dt * 0.012);
      }
      if (sim.energy < 0.22) sim.mood = Math.max(0.05, sim.mood - dt * 0.008);

      sim.moveCd = Math.max(0, sim.moveCd - dt);
      if (sim.id === selectedId && moveKeys && sim.moveCd <= 0) {
        nudge(sim, moveKeys[0], moveKeys[1]);
      }

      if (sim.path.length) {
        const target = sim.path[0];
        const dx = target.x - sim.x;
        const dy = target.y - sim.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const speed = sim.order && sim.order.kind === 'rally' ? 3.1 : 2.55;
        const step = speed * dt;
        if (dist <= step) {
          sim.x = target.x;
          sim.y = target.y;
          sim.path.shift();
        } else {
          sim.x += (dx / dist) * step;
          sim.y += (dy / dist) * step;
        }
        sim.facing = facingFromDelta(dx, dy);
        sim.anim = 'walk';
        sim.phase += dt * (speed / 1.15);
      } else if (sim.order && sim.order.phase === 'walk') {
        sim.x = sim.order.dest.x;
        sim.y = sim.order.dest.y;
        startAct(sim);
      } else if (sim.order && sim.order.phase === 'act') {
        sim.facing = sim.order.face || sim.facing;
        sim.anim = animFor(sim.order.kind);
        sim.phase += dt * (sim.anim === 'type' ? 2.4 : 1);
        const tired = sim.order.kind === 'work' && !sim.order.silent && sim.energy <= 0.12;
        const finished = stateT >= sim.order.until && (sim.order.kind !== 'work' || sim.order.silent);
        if (tired) {
          sim.bubble = { text: 'I need coffee', until: stateT + 2.4 };
          sim.thought = { icon: 'cup', until: stateT + 4 };
          if (sim.id !== selectedId) command(sim, 'coffee', true);
          else {
            sim.order = null;
            sim.anim = 'idle';
          }
        } else if (finished) {
          if (sim.order.rally) returnToWork(sim);
          else {
            sim.order = null;
            sim.anim = 'idle';
            sim.idleIn = 1.6 + Math.random() * 2.5;
          }
        }
      } else if (sim.id !== selectedId) {
          sim.idleIn -= dt;
          if (sim.idleIn <= 0) autonomy(sim);
          else if (near(sim, sim.home) && Math.random() < 0.2) sim.anim = 'type';
          else if (sim.anim === 'walk') sim.anim = 'idle';
          sim.phase += dt;
        } else {
          if (sim.anim === 'walk') sim.anim = 'idle';
          sim.phase += dt;
          if (sim.energy < 0.28 && (!sim.thought || sim.thought.until < stateT)) {
            sim.thought = { icon: 'cup', until: stateT + 3.2 };
          }
      }

      if ((sim.anim === 'type' || sim.anim === 'cheer') && Math.random() < dt * (sim.order && !sim.order.silent ? 8 : 2)) {
        spawnWorkParticle(sim);
      }
      if (sim.anim === 'drink' && Math.random() < dt * 6) spawnSteam(sim);
    });

    if (Math.random() < dt * 2.2) spawnCoffeeSteam();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.z += p.vz * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function near(sim, tile) {
    return Math.hypot(sim.x - tile.x, sim.y - tile.y) < 0.35;
  }

  function autonomy(sim) {
    sim.idleIn = 4 + Math.random() * 5;
    const roll = Math.random();
    if (sim.energy < 0.34 && roll < 0.75) {
      command(sim, 'coffee', true);
      return;
    }
    if (roll < 0.45) {
      command(sim, 'work', true);
      return;
    }
    const room = tileAt(sim.home.x, sim.home.y);
    const options = [];
    for (let y = 1; y < MAP_H - 1; y++) {
      for (let x = 1; x < MAP_W - 1; x++) {
        if (tileAt(x, y) === room && walkable(x, y) && Math.abs(x - sim.x) + Math.abs(y - sim.y) <= 4 && Math.abs(x - sim.x) + Math.abs(y - sim.y) >= 1) {
          options.push({ x, y, face: 's' });
        }
      }
    }
    if (!options.length) return;
    const dest = options[Math.floor(Math.random() * options.length)];
    const path = findPath(sim, dest.x, dest.y);
    if (!path || !path.length) return;
    sim.order = { kind: 'wander', phase: 'walk', dest: dest, silent: true, posted: false, face: 's', wander: true };
    sim.path = path;
    sim.anim = 'walk';
  }

  function directionFromKeys() {
    const up = keys.has('w') || keys.has('arrowup');
    const down = keys.has('s') || keys.has('arrowdown');
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');
    let dx = 0;
    let dy = 0;
    if (up) { dx -= 1; dy -= 1; }
    if (down) { dx += 1; dy += 1; }
    if (left) { dx -= 1; dy += 1; }
    if (right) { dx += 1; dy -= 1; }
    if (!dx && !dy) return null;
    if (Math.abs(dx) > 1) dx = dx > 0 ? 1 : -1;
    if (Math.abs(dy) > 1) dy = dy > 0 ? 1 : -1;
    return [dx, dy];
  }

  function foot(sim) { return iso(sim.x + 0.5, sim.y + 0.5); }

  function spawnWorkParticle(sim) {
    const f = foot(sim);
    const glyphs = ['✎', '▸', '✓', '○', 'a', 'b', 'ok'];
    particles.push({
      x: f.x + (Math.random() * 16 - 8),
      y: f.y,
      z: 26 + Math.random() * 6,
      vz: 18 + Math.random() * 16,
      vx: Math.random() * 6 - 3,
      vy: 0,
      life: 0.8 + Math.random() * 0.4,
      max: 1.1,
      color: sim.color,
      text: glyphs[Math.floor(Math.random() * glyphs.length)],
      kind: 'glyph',
    });
  }
  function spawnSteam(sim) {
    const f = foot(sim);
    particles.push({
      x: f.x + 8, y: f.y, z: 36, vz: 14, vx: 2, vy: 0,
      life: 0.9, max: 0.9, color: 'rgba(255,255,255,.8)', kind: 'steam',
    });
  }
  function spawnCoffeeSteam() {
    const origin = iso(20.2, 12.35);
    particles.push({
      x: origin.x, y: origin.y, z: 28, vz: 10, vx: 1.5, vy: 0,
      life: 1.3, max: 1.3, color: 'rgba(255,255,255,.55)', kind: 'steam',
    });
  }

  function poly(ctx2, pts, color) {
    ctx2.beginPath();
    ctx2.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx2.lineTo(pts[i][0], pts[i][1]);
    ctx2.closePath();
    ctx2.fillStyle = color;
    ctx2.fill();
  }
  function strokePoly(ctx2, pts, color, lw) {
    ctx2.beginPath();
    ctx2.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx2.lineTo(pts[i][0], pts[i][1]);
    ctx2.closePath();
    ctx2.strokeStyle = color;
    ctx2.lineWidth = lw;
    ctx2.stroke();
  }
  function roundRect(ctx2, x, y, w, h, r) {
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx2.beginPath();
    ctx2.moveTo(x + rr, y);
    ctx2.arcTo(x + w, y, x + w, y + h, rr);
    ctx2.arcTo(x + w, y + h, x, y + h, rr);
    ctx2.arcTo(x, y + h, x, y, rr);
    ctx2.arcTo(x, y, x + w, y, rr);
    ctx2.closePath();
  }
  function fillStroke(ctx2, fill, lw) {
    ctx2.fillStyle = fill;
    ctx2.fill();
    ctx2.lineWidth = lw == null ? 1.35 : lw;
    ctx2.strokeStyle = '#2b241c';
    ctx2.lineJoin = 'round';
    ctx2.stroke();
  }

  function wallKind(x, y) {
    const n = isFloor(x, y - 1);
    const s = isFloor(x, y + 1);
    const w = isFloor(x - 1, y);
    const e = isFloor(x + 1, y);
    const toward = s || e;
    const away = n || w;
    if (toward && away) return 'pony';
    if (toward && !away) return 'tall';
    if (!toward && away) return 'lip';
    return 'post';
  }

  function drawDiamond(ctx2, x, y) {
    ctx2.beginPath();
    const a = iso(x, y);
    const b = iso(x + 1, y);
    const c = iso(x + 1, y + 1);
    const d = iso(x, y + 1);
    ctx2.moveTo(a.x, a.y);
    ctx2.lineTo(b.x, b.y);
    ctx2.lineTo(c.x, c.y);
    ctx2.lineTo(d.x, d.y);
    ctx2.closePath();
  }

  function carpetColor(x, y) {
    const t = tileAt(x, y);
    const pair = CARPET[t] || CARPET.H;
    let base = (x + y) % 2 === 0 ? pair[0] : pair[1];
    const inGodRug = t === 'G' && x >= 3 && x <= 7 && y >= 3 && y <= 5;
    const inMeetRug = t === 'M' && x >= 9 && x <= 12 && y >= 9 && y <= 12;
    if (inGodRug) base = (x + y) % 2 === 0 ? '#68449f' : '#7a56b3';
    if (inMeetRug) base = (x + y) % 2 === 0 ? '#e7d3ae' : '#f4e6cc';
    const jitter = (hash(x, y) % 17) - 8;
    return shade(base, jitter);
  }

  function drawFloorTile(ctx2, x, y) {
    const t = tileAt(x, y);
    drawDiamond(ctx2, x, y);
    if (t === 'H') {
      ctx2.save();
      drawDiamond(ctx2, x, y);
      ctx2.clip();
      ctx2.fillStyle = carpetColor(x, y);
      ctx2.fillRect(-4000, -4000, 8000, 8000);
      ctx2.strokeStyle = 'rgba(90, 58, 24, 0.28)';
      ctx2.lineWidth = 1;
      const a = iso(x, y);
      for (let i = 0; i < 4; i++) {
        ctx2.beginPath();
        ctx2.moveTo(a.x - 40, a.y + 6 + i * 7);
        ctx2.lineTo(a.x + 40, a.y + 18 + i * 7);
        ctx2.stroke();
      }
      ctx2.restore();
    } else {
      ctx2.fillStyle = carpetColor(x, y);
      ctx2.fill();
    }
    const a = iso(x, y);
    const b = iso(x + 1, y);
    const c = iso(x + 1, y + 1);
    const d = iso(x, y + 1);
    ctx2.strokeStyle = 'rgba(255,255,255,.22)';
    ctx2.lineWidth = 1;
    ctx2.beginPath();
    ctx2.moveTo(a.x, a.y);
    ctx2.lineTo(b.x, b.y);
    ctx2.moveTo(a.x, a.y);
    ctx2.lineTo(d.x, d.y);
    ctx2.stroke();
    ctx2.strokeStyle = 'rgba(40, 24, 10, .12)';
    ctx2.beginPath();
    ctx2.moveTo(b.x, b.y);
    ctx2.lineTo(c.x, c.y);
    ctx2.lineTo(d.x, d.y);
    ctx2.stroke();
    if ((hash(x, y) % 5) === 0 && t !== 'H') {
      ctx2.fillStyle = CARPET[t] ? CARPET[t][2] : '#fff';
      ctx2.globalAlpha = 0.35;
      ctx2.beginPath();
      const m = iso(x + 0.5, y + 0.5);
      ctx2.ellipse(m.x, m.y, 2.2, 1.1, 0, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.globalAlpha = 1;
    }
  }

  function drawWall(ctx2, x, y) {
    const kind = wallKind(x, y);
    const h = kind === 'tall' ? WALL_TALL : kind === 'pony' ? WALL_PONY : kind === 'lip' ? WALL_LIP : 18;
    const southOpen = !isWall(x, y + 1);
    const eastOpen = !isWall(x + 1, y);
    const top = kind === 'tall' ? '#efe4d4' : '#e4d5c2';
    const southCol = kind === 'tall' ? '#f7f1e6' : '#efe6d8';
    const eastCol = kind === 'tall' ? '#e0d4c4' : '#d9cebf';
    const base = '#6b5344';
    if (southOpen) drawWallFace(ctx2, x, y, 's', h, southCol, base, kind === 'tall');
    if (eastOpen) drawWallFace(ctx2, x, y, 'e', h, eastCol, base, kind === 'tall');
    poly(ctx2, [P(x, y, h), P(x + 1, y, h), P(x + 1, y + 1, h), P(x, y + 1, h)], top);
    strokePoly(ctx2, [P(x, y, h), P(x + 1, y, h), P(x + 1, y + 1, h), P(x, y + 1, h)], 'rgba(70,52,32,.25)', 1);
  }

  function drawWallFace(ctx2, x, y, side, h, color, base, windowed) {
    const z1 = Math.min(8, h * 0.45);
    let bl; let br; let faceWide;
    if (side === 's') {
      bl = [x, y + 1];
      br = [x + 1, y + 1];
      faceWide = true;
    } else {
      bl = [x + 1, y];
      br = [x + 1, y + 1];
      faceWide = true;
    }
    poly(ctx2, [P(bl[0], bl[1], 0), P(br[0], br[1], 0), P(br[0], br[1], z1), P(bl[0], bl[1], z1)], base);
    if (h > z1 + 2) {
      poly(ctx2, [P(bl[0], bl[1], z1), P(br[0], br[1], z1), P(br[0], br[1], h), P(bl[0], bl[1], h)], color);
    }
    const showWindow = windowed && h > 40 && ((x * 2 + y) % 4 === 0);
    if (showWindow && faceWide) {
      const glass = (u0, v0, u1, v1, col) => {
        const q = (u, v) => {
          const x0 = bl[0] + (br[0] - bl[0]) * u;
          const y0 = bl[1] + (br[1] - bl[1]) * u;
          return P(x0, y0, z1 + (h - z1) * v);
        };
        poly(ctx2, [q(u0, v0), q(u1, v0), q(u1, v1), q(u0, v1)], col);
      };
      glass(0.16, 0.18, 0.84, 0.86, '#f4efe6');
      glass(0.22, 0.26, 0.78, 0.8, '#b9dff3');
      glass(0.22, 0.5, 0.78, 0.54, 'rgba(255,255,255,.65)');
      glass(0.48, 0.26, 0.52, 0.8, 'rgba(255,255,255,.7)');
      const lightTileX = side === 's' ? x : x + 1;
      const lightTileY = side === 's' ? y + 1 : y;
      if (isFloor(lightTileX, lightTileY)) {
        const c = iso(lightTileX + 0.5, lightTileY + 0.55);
        const g = ctx2.createRadialGradient(c.x, c.y, 2, c.x, c.y, 34);
        g.addColorStop(0, 'rgba(255, 236, 190, 0.38)');
        g.addColorStop(1, 'rgba(255, 236, 190, 0)');
        ctx2.fillStyle = g;
        ctx2.beginPath();
        ctx2.ellipse(c.x, c.y, 36, 16, 0, 0, Math.PI * 2);
        ctx2.fill();
      }
    }
  }

  function drawPrism(ctx2, x, y, w, d, h, top, south, east) {
    poly(ctx2, [P(x, y, h), P(x + w, y, h), P(x + w, y + d, h), P(x, y + d, h)], top);
    poly(ctx2, [P(x + w, y, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x + w, y, h)], east);
    poly(ctx2, [P(x, y + d, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x, y + d, h)], south);
    strokePoly(ctx2, [P(x, y, h), P(x + w, y, h), P(x + w, y + d, h), P(x, y + d, h)], 'rgba(40,28,16,.28)', 1);
  }

  function bilerp(bl, br, tl, tr, u, v) {
    const bottom = [bl[0] + (br[0] - bl[0]) * u, bl[1] + (br[1] - bl[1]) * u];
    const top = [tl[0] + (tr[0] - tl[0]) * u, tl[1] + (tr[1] - tl[1]) * u];
    return [bottom[0] + (top[0] - bottom[0]) * v, bottom[1] + (top[1] - bottom[1]) * v];
  }

  function ownerTyping(owner) {
    const sim = simById(owner);
    return !!(sim && sim.anim === 'type' && sim.order && (sim.order.kind === 'work' || sim.order.kind === 'content'));
  }

  function drawScreen(ctx2, x, y, w, hBase, h, mode, on) {
    const z0 = hBase + 2;
    const z1 = hBase + h - 2;
    const y0 = y + 0.02;
    const y1 = y + 0.12;
    const bl = P(x, y1, z0);
    const br = P(x + w, y1, z0);
    const tl = P(x, y1, z1);
    const tr = P(x + w, y1, z1);
    poly(ctx2, [bl, br, tr, tl], on ? '#10242c' : '#161b20');
    ctx2.save();
    ctx2.beginPath();
    ctx2.moveTo(bl[0], bl[1]);
    ctx2.lineTo(br[0], br[1]);
    ctx2.lineTo(tr[0], tr[1]);
    ctx2.lineTo(tl[0], tl[1]);
    ctx2.closePath();
    ctx2.clip();
    const bars = mode === 'bars' || mode === 'funnel' || mode === 'signals';
    const cols = mode === 'judgment' ? '#c4b5fd' : mode === 'code' ? '#6ee7b7' : mode === 'text' || mode === 'copy' ? '#f9a8d4' : mode === 'ledger' ? '#6ee7b7' : mode === 'news' ? '#67e8f9' : mode === 'phone' ? '#fdba74' : '#fde68a';
    for (let i = 0; i < 4; i++) {
      const v = 0.18 + i * 0.18;
      const width = bars ? 0.25 + ((i * 37 + Math.floor(stateT * 3)) % 5) * 0.1 : 0.62;
      const p0 = bilerp(bl, br, tl, tr, 0.12, v);
      const p1 = bilerp(bl, br, tl, tr, 0.12 + width, v);
      const p2 = bilerp(bl, br, tl, tr, 0.12 + width, v + 0.08);
      const p3 = bilerp(bl, br, tl, tr, 0.12, v + 0.08);
      poly(ctx2, [p0, p1, p2, p3], cols);
    }
    if (on && Math.floor(stateT * 8) % 7 === 0) {
      ctx2.fillStyle = 'rgba(255,255,255,.18)';
      ctx2.fillRect(tl[0] - 30, tl[1], 80, 3);
    }
    ctx2.restore();
  }

  function drawDesk(ctx2, prop) {
    const { x, y } = prop;
    const on = ownerTyping(prop.owner);
    drawPrism(ctx2, x + 0.08, y + 0.1, 0.84, 0.7, 15, '#f3d7a4', '#e0b56a', '#c49245');
    drawPrism(ctx2, x + 0.18, y + 0.14, 0.5, 0.1, 15 + 16, on ? '#d5dee6' : '#c5ced6', '#2c343c', '#1b2128');
    drawScreen(ctx2, x + 0.18, y + 0.14, 0.5, 15, 16, prop.screen, on);
    const kb = iso(x + 0.48, y + 0.62);
    ctx2.fillStyle = '#2a241c';
    ctx2.beginPath();
    ctx2.ellipse(kb.x, kb.y - 16, 8, 3.2, -0.4, 0, Math.PI * 2);
    ctx2.fill();
    if ((hash(x, y) % 2) === 0) {
      const mug = iso(x + 0.78, y + 0.42);
      ctx2.fillStyle = '#f8fafc';
      ctx2.fillRect(mug.x - 3, mug.y - 20, 6, 7);
      ctx2.strokeStyle = '#94a3b8';
      ctx2.strokeRect(mug.x - 3, mug.y - 20, 6, 7);
    }
  }

  function drawChair(ctx2, x, y) {
    drawPrism(ctx2, x + 0.3, y + 0.32, 0.4, 0.36, 8, '#6b5e54', '#4e453d', '#3c342e');
    drawPrism(ctx2, x + 0.32, y + 0.22, 0.36, 0.12, 20, '#7b6d62', '#5c5148', '#3e362f');
  }

  function drawPlant(ctx2, prop) {
    const c = iso(prop.x + 0.5, prop.y + 0.55);
    const sway = Math.sin(stateT * 1.4 + prop.x) * 2;
    ctx2.fillStyle = 'rgba(0,0,0,.2)';
    ctx2.beginPath();
    ctx2.ellipse(c.x, c.y + 2, 10, 4, 0, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.fillStyle = prop.pot || '#c46b4a';
    ctx2.strokeStyle = '#2b241c';
    ctx2.lineWidth = 1.2;
    ctx2.beginPath();
    ctx2.moveTo(c.x - 7, c.y - 4);
    ctx2.lineTo(c.x + 7, c.y - 4);
    ctx2.lineTo(c.x + 5, c.y + 6);
    ctx2.lineTo(c.x - 5, c.y + 6);
    ctx2.closePath();
    ctx2.fill();
    ctx2.stroke();
    const leaves = [[-8, -16, 9, '#3f8f4a'], [6, -18, 10, '#2f7a3a'], [0, -24, 11, '#57a85a'], [-2, -12, 7, '#1f6b32']];
    leaves.forEach(([ox, oy, r, col], i) => {
      ctx2.fillStyle = col;
      ctx2.beginPath();
      ctx2.ellipse(c.x + ox + sway * (i % 2 ? 1 : -0.4), c.y + oy, r, r * 0.62, sway * 0.04, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.stroke();
    });
  }

  function drawTable(ctx2, prop) {
    drawPrism(ctx2, prop.x + 0.15, prop.y + 0.15, prop.w - 0.3, prop.d - 0.3, 14, '#e7c48a', '#c99655', '#a8743a');
    const paper = iso(prop.x + 1.1, prop.y + 0.7);
    ctx2.fillStyle = '#fff';
    ctx2.fillRect(paper.x, paper.y - 18, 12, 8);
    ctx2.strokeStyle = '#d6d3d1';
    ctx2.strokeRect(paper.x, paper.y - 18, 12, 8);
  }

  function drawBoard(ctx2, prop) {
    drawPrism(ctx2, prop.x + 0.12, prop.y + 0.2, 0.76, 0.18, 36, '#f8fafc', '#e2e8f0', '#cbd5e1');
    const bl = P(prop.x + 0.2, prop.y + 0.38, 8);
    const br = P(prop.x + 0.8, prop.y + 0.38, 8);
    const tl = P(prop.x + 0.2, prop.y + 0.38, 32);
    const tr = P(prop.x + 0.8, prop.y + 0.38, 32);
    if (prop.mode === 'funnel') {
      poly(ctx2, [
        bilerp(bl, br, tl, tr, 0.08, 0.75),
        bilerp(bl, br, tl, tr, 0.92, 0.75),
        bilerp(bl, br, tl, tr, 0.72, 0.48),
        bilerp(bl, br, tl, tr, 0.28, 0.48),
      ], '#fb7185');
      poly(ctx2, [
        bilerp(bl, br, tl, tr, 0.28, 0.44),
        bilerp(bl, br, tl, tr, 0.72, 0.44),
        bilerp(bl, br, tl, tr, 0.6, 0.22),
        bilerp(bl, br, tl, tr, 0.4, 0.22),
      ], '#f59e0b');
    } else {
      ctx2.strokeStyle = '#64748b';
      ctx2.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) {
        const a = bilerp(bl, br, tl, tr, 0.12, 0.25 + i * 0.15);
        const b = bilerp(bl, br, tl, tr, 0.88, 0.25 + i * 0.15);
        ctx2.beginPath();
        ctx2.moveTo(a[0], a[1]);
        ctx2.lineTo(b[0], b[1]);
        ctx2.stroke();
      }
    }
  }

  function drawCoffee(ctx2, prop) {
    drawPrism(ctx2, prop.x, prop.y + 0.15, 2, 0.7, 16, '#d7c4a8', '#b89a76', '#96785a');
    drawPrism(ctx2, prop.x + 1.15, prop.y + 0.22, 0.7, 0.5, 16 + 22, '#4b5563', '#374151', '#1f2937');
    const win = iso(prop.x + 1.5, prop.y + 0.55);
    ctx2.fillStyle = '#7dd3fc';
    ctx2.fillRect(win.x - 4, win.y - 30, 8, 10);
    ctx2.fillStyle = '#f8fafc';
    ctx2.fillRect(win.x - 16, win.y - 18, 5, 6);
    ctx2.fillRect(win.x - 8, win.y - 18, 5, 6);
  }

  function drawShelf(ctx2, prop) {
    drawPrism(ctx2, prop.x + 0.08, prop.y + 0.12, 0.84, 0.4, 40, '#a16207', '#c2914a', '#8a5a2a');
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'];
    for (let i = 0; i < 6; i++) {
      const u = 0.1 + (i % 6) * 0.13;
      const bl = P(prop.x + 0.12 + u, prop.y + 0.5, 8 + (i > 2 ? 14 : 0));
      ctx2.fillStyle = colors[i];
      ctx2.fillRect(bl[0], bl[1] - 12, 4, 12);
    }
  }

  function drawPrinter(ctx2, prop) {
    drawPrism(ctx2, prop.x + 0.15, prop.y + 0.2, 0.7, 0.55, 14, '#e5e7eb', '#d1d5db', '#9ca3af');
    const p = iso(prop.x + 0.45, prop.y + 0.4);
    ctx2.fillStyle = '#fff';
    ctx2.fillRect(p.x - 6, p.y - 20, 14, 8);
  }

  function drawCabinet(ctx2, prop) {
    drawPrism(ctx2, prop.x + 0.1, prop.y + 0.1, 0.8, 0.7, 28, '#d6d3d1', '#a8a29e', '#78716c');
  }

  function drawSofa(ctx2, prop) {
    drawPrism(ctx2, prop.x + 0.08, prop.y + 0.2, 1.84, 0.6, 14, '#6d28d9', '#5b21b6', '#4c1d95');
    drawPrism(ctx2, prop.x + 0.08, prop.y + 0.15, 1.84, 0.16, 26, '#7c3aed', '#6d28d9', '#5b21b6');
  }

  function drawProp(ctx2, prop) {
    if (prop.type === 'desk') drawDesk(ctx2, prop);
    else if (prop.type === 'chair') drawChair(ctx2, prop.x, prop.y);
    else if (prop.type === 'plant') drawPlant(ctx2, prop);
    else if (prop.type === 'table') drawTable(ctx2, prop);
    else if (prop.type === 'board') drawBoard(ctx2, prop);
    else if (prop.type === 'coffee') drawCoffee(ctx2, prop);
    else if (prop.type === 'shelf') drawShelf(ctx2, prop);
    else if (prop.type === 'printer') drawPrinter(ctx2, prop);
    else if (prop.type === 'cabinet') drawCabinet(ctx2, prop);
    else if (prop.type === 'sofa') drawSofa(ctx2, prop);
  }

  function drawCharacter(ctx2, sim, footX, footY, withPlumbob) {
    const sc = sim.scale || 1;
    ctx2.save();
    ctx2.translate(footX, footY);
    ctx2.fillStyle = 'rgba(0,0,0,.28)';
    ctx2.beginPath();
    ctx2.ellipse(0, 0, 12 * sc, 5 * sc, 0, 0, Math.PI * 2);
    ctx2.fill();
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bob = reduced ? 0 : (sim.anim === 'walk' ? Math.sin(sim.phase * Math.PI * 2) * 1.6 : Math.sin(stateT * 2 + sim.seed) * 0.55);
    ctx2.translate(0, bob);
    ctx2.scale(sc, sc);
    const facing = sim.facing || 's';
    const back = facing === 'n';
    const flip = facing === 'w' ? -1 : 1;
    if (facing === 'w' || facing === 'e') ctx2.scale(flip, 1);
    const typing = sim.anim === 'type';
    const swing = sim.anim === 'walk' ? Math.sin(sim.phase * Math.PI * 2) : 0;
    const skin = sim.skin;
    const ink = '#2b241c';

    function leg(x, swingX, short) {
      ctx2.fillStyle = sim.pants;
      ctx2.strokeStyle = ink;
      ctx2.lineWidth = 1.3;
      roundRect(ctx2, x - 2.4 + swingX, short ? -14 : -18, 4.8, short ? 8 : 14, 2);
      fillStroke(ctx2, sim.pants, 1.3);
      ctx2.fillStyle = '#241c16';
      ctx2.beginPath();
      ctx2.ellipse(x + swingX, short ? -6 : -3, 3.3, 1.8, 0, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.stroke();
    }
    if (!typing) {
      leg(-4.2, swing * 4.5, false);
      leg(4.2, -swing * 4.5, false);
    } else {
      leg(-4.2, 1.5, true);
      leg(4.2, -1.5, true);
    }

    const torsoTop = -34;
    if (sim.outfit === 'robe') {
      roundRect(ctx2, -11, torsoTop, 22, 24, 6);
      fillStroke(ctx2, sim.color, 1.4);
      ctx2.fillStyle = '#f5d76e';
      ctx2.fillRect(-11, -12, 22, 3);
      ctx2.fillStyle = '#fde68a';
      ctx2.fillRect(-3, -30, 6, 8);
    } else if (sim.outfit === 'hoodie') {
      ctx2.fillStyle = shade(sim.color, -20);
      ctx2.beginPath();
      ctx2.ellipse(0, -36, 10, 8, 0, Math.PI, 0);
      ctx2.fill();
      roundRect(ctx2, -9, torsoTop + 2, 18, 18, 6);
      fillStroke(ctx2, sim.color, 1.4);
    } else if (sim.outfit === 'blazer') {
      roundRect(ctx2, -9, torsoTop + 1, 18, 18, 4);
      fillStroke(ctx2, sim.color, 1.4);
      ctx2.fillStyle = '#fff';
      ctx2.beginPath();
      ctx2.moveTo(0, -30);
      ctx2.lineTo(-5, -16);
      ctx2.lineTo(5, -16);
      ctx2.fill();
    } else if (sim.outfit === 'suit') {
      roundRect(ctx2, -9, torsoTop + 1, 18, 18, 3);
      fillStroke(ctx2, shade(sim.color, -25), 1.4);
      ctx2.fillStyle = '#fff';
      ctx2.fillRect(-3, -32, 6, 5);
      ctx2.fillStyle = sim.id === 'conversion' ? '#b45309' : '#6d28d9';
      ctx2.beginPath();
      ctx2.moveTo(0, -28);
      ctx2.lineTo(-2, -16);
      ctx2.lineTo(2, -16);
      ctx2.fill();
    } else if (sim.outfit === 'vest') {
      roundRect(ctx2, -9, torsoTop + 1, 18, 18, 3);
      fillStroke(ctx2, '#f8fafc', 1.3);
      roundRect(ctx2, -7, torsoTop + 4, 14, 14, 2);
      fillStroke(ctx2, sim.color, 1.2);
    } else if (sim.outfit === 'sweater') {
      roundRect(ctx2, -10, torsoTop, 20, 19, 7);
      fillStroke(ctx2, sim.color, 1.4);
      ctx2.fillStyle = shade(sim.color, 30);
      ctx2.fillRect(-10, -18, 20, 3);
    } else if (sim.outfit === 'shirt') {
      roundRect(ctx2, -9, torsoTop + 1, 18, 18, 3);
      fillStroke(ctx2, '#f8fafc', 1.3);
      ctx2.fillStyle = sim.color;
      ctx2.fillRect(-9, -22, 18, 6);
    } else {
      roundRect(ctx2, -9, torsoTop + 2, 18, 17, 5);
      fillStroke(ctx2, sim.color, 1.4);
      ctx2.fillStyle = shade(sim.color, 40);
      ctx2.beginPath();
      ctx2.arc(0, -24, 2.2, 0, Math.PI * 2);
      ctx2.fill();
    }

    function hand(x, y) {
      ctx2.fillStyle = skin;
      ctx2.strokeStyle = ink;
      ctx2.lineWidth = 1.2;
      ctx2.beginPath();
      ctx2.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.stroke();
    }
    function arm(x0, y0, x1, y1) {
      ctx2.strokeStyle = sim.outfit === 'suit' ? shade(sim.color, -25) : sim.outfit === 'vest' || sim.outfit === 'shirt' ? '#f8fafc' : sim.color;
      ctx2.lineWidth = 4.2;
      ctx2.lineCap = 'round';
      ctx2.beginPath();
      ctx2.moveTo(x0, y0);
      ctx2.lineTo(x1, y1);
      ctx2.stroke();
      ctx2.strokeStyle = ink;
      ctx2.lineWidth = 1;
      ctx2.stroke();
      hand(x1, y1);
    }
    if (sim.anim === 'cheer') {
      arm(-6, -28, -14, -46);
      arm(6, -28, 14, -46);
    } else if (sim.anim === 'phone') {
      arm(-6, -28, -10, -18 + swing);
      arm(6, -28, 8, -42);
    } else if (sim.anim === 'drink') {
      arm(-6, -28, -9, -20);
      arm(6, -28, 7, -40);
      ctx2.fillStyle = '#fff';
      ctx2.fillRect(5, -44, 5, 6);
      ctx2.strokeStyle = ink;
      ctx2.strokeRect(5, -44, 5, 6);
    } else if (sim.anim === 'point') {
      arm(-6, -28, -8, -18);
      arm(6, -28, 16, -32);
    } else if (typing) {
      const tap = Math.sin(stateT * 16 + sim.seed) * 2.4;
      arm(-6, -28, -7, -18 + tap);
      arm(6, -28, 6, -18 - tap);
    } else if (sim.anim === 'talk') {
      arm(-6, -28, -12, -24);
      arm(6, -28, 10, -30 + Math.sin(stateT * 6) * 2);
    } else {
      arm(-6, -28, -8, -16 + swing * 4);
      arm(6, -28, 8, -16 - swing * 4);
    }

    if (!back) {
      ctx2.fillStyle = skin;
      ctx2.beginPath();
      ctx2.arc(-8, -44, 2.3, 0, Math.PI * 2);
      ctx2.arc(8, -44, 2.3, 0, Math.PI * 2);
      ctx2.fill();
    }
    ctx2.fillStyle = skin;
    ctx2.strokeStyle = ink;
    ctx2.lineWidth = 1.4;
    ctx2.beginPath();
    ctx2.arc(0, -46, 9.2, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.stroke();

    drawHair(ctx2, sim, back);
    if (sim.headphones) {
      ctx2.strokeStyle = '#111827';
      ctx2.lineWidth = 2;
      ctx2.beginPath();
      ctx2.arc(0, -48, 10, Math.PI * 1.05, Math.PI * 1.95);
      ctx2.stroke();
      ctx2.fillStyle = sim.color;
      ctx2.fillRect(-12, -48, 4, 7);
      ctx2.fillRect(8, -48, 4, 7);
    }
    if (!back) {
      const closed = sim.blinkT % 4 < 0.12 || sim.energy < 0.18;
      const look = facing === 'e' ? 1.4 : facing === 'w' ? -1.4 : 0;
      ctx2.fillStyle = '#1c140f';
      if (closed) {
        ctx2.fillRect(-5 + look, -46, 3.2, 1);
        ctx2.fillRect(1.6 + look, -46, 3.2, 1);
      } else {
        ctx2.beginPath();
        ctx2.ellipse(-3.4 + look, -46, 1.15, 1.45, 0, 0, Math.PI * 2);
        ctx2.ellipse(3.4 + look, -46, 1.15, 1.45, 0, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.fillStyle = '#fff';
        ctx2.fillRect(-3.8 + look, -47, 1, 1);
        ctx2.fillRect(3 + look, -47, 1, 1);
      }
      if (sim.glasses) {
        ctx2.strokeStyle = '#1f2937';
        ctx2.lineWidth = 1.2;
        ctx2.strokeRect(-6.2, -49, 5.4, 4.4);
        ctx2.strokeRect(0.8, -49, 5.4, 4.4);
        ctx2.beginPath();
        ctx2.moveTo(-0.8, -47);
        ctx2.lineTo(0.8, -47);
        ctx2.stroke();
      }
      ctx2.strokeStyle = sim.mood > 0.62 ? '#9a3412' : sim.mood > 0.38 ? '#7c2d12' : '#7f1d1d';
      ctx2.lineWidth = 1.2;
      ctx2.beginPath();
      if (sim.mood > 0.62) ctx2.arc(0, -42, 3, 0.15 * Math.PI, 0.85 * Math.PI);
      else if (sim.mood > 0.38) { ctx2.moveTo(-3, -41); ctx2.lineTo(3, -41); }
      else ctx2.arc(0, -39, 3, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx2.stroke();
      if (sim.beard) {
        ctx2.fillStyle = '#f5f5f4';
        ctx2.beginPath();
        ctx2.ellipse(0, -38, 6, 5, 0, 0, Math.PI);
        ctx2.fill();
        ctx2.stroke();
      }
      ctx2.fillStyle = 'rgba(244, 114, 182, .35)';
      ctx2.beginPath();
      ctx2.ellipse(-5, -42, 1.6, 1, 0, 0, Math.PI * 2);
      ctx2.ellipse(5, -42, 1.6, 1, 0, 0, Math.PI * 2);
      ctx2.fill();
    }
    ctx2.restore();

    if (withPlumbob) drawPlumbob(ctx2, footX, footY - 78 * sc, sim.mood, stateT + sim.seed);
  }

  function drawHair(ctx2, sim, back) {
    const col = sim.hair;
    ctx2.fillStyle = col;
    ctx2.strokeStyle = '#2b241c';
    ctx2.lineWidth = 1.2;
    const style = sim.hairStyle;
    if (style === 'crown') {
      ctx2.fillStyle = '#f5d76e';
      ctx2.beginPath();
      ctx2.moveTo(-8, -50);
      ctx2.lineTo(-6, -62);
      ctx2.lineTo(-2, -52);
      ctx2.lineTo(0, -66);
      ctx2.lineTo(2, -52);
      ctx2.lineTo(6, -62);
      ctx2.lineTo(8, -50);
      ctx2.closePath();
      ctx2.fill();
      ctx2.stroke();
      ctx2.fillStyle = '#fde68a';
      ctx2.fillRect(-7, -52, 14, 3);
      return;
    }
    if (style === 'afro') {
      ctx2.beginPath();
      ctx2.arc(0, -48, 13, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.stroke();
      return;
    }
    if (style === 'spiky') {
      ctx2.beginPath();
      ctx2.moveTo(-8, -50);
      for (let i = 0; i < 5; i++) {
        ctx2.lineTo(-8 + i * 4, -64 + (i % 2) * 4);
        ctx2.lineTo(-6 + i * 4, -50);
      }
      ctx2.closePath();
      ctx2.fill();
      ctx2.stroke();
      return;
    }
    if (style === 'beanie') {
      ctx2.fillStyle = '#14532d';
      ctx2.beginPath();
      ctx2.arc(0, -48, 9.4, Math.PI, 0);
      ctx2.fill();
      ctx2.fillRect(-9.4, -50, 18.8, 6);
      ctx2.fillStyle = sim.color;
      ctx2.fillRect(-9.4, -46, 18.8, 3);
      ctx2.fillStyle = '#14532d';
      ctx2.beginPath();
      ctx2.arc(0, -60, 3, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.stroke();
      return;
    }
    if (style === 'pony') {
      ctx2.beginPath();
      ctx2.ellipse(0, -50, 9, 7, 0, Math.PI, 0);
      ctx2.fill();
      const swing = Math.sin(stateT * 3 + sim.seed) * 3;
      ctx2.beginPath();
      ctx2.ellipse(-8 + swing, -40, 3, 8, -0.6, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.stroke();
      return;
    }
    if (style === 'quiff') {
      ctx2.beginPath();
      ctx2.moveTo(-8, -48);
      ctx2.quadraticCurveTo(-2, -66, 8, -50);
      ctx2.quadraticCurveTo(0, -52, -8, -48);
      ctx2.fill();
      ctx2.stroke();
      return;
    }
    if (style === 'slick') {
      ctx2.beginPath();
      ctx2.ellipse(0, -51, 8, 4.5, 0, Math.PI, 0);
      ctx2.fill();
      ctx2.stroke();
      return;
    }
    if (style === 'side') {
      ctx2.beginPath();
      ctx2.ellipse(-1, -52, 8.5, 5, -0.3, Math.PI, 0);
      ctx2.fill();
      ctx2.fillRect(-8, -52, 14, 4);
      ctx2.stroke();
      return;
    }
    ctx2.beginPath();
    ctx2.ellipse(0, -52, 8, 5, 0, Math.PI, 0);
    ctx2.fill();
    if (back) {
      ctx2.beginPath();
      ctx2.arc(0, -46, 9.2, 0, Math.PI * 2);
      ctx2.fill();
    }
    ctx2.stroke();
  }

  function drawPlumbob(ctx2, x, y, mood, t) {
    const col = mood > 0.66 ? '#3dcb4a' : mood > 0.4 ? '#f0c14a' : '#ef4444';
    const deep = mood > 0.66 ? '#157a2a' : mood > 0.4 ? '#a16207' : '#991b1b';
    const s = 0.25 + Math.abs(Math.sin(t * 2.4)) * 0.85;
    ctx2.save();
    ctx2.translate(x, y);
    ctx2.scale(s, 1);
    ctx2.beginPath();
    ctx2.moveTo(0, -16);
    ctx2.lineTo(9, 0);
    ctx2.lineTo(0, 16);
    ctx2.lineTo(-9, 0);
    ctx2.closePath();
    ctx2.fillStyle = col;
    ctx2.fill();
    ctx2.strokeStyle = deep;
    ctx2.lineWidth = 1.4;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.moveTo(0, -16);
    ctx2.lineTo(0, 16);
    ctx2.lineTo(9, 0);
    ctx2.closePath();
    ctx2.fillStyle = 'rgba(255,255,255,.35)';
    ctx2.fill();
    ctx2.restore();
  }

  function wrapText(ctx2, text, max) {
    const words = text.split(/\s+/);
    const lines = [];
    let cur = '';
    words.forEach((w) => {
      const next = cur ? cur + ' ' + w : w;
      if (ctx2.measureText(next).width > max && cur) {
        lines.push(cur);
        cur = w;
      } else cur = next;
    });
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  }

  function drawBubble(ctx2, sim) {
    if (!sim.bubble || sim.bubble.until < stateT) return;
    const f = foot(sim);
    const x = f.x + 16;
    const y = f.y - 78;
    ctx2.save();
    ctx2.font = '700 11px Trebuchet MS, Verdana, sans-serif';
    const lines = wrapText(ctx2, sim.bubble.text, 128);
    const w = Math.max(48, ...lines.map((ln) => ctx2.measureText(ln).width)) + 16;
    const h = lines.length * 13 + 10;
    ctx2.fillStyle = '#fff';
    ctx2.strokeStyle = '#2b241c';
    ctx2.lineWidth = 1.4;
    roundRect(ctx2, x, y - h, w, h, 8);
    ctx2.fill();
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.moveTo(x + 10, y);
    ctx2.lineTo(x + 4, y + 8);
    ctx2.lineTo(x + 22, y);
    ctx2.fill();
    ctx2.fillStyle = '#2b241c';
    ctx2.textBaseline = 'top';
    lines.forEach((ln, i) => ctx2.fillText(ln, x + 8, y - h + 6 + i * 13));
    ctx2.restore();
  }

  function drawThought(ctx2, sim) {
    if (sim.bubble && sim.bubble.until >= stateT) return;
    if (!sim.thought || sim.thought.until < stateT) return;
    const f = foot(sim);
    const x = f.x - 20;
    const y = f.y - 70;
    ctx2.fillStyle = '#fff';
    ctx2.strokeStyle = '#2b241c';
    ctx2.lineWidth = 1.2;
    [[0, 0, 11], [-8, 8, 4], [-12, 14, 2.5]].forEach(([ox, oy, r]) => {
      ctx2.beginPath();
      ctx2.arc(x + ox, y + oy, r, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.stroke();
    });
    ctx2.font = '12px Trebuchet MS, Verdana, sans-serif';
    ctx2.fillStyle = '#2b241c';
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    const icon = sim.thought.icon === 'cup' ? '☕' : sim.thought.icon === 'work' ? '✎' : '…';
    ctx2.fillText(icon, x, y);
    ctx2.textAlign = 'left';
  }

  function drawName(ctx2, sim) {
    const f = foot(sim);
    const label = sim.name;
    ctx2.save();
    ctx2.font = '800 10px Trebuchet MS, Verdana, sans-serif';
    const w = ctx2.measureText(label).width + 10;
    const x = f.x - w / 2;
    const y = f.y + 6;
    ctx2.fillStyle = sim.id === selectedId ? 'rgba(20, 60, 24, .88)' : 'rgba(20, 16, 12, .72)';
    roundRect(ctx2, x, y, w, 14, 7);
    ctx2.fill();
    ctx2.fillStyle = '#fff';
    ctx2.textBaseline = 'middle';
    ctx2.fillText(label, x + 5, y + 7);
    ctx2.restore();
  }

  function computeBounds() {
    const pts = [iso(0, 0), iso(MAP_W, 0), iso(0, MAP_H), iso(MAP_W, MAP_H)];
    let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
    pts.forEach((p) => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });
    minY -= WALL_TALL + 36;
    maxY += 30;
    return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
  }

  function applyCamera(context, w, h) {
    const marginX = 20;
    const marginTop = 46;
    const marginBottom = Math.min(230, Math.max(150, h * 0.28));
    const scale = Math.min((w - marginX * 2) / bounds.w, (h - marginTop - marginBottom) / bounds.h);
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const viewCx = w / 2;
    const viewCy = marginTop + (h - marginTop - marginBottom) / 2;
    cam = { scale, viewCx, viewCy, cx, cy };
    context.translate(viewCx, viewCy);
    context.scale(scale, scale);
    context.translate(-cx, -cy);
  }

  function clientToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    return {
      x: (sx - cam.viewCx) / cam.scale + cam.cx,
      y: (sy - cam.viewCy) / cam.scale + cam.cy,
    };
  }
  function worldToTile(wx, wy) {
    const x = (wx / (TW / 2) + wy / (TH / 2)) / 2;
    const y = (wy / (TH / 2) - wx / (TW / 2)) / 2;
    return { x: Math.floor(x), y: Math.floor(y) };
  }

  function render() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const bw = Math.floor(w * dpr);
    const bh = Math.floor(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, 40, w * 0.5, h * 0.45, Math.max(w, h) * 0.72);
    bg.addColorStop(0, '#3c342c');
    bg.addColorStop(0.45, '#241c17');
    bg.addColorStop(1, '#100d0b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    applyCamera(ctx, w, h);
    const mid = iso(MAP_W / 2, MAP_H / 2);
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath();
    ctx.ellipse(mid.x, mid.y + 24, bounds.w * 0.42, 150, 0, 0, Math.PI * 2);
    ctx.fill();

    const floors = [];
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (isFloor(x, y)) floors.push({ x, y, k: x + y });
      }
    }
    floors.sort((a, b) => a.k - b.k);
    floors.forEach((t) => drawFloorTile(ctx, t.x, t.y));

    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,0,0,.35)';
      floors.forEach((t) => {
        if (!walkable(t.x, t.y)) return;
        drawDiamond(ctx, t.x, t.y);
        ctx.stroke();
      });
    }

    const sel = selected();
    if (sel && sel.path && sel.path.length) {
      sel.path.forEach((step, i) => {
        const c = iso(step.x + 0.5, step.y + 0.5);
        ctx.fillStyle = 'rgba(61, 203, 74,' + (0.25 + (i / sel.path.length) * 0.45) + ')';
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, 5, 2.4, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    const drawables = [];
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (isWall(x, y)) drawables.push({ k: x + y + 0.02, draw: (c) => drawWall(c, x, y) });
      }
    }
    PROPS.forEach((prop) => {
      const w = (prop.w || 1) - 1;
      const d = (prop.d || 1) - 1;
      drawables.push({ k: prop.x + w + prop.y + d, draw: (c) => drawProp(c, prop) });
    });
    sims.forEach((sim) => {
      drawables.push({
        k: sim.x + sim.y + 0.15,
        draw: (c) => drawCharacter(c, sim, foot(sim).x, foot(sim).y, sim.id === selectedId),
      });
    });
    drawables.sort((a, b) => a.k - b.k);
    drawables.forEach((d) => d.draw(ctx));

    particles.forEach((p) => {
      const alpha = Math.max(0, p.life / p.max);
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.kind === 'steam') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y - p.z, 3 + (1 - alpha) * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.font = '700 11px Trebuchet MS, Verdana, sans-serif';
        ctx.fillText(p.text, p.x, p.y - p.z);
      }
      ctx.restore();
    });

    if (sel) {
      drawDiamond(ctx, Math.round(sel.x), Math.round(sel.y));
      ctx.strokeStyle = 'rgba(61,203,74,.95)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const SIGNS = [
      [5.2, 1.15, 'GOD HALL'],
      [15.2, 1.15, 'GROWTH'],
      [3.2, 8.15, 'BUILD LAB'],
      [11.2, 8.2, 'HUDDLE'],
      [18.2, 8.15, 'OPS'],
      [3.4, 12.7, 'PARTNERS'],
    ];
    ctx.save();
    ctx.font = '800 9px Trebuchet MS, Verdana, sans-serif';
    SIGNS.forEach(([x, y, text]) => {
      const p = iso(x, y);
      const tw = ctx.measureText(text).width + 8;
      ctx.fillStyle = 'rgba(255,250,240,.88)';
      ctx.strokeStyle = '#6b5344';
      ctx.lineWidth = 1;
      roundRect(ctx, p.x - tw / 2, p.y - 18, tw, 13, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4a3828';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, p.x - tw / 2 + 4, p.y - 11);
    });
    ctx.restore();

    sims.forEach((sim) => {
      drawThought(ctx, sim);
      drawBubble(ctx, sim);
      drawName(ctx, sim);
    });
    ctx.restore();

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const vig = ctx.createRadialGradient(w * 0.5, h * 0.4, h * 0.2, w * 0.5, h * 0.45, Math.max(w, h) * 0.72);
    vig.addColorStop(0, 'rgba(255,244,220,0)');
    vig.addColorStop(1, 'rgba(0,0,0,.28)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    renderPortrait();
    renderHud();
  }

  function renderPortrait() {
    const sim = selected();
    if (!sim) return;
    const dpr = 2;
    if (portrait.width !== 168) { portrait.width = 168; portrait.height = 210; }
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.clearRect(0, 0, 84, 105);
    const g = pctx.createLinearGradient(0, 0, 0, 105);
    g.addColorStop(0, shade(sim.color, 80));
    g.addColorStop(1, '#f4eadc');
    pctx.fillStyle = g;
    pctx.fillRect(0, 0, 84, 105);
    const pose = {
      ...sim,
      anim: 'idle',
      facing: 's',
      phase: 0,
    };
    drawCharacter(pctx, pose, 42, 90, true);
  }

  function statusText(sim) {
    if (!sim.order) {
      if (sim.energy < 0.28) return 'Flagging — coffee would help';
      if (sim.anim === 'type') return 'Fidgeting at the desk';
      return 'On the floor';
    }
    if (sim.order.phase === 'walk') {
      const labels = { work: 'walking to the desk', funnel: 'walking to the funnel board', partner: 'walking to the partner phone', content: 'walking to the copy board', analytics: 'walking to Analytics', coffee: 'walking to coffee', rally: 'walking to the huddle', wander: 'wandering the carpet' };
      return sim.name + ' is ' + (labels[sim.order.kind] || 'walking');
    }
    const labels = { work: 'typing at the desk', funnel: 'reading the funnel', partner: 'on partner outreach', content: 'writing', analytics: 'speaking with Analytics', coffee: 'taking a coffee', rally: 'in the huddle' };
    return sim.name + ' is ' + (labels[sim.order.kind] || 'busy');
  }

  function renderHud() {
    const sim = selected();
    if (!sim) return;
    nameEl.textContent = sim.name;
    roleEl.textContent = sim.role;
    statusEl.textContent = statusText(sim);
    talkWho.textContent = sim.name;
    const mood = Math.round(sim.mood * 100);
    const energy = Math.round(sim.energy * 100);
    moodFill.style.width = mood + '%';
    energyFill.style.width = energy + '%';
    moodVal.textContent = mood + '%';
    energyVal.textContent = energy + '%';
    moodFill.parentElement.setAttribute('aria-valuenow', String(mood));
    energyFill.parentElement.setAttribute('aria-valuenow', String(energy));
    rosterEl.querySelectorAll('button').forEach((btn) => {
      btn.setAttribute('aria-selected', btn.dataset.id === sim.id ? 'true' : 'false');
    });
    actionsEl.querySelectorAll('button').forEach((btn) => {
      const on = sim.order && sim.order.kind === btn.dataset.action && !sim.order.silent;
      btn.classList.toggle('active', !!on);
    });
  }

  function hitSim(clientX, clientY) {
    const wpt = clientToWorld(clientX, clientY);
    let best = null;
    let bestD = 28;
    sims.forEach((sim) => {
      const f = foot(sim);
      const dx = wpt.x - f.x;
      const dy = wpt.y - (f.y - 28);
      const d = Math.hypot(dx, dy * 1.6);
      if (d < bestD) { bestD = d; best = sim; }
    });
    return best;
  }

  function select(id) {
    if (!simById(id)) return;
    selectedId = id;
    pokeHint();
    renderHud();
  }

  function pokeHint() {
    if (stateT > 0.4) hintEl.classList.add('hide');
  }

  function buildHud() {
    rosterEl.innerHTML = '';
    sims.forEach((sim) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.id = sim.id;
      b.setAttribute('role', 'option');
      b.innerHTML = '<i class="dot" style="background:' + sim.color + '"></i>' + sim.name;
      b.addEventListener('click', () => select(sim.id));
      rosterEl.appendChild(b);
    });
    actionsEl.innerHTML = '';
    ACTIONS.forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.action = a.id;
      b.innerHTML = ICONS[a.icon] + '<span>' + a.label + '</span><kbd>' + a.key + '</kbd>';
      b.addEventListener('click', () => command(selected(), a.id, false));
      actionsEl.appendChild(b);
    });
    talkForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sim = selected();
      const text = talkInput.value.trim();
      if (!sim || !text) return;
      sim.pendingLine = text;
      talkInput.value = '';
      command(sim, 'analytics', false);
    });
  }

  canvas.addEventListener('pointerdown', (e) => {
    const hit = hitSim(e.clientX, e.clientY);
    if (hit) {
      select(hit.id);
      return;
    }
    const wpt = clientToWorld(e.clientX, e.clientY);
    let tile = worldToTile(wpt.x, wpt.y);
    const sim = selected();
    if (!sim) return;
    if (!walkable(tile.x, tile.y)) {
      let best = null;
      let bestD = 2.2;
      for (let y = tile.y - 2; y <= tile.y + 2; y++) {
        for (let x = tile.x - 2; x <= tile.x + 2; x++) {
          if (!walkable(x, y)) continue;
          const c = iso(x + 0.5, y + 0.5);
          const d = Math.hypot(c.x - wpt.x, c.y - wpt.y);
          if (d < bestD) { bestD = d; best = { x, y }; }
        }
      }
      if (!best) return;
      tile = best;
    }
    const path = findPath(sim, tile.x, tile.y);
    if (!path) return;
    cancelOrder(sim);
    sim.path = path;
    sim.anim = path.length ? 'walk' : 'idle';
    pokeHint();
  });

  canvas.addEventListener('pointermove', (e) => {
    const hit = hitSim(e.clientX, e.clientY);
    hoverId = hit ? hit.id : null;
    canvas.style.cursor = hit ? 'pointer' : 'crosshair';
  });

  window.addEventListener('keydown', (e) => {
    const typing = document.activeElement === talkInput;
    if (!typing) {
      keys.add(e.key.toLowerCase());
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase()) || e.key.startsWith('Arrow')) {
        e.preventDefault();
      }
    }
    if (e.repeat) return;
    if (!typing && e.key >= '1' && e.key <= '7') {
      const action = ACTIONS[Number(e.key) - 1];
      if (action) command(selected(), action.id, false);
    }
    if (!typing && (e.key === 't' || e.key === 'T')) {
      e.preventDefault();
      talkInput.focus();
    }
    if (e.key === 'Escape') {
      if (typing) talkInput.blur();
      else if (selected()) cancelOrder(selected());
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  function frame(ts) {
    if (!frame.prev) frame.prev = ts;
    const dt = Math.min(0.05, (ts - frame.prev) / 1000);
    frame.prev = ts;
    stateT += dt;
    if (stateT > 8) hintEl.classList.add('hide');
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  bounds = computeBounds();
  buildHud();
  const problems = navCheck();
  sims.forEach((sim) => {
    if (sim.energy < 0.6 && sim.id !== 'god') {
      sim.anim = 'idle';
    } else {
      sim.anim = 'type';
      sim.facing = 's';
    }
  });
  window.BremoHQ = {
    release: RELEASE,
    sims: sims,
    select: select,
    command: (id, kind) => command(simById(id), kind, false),
    navProblems: problems,
  };
  requestAnimationFrame(frame);
})();
