/* Full-screen Bremo office. Drop this folder in as /company/ on DreamHost.
   Speak lines POST to /api/gameplay-speak.php (the live hook). Impact paid is UNKNOWN. */
(function () {
  "use strict";

  var WORLD = { w: 1360, h: 760 };
  var SPEED = 130;
  var GOD_ID = "4885dc27";
  var SPEAK_URL = "/api/gameplay-speak.php";
  var PAGE = "https://bremo.io/company/";

  var ROOMS = [
    { id: "god", name: "God Hall", x: 36, y: 28, w: 300, h: 210, floor: "#efe6fb" },
    { id: "hq", name: "CEO", x: 352, y: 28, w: 250, h: 210, floor: "#f6efff" },
    { id: "markets", name: "Markets", x: 618, y: 28, w: 300, h: 210, floor: "#e5f8f6" },
    { id: "product", name: "Product", x: 934, y: 28, w: 390, h: 210, floor: "#e5f8ee" },
    { id: "growth", name: "Growth", x: 36, y: 258, w: 300, h: 220, floor: "#fde8ee" },
    { id: "conversion", name: "Conversion", x: 352, y: 258, w: 250, h: 220, floor: "#fff1d6" },
    { id: "meet", name: "Meeting", x: 618, y: 258, w: 300, h: 220, floor: "#f7f1e4" },
    { id: "content", name: "Content", x: 934, y: 258, w: 390, h: 220, floor: "#fde8f4" },
    { id: "analytics", name: "Analytics", x: 36, y: 498, w: 420, h: 230, floor: "#e4f4fc" },
    { id: "grok", name: "Grok Analytics", x: 472, y: 498, w: 400, h: 230, floor: "#ece6fb" },
    { id: "partners", name: "Partnerships", x: 888, y: 498, w: 220, h: 230, floor: "#ffeadc" },
    { id: "payouts", name: "Payouts", x: 1124, y: 498, w: 200, h: 230, floor: "#e5f7ee" }
  ];

  var MEET = { x: 768, y: 368 };

  var LINES = {
    "4885dc27": "Rally the floor. Push the handoff. Do not call it revenue. Impact paid is UNKNOWN.",
    "76d83076": "Allastair here. Make the call. Do not invent a paid number.",
    "ef52739b": "Growth is filling the door. Visits and outs are not paid.",
    "a698bde5": "Conversion Daily is walking the handoff. A handoff is not revenue.",
    "83b9baff": "Analytics is logging the beat. Impact paid is UNKNOWN.",
    "e5335dff": "Grok Analytics is reading the log in plain words.",
    "a88143a7": "Product is at the desk. The page has to work.",
    "8fac036f": "Content is writing it in plain words.",
    "d7699914": "Partnerships has the path. No invented payout.",
    "f658cc75": "Payouts checked. No receipt. Impact paid stays UNKNOWN.",
    "5136a60e": "Markets is watching what is live. No guessed figures."
  };

  var CAST = [
    { id: "4885dc27", name: "Bremo God", short: "God", role: "Overseer", color: "#9F7AEA", crown: true, room: "god" },
    { id: "76d83076", name: "CEO Allastair", short: "Allastair", role: "CEO", color: "#C084FC", room: "hq" },
    { id: "ef52739b", name: "Growth", short: "Growth", role: "Growth", color: "#FB7185", room: "growth" },
    { id: "a698bde5", name: "Conversion Daily", short: "Conversion", role: "Conversion", color: "#F59E0B", room: "conversion" },
    { id: "83b9baff", name: "Analytics", short: "Analytics", role: "Analytics", color: "#38BDF8", room: "analytics" },
    { id: "e5335dff", name: "Grok Analytics", short: "Grok", role: "Charts", color: "#8B5CF6", room: "grok" },
    { id: "a88143a7", name: "Product", short: "Product", role: "Product", color: "#34D399", room: "product" },
    { id: "8fac036f", name: "Content", short: "Content", role: "Content", color: "#F472B6", room: "content" },
    { id: "d7699914", name: "Partnerships", short: "Partners", role: "Partnerships", color: "#FB923C", room: "partners" },
    { id: "f658cc75", name: "Payouts Tracker", short: "Payouts", role: "Payouts", color: "#10B981", room: "payouts" },
    { id: "5136a60e", name: "Markets", short: "Markets", role: "Markets", color: "#22D3EE", room: "markets" }
  ];

  var canvas = document.getElementById("world");
  var ctx = canvas.getContext("2d");
  var hud = document.getElementById("hud");
  var whoEl = document.getElementById("who");
  var queueEl = document.getElementById("queue");
  var liveEl = document.getElementById("live");
  var rallyBtn = document.getElementById("rally");
  var orderButtons = [
    document.getElementById("btn-work"),
    document.getElementById("btn-carry"),
    document.getElementById("btn-meet"),
    document.getElementById("btn-brief")
  ];

  var view = {
    w: 1,
    h: 1,
    scale: 1,
    camX: 186,
    camY: 140,
    cx: 0,
    cy: 0,
    hudH: 80,
    zoomed: false,
    panning: false,
    holdCam: false
  };
  var keys = Object.create(null);
  var selectedId = null;
  var clock = 0;
  var last = 0;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var bubble = null;

  function roomById(id) {
    for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i].id === id) return ROOMS[i];
    return ROOMS[0];
  }

  function deskPoint(room) {
    return { x: room.x + 72, y: room.y + room.h * 0.62 };
  }

  var people = CAST.map(function (c, i) {
    var room = roomById(c.room);
    var desk = deskPoint(room);
    var person = {
      id: c.id,
      name: c.name,
      short: c.short,
      role: c.role,
      color: c.color,
      crown: !!c.crown,
      room: room,
      desk: desk,
      x: desk.x,
      y: desk.y,
      facing: 1,
      state: "type",
      queue: [],
      playerLock: false,
      keyMove: false,
      carrying: false,
      idle: 0,
      nextThink: 0.4 + i * 0.15,
      bob: i
    };
    if (i % 2 === 0) person.queue.push({ kind: "type", left: 2 + (i % 3) });
    else person.queue.push(wanderTask(person));
    return person;
  });

  function wanderTask(c) {
    var r = c.room;
    return {
      kind: "walk",
      x: r.x + 36 + Math.random() * (r.w - 72),
      y: r.y + 46 + Math.random() * (r.h - 78)
    };
  }

  function seat(i) {
    var ang = (i / people.length) * Math.PI * 2 - Math.PI / 2;
    return { x: MEET.x + Math.cos(ang) * 62, y: MEET.y + Math.sin(ang) * 42 };
  }

  function selected() {
    for (var i = 0; i < people.length; i++) if (people[i].id === selectedId) return people[i];
    return null;
  }

  function taskLabel(t) {
    if (!t) return "";
    if (t.kind === "walk") return "Walk";
    if (t.kind === "carry") return "Carry";
    if (t.kind === "type") return "Type";
    if (t.kind === "meet") return "Meeting";
    return t.kind;
  }

  function renderHud() {
    var c = selected();
    var on = !!c;
    orderButtons.forEach(function (b) { b.disabled = !on; });
    rallyBtn.disabled = !c || c.id !== GOD_ID;
    if (!c) {
      whoEl.textContent = "Tap a person";
      queueEl.textContent = view.zoomed
        ? "Drag the floor to look around. Tap someone, then tap where they should walk."
        : "They wander, type, carry, and meet until you give an order.";
      return;
    }
    whoEl.textContent = c.name + " · " + c.role;
    if (c.keyMove) {
      queueEl.textContent = "You are walking them";
      return;
    }
    if (!c.queue.length) {
      queueEl.textContent = "Looking around";
      return;
    }
    queueEl.textContent = c.queue.map(taskLabel).join(" → ");
  }

  function say(c, text) {
    if (!text || /\$/.test(text)) return;
    var line = String(text).slice(0, 220);
    bubble = { who: c, text: line, t: 4.2 };
    liveEl.textContent = c.name + ". " + line;
    var detail = {
      characterId: c.id,
      characterName: c.name,
      message: line,
      target: "analytics",
      page: PAGE,
      impactPaid: "UNKNOWN"
    };
    try {
      window.dispatchEvent(new CustomEvent("bremo:company", { detail: detail }));
    } catch (e) {}
    try {
      fetch(SPEAK_URL, {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: c.id,
          characterName: c.name,
          message: line,
          target: "analytics",
          page: PAGE
        })
      }).catch(function () {});
    } catch (e) {}
  }

  function give(c, queue) {
    c.queue = queue;
    c.playerLock = true;
    c.keyMove = false;
    c.carrying = false;
    renderHud();
  }

  function orderWork(c) {
    give(c, [
      { kind: "walk", x: c.desk.x, y: c.desk.y },
      { kind: "type", left: 4 }
    ]);
  }

  function orderCarry(c) {
    give(c, [
      { kind: "walk", x: c.desk.x, y: c.desk.y },
      { kind: "carry", x: MEET.x, y: MEET.y + 8 }
    ]);
  }

  function orderMeet(c) {
    var s = seat(people.indexOf(c));
    give(c, [
      { kind: "walk", x: s.x, y: s.y },
      { kind: "meet", left: 4 }
    ]);
  }

  function orderBrief(c) {
    orderWork(c);
    say(c, LINES[c.id] || (c.name + " is on the floor. Impact paid is UNKNOWN."));
  }

  function rally() {
    var god = null;
    for (var i = 0; i < people.length; i++) if (people[i].id === GOD_ID) god = people[i];
    if (!god) return;
    selectedId = GOD_ID;
    people.forEach(function (c, i) {
      var ang = (i / people.length) * Math.PI * 2;
      var spot = { x: god.desk.x + Math.cos(ang) * 54, y: god.desk.y + 36 + Math.sin(ang) * 28 };
      give(c, [
        { kind: "walk", x: spot.x, y: spot.y },
        { kind: "meet", left: 2.2 },
        { kind: "walk", x: c.desk.x, y: c.desk.y },
        { kind: "type", left: 3 }
      ]);
    });
    say(god, LINES[GOD_ID]);
    renderHud();
  }

  function idleThink(c, dt) {
    c.idle += dt;
    if (c.idle < c.nextThink) return;
    c.idle = 0;
    c.nextThink = 1.6 + Math.random() * 2.4;
    var roll = Math.random();
    if (roll < 0.4) {
      c.queue = [wanderTask(c)];
      return;
    }
    if (roll < 0.7) {
      c.queue = [
        { kind: "walk", x: c.desk.x, y: c.desk.y },
        { kind: "type", left: 2.5 + Math.random() * 2 }
      ];
      return;
    }
    if (roll < 0.88) {
      c.queue = [
        { kind: "walk", x: c.desk.x, y: c.desk.y },
        { kind: "carry", x: MEET.x, y: MEET.y + 8 }
      ];
      return;
    }
    var spot = seat(people.indexOf(c));
    c.queue = [
      { kind: "walk", x: spot.x, y: spot.y },
      { kind: "meet", left: 4 }
    ];
  }

  function stepToward(c, x, y, dt) {
    var dx = x - c.x;
    var dy = y - c.y;
    var dist = Math.hypot(dx, dy);
    if (dist < 7) {
      c.x = x;
      c.y = y;
      return true;
    }
    var step = Math.min(dist, SPEED * dt);
    c.x += (dx / dist) * step;
    c.y += (dy / dist) * step;
    if (Math.abs(dx) > 1) c.facing = dx > 0 ? 1 : -1;
    return false;
  }

  function separate(c) {
    for (var i = 0; i < people.length; i++) {
      var o = people[i];
      if (o === c) continue;
      var dx = c.x - o.x;
      var dy = c.y - o.y;
      var d = Math.hypot(dx, dy) || 0.01;
      if (d < 28) {
        c.x += (dx / d) * 0.6;
        c.y += (dy / d) * 0.6;
      }
    }
  }

  function clampPerson(c) {
    c.x = Math.max(24, Math.min(WORLD.w - 24, c.x));
    c.y = Math.max(24, Math.min(WORLD.h - 24, c.y));
  }

  function update(dt) {
    clock += dt;
    if (bubble) {
      bubble.t -= dt;
      if (bubble.t <= 0) bubble = null;
    }
    applyKeys(dt);
    if (view.zoomed && !view.panning && !view.holdCam) {
      var focus = selected();
      if (focus) {
        view.camX += (focus.x - view.camX) * Math.min(1, dt * 3.5);
        view.camY += (focus.y - view.camY) * Math.min(1, dt * 3.5);
        clampCam();
      }
    }
    people.forEach(function (c) {
      if (c.keyMove) return;
      var task = c.queue[0];
      if (!task) {
        c.state = "idle";
        c.carrying = false;
        if (c.playerLock) c.playerLock = false;
        else idleThink(c, dt);
        return;
      }
      if (task.kind === "walk" || task.kind === "carry") {
        c.state = task.kind === "carry" ? "carry" : "walk";
        c.carrying = task.kind === "carry";
        if (stepToward(c, task.x, task.y, dt)) c.queue.shift();
        else if (c.state === "walk") separate(c);
      } else {
        c.state = task.kind;
        c.carrying = false;
        task.left -= dt;
        if (task.left <= 0) c.queue.shift();
      }
      clampPerson(c);
    });
    renderHud();
  }

  function applyKeys(dt) {
    var c = selected();
    if (!c) return;
    var x = 0;
    var y = 0;
    if (keys.ArrowLeft || keys.a || keys.A) x -= 1;
    if (keys.ArrowRight || keys.d || keys.D) x += 1;
    if (keys.ArrowUp || keys.w || keys.W) y -= 1;
    if (keys.ArrowDown || keys.s || keys.S) y += 1;
    if (!x && !y) {
      c.keyMove = false;
      return;
    }
    c.keyMove = true;
    c.playerLock = true;
    c.queue = [];
    c.carrying = false;
    var len = Math.hypot(x, y);
    c.x += (x / len) * SPEED * dt;
    c.y += (y / len) * SPEED * dt;
    if (x) c.facing = x > 0 ? 1 : -1;
    c.state = "walk";
    clampPerson(c);
  }

  function fit() {
    view.hudH = Math.ceil(hud.getBoundingClientRect().height) + 18;
    var availW = view.w;
    var availH = Math.max(160, view.h - view.hudH);
    var fitScale = Math.min(availW / WORLD.w, availH / WORLD.h);
    if (22 * fitScale < 16) {
      view.scale = Math.min(1.5, 34 / 22);
      view.zoomed = true;
    } else {
      view.scale = fitScale;
      view.zoomed = false;
      view.camX = WORLD.w / 2;
      view.camY = WORLD.h / 2;
      view.holdCam = false;
    }
    view.cx = view.w / 2;
    view.cy = availH / 2;
    clampCam();
  }

  function clampCam() {
    var halfW = (view.w / 2) / view.scale;
    var halfH = view.cy / view.scale;
    if (halfW * 2 >= WORLD.w) view.camX = WORLD.w / 2;
    else view.camX = Math.max(halfW, Math.min(WORLD.w - halfW, view.camX));
    if (halfH * 2 >= WORLD.h) view.camY = WORLD.h / 2;
    else view.camY = Math.max(halfH, Math.min(WORLD.h - halfH, view.camY));
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    view.w = window.innerWidth;
    view.h = window.innerHeight;
    canvas.width = Math.floor(view.w * dpr);
    canvas.height = Math.floor(view.h * dpr);
    canvas.style.width = view.w + "px";
    canvas.style.height = view.h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fit();
  }

  function screenToWorld(sx, sy) {
    return {
      x: (sx - view.cx) / view.scale + view.camX,
      y: (sy - view.cy) / view.scale + view.camY
    };
  }

  function worldToScreen(x, y) {
    return {
      x: view.cx + (x - view.camX) * view.scale,
      y: view.cy + (y - view.camY) * view.scale
    };
  }

  function characterAt(x, y) {
    var best = null;
    var bestD = 36 / view.scale;
    for (var i = 0; i < people.length; i++) {
      var d = Math.hypot(people[i].x - x, people[i].y - y);
      if (d < bestD) {
        best = people[i];
        bestD = d;
      }
    }
    return best;
  }

  function onWorld(x, y) {
    var hit = characterAt(x, y);
    if (hit) {
      selectedId = hit.id;
      view.holdCam = false;
      renderHud();
      return;
    }
    var c = selected();
    if (!c) return;
    if (x < 10 || y < 10 || x > WORLD.w - 10 || y > WORLD.h - 10) return;
    give(c, [{ kind: "walk", x: x, y: y }]);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawRooms() {
    ctx.fillStyle = "#f3ecdf";
    roundRect(18, 14, WORLD.w - 36, WORLD.h - 28, 28);
    ctx.fill();
    ROOMS.forEach(function (r) {
      ctx.fillStyle = r.floor;
      roundRect(r.x, r.y, r.w, r.h, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(31,26,19,0.08)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#5b5142";
      ctx.font = "700 13px Outfit, sans-serif";
      ctx.fillText(r.name, r.x + 14, r.y + 22);
      var desk = deskPoint(r);
      ctx.fillStyle = "rgba(31,26,19,0.08)";
      roundRect(desk.x - 28, desk.y - 10, 56, 28, 6);
      ctx.fill();
    });
    ctx.fillStyle = "#e7d7b8";
    ctx.beginPath();
    ctx.ellipse(MEET.x, MEET.y, 54, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(31,26,19,0.15)";
    ctx.stroke();
  }

  function drawPerson(c) {
    var bob = 0;
    if (!reduceMotion && (c.state === "walk" || c.state === "carry")) bob = Math.sin(clock * 10 + c.bob) * 2;
    var x = c.x;
    var y = c.y + bob;
    ctx.fillStyle = "rgba(31,26,19,0.12)";
    ctx.beginPath();
    ctx.ellipse(c.x, c.y + 20, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    if (c.carrying) {
      ctx.fillStyle = "#c4a574";
      roundRect(x + c.facing * 16, y - 4, 12, 10, 2);
      ctx.fill();
    }
    ctx.fillStyle = c.color;
    roundRect(x - 11, y - 6, 22, 24, 8);
    ctx.fill();
    ctx.fillStyle = "#f6e7d4";
    ctx.beginPath();
    ctx.arc(x, y - 16, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1f1a13";
    ctx.beginPath();
    ctx.arc(x + c.facing * 3 - 3, y - 17, 1.4, 0, Math.PI * 2);
    ctx.arc(x + c.facing * 3 + 3, y - 17, 1.4, 0, Math.PI * 2);
    ctx.fill();
    if (c.crown) {
      ctx.fillStyle = "#1f1a13";
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 24);
      ctx.lineTo(x - 6, y - 32);
      ctx.lineTo(x, y - 25);
      ctx.lineTo(x + 6, y - 34);
      ctx.lineTo(x + 9, y - 24);
      ctx.closePath();
      ctx.fill();
    }
    if (c.state === "type") {
      ctx.strokeStyle = "rgba(31,26,19,0.35)";
      ctx.lineWidth = 1;
      var k = Math.sin(clock * 14 + c.bob) * 2;
      ctx.beginPath();
      ctx.moveTo(x - 6, y + 4 + k);
      ctx.lineTo(x - 2, y + 8);
      ctx.moveTo(x + 6, y + 4 - k);
      ctx.lineTo(x + 2, y + 8);
      ctx.stroke();
    }
    if (c.id === selectedId) {
      ctx.strokeStyle = "#1f1a13";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y - 4, 24, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#1f1a13";
    ctx.font = "700 12px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(c.id === selectedId ? c.name : c.short, x, y + 34);
    ctx.textAlign = "left";
  }

  function wrapLine(text, maxW) {
    var words = String(text).split(" ");
    var lines = [];
    var cur = "";
    for (var i = 0; i < words.length; i++) {
      var next = cur ? cur + " " + words[i] : words[i];
      if (cur && ctx.measureText(next).width > maxW) {
        lines.push(cur);
        cur = words[i];
      } else cur = next;
    }
    if (cur) lines.push(cur);
    if (lines.length > 4) {
      lines = lines.slice(0, 4);
      lines[3] = lines[3].replace(/\s+\S*$/, "") + "…";
    }
    return lines;
  }

  function drawBubble() {
    if (!bubble || !bubble.who) return;
    ctx.font = "600 13px Outfit, sans-serif";
    var maxW = 240;
    var lines = wrapLine(bubble.text, maxW);
    var w = 0;
    for (var i = 0; i < lines.length; i++) w = Math.max(w, ctx.measureText(lines[i]).width);
    w = Math.min(maxW, w) + 20;
    var h = 14 + lines.length * 16;
    var x = Math.max(12, Math.min(WORLD.w - w - 12, bubble.who.x - w / 2));
    var y = Math.max(12, bubble.who.y - 28 - h);
    ctx.fillStyle = "#fff";
    roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(31,26,19,0.12)";
    ctx.stroke();
    ctx.fillStyle = "#1f1a13";
    ctx.textAlign = "left";
    for (var n = 0; n < lines.length; n++) ctx.fillText(lines[n], x + 10, y + 18 + n * 16);
  }

  function draw() {
    ctx.fillStyle = "#faf6ee";
    ctx.fillRect(0, 0, view.w, view.h);
    ctx.save();
    ctx.translate(view.cx, view.cy);
    ctx.scale(view.scale, view.scale);
    ctx.translate(-view.camX, -view.camY);
    drawRooms();
    var sorted = people.slice().sort(function (a, b) { return a.y - b.y; });
    sorted.forEach(drawPerson);
    drawBubble();
    ctx.restore();
  }

  function frame(ts) {
    if (!last) last = ts;
    var dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  var pointer = null;
  canvas.addEventListener("pointerdown", function (e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false };
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    var dx = e.clientX - pointer.x;
    var dy = e.clientY - pointer.y;
    if (Math.hypot(e.clientX - pointer.sx, e.clientY - pointer.sy) > 8) pointer.moved = true;
    if (pointer.moved && view.zoomed) {
      view.panning = true;
      view.holdCam = true;
      view.camX -= dx / view.scale;
      view.camY -= dy / view.scale;
      clampCam();
    }
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });
  function endPointer(e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    var dragged = pointer.moved && view.zoomed;
    pointer = null;
    view.panning = false;
    if (dragged) return;
    var rect = canvas.getBoundingClientRect();
    var w = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    onWorld(w.x, w.y);
  }
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", function (e) {
    if (pointer && e.pointerId === pointer.id) {
      pointer = null;
      view.panning = false;
    }
  });
  canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  window.addEventListener("keydown", function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(e.key) !== -1) e.preventDefault();
    keys[e.key] = true;
  });
  window.addEventListener("keyup", function (e) { keys[e.key] = false; });
  window.addEventListener("blur", function () { keys = Object.create(null); });
  window.addEventListener("resize", resize);

  document.getElementById("btn-work").addEventListener("click", function () { var c = selected(); if (c) orderWork(c); });
  document.getElementById("btn-carry").addEventListener("click", function () { var c = selected(); if (c) orderCarry(c); });
  document.getElementById("btn-meet").addEventListener("click", function () { var c = selected(); if (c) orderMeet(c); });
  document.getElementById("btn-brief").addEventListener("click", function () { var c = selected(); if (c) orderBrief(c); });
  rallyBtn.addEventListener("click", rally);

  window.BremoCompany = {
    cast: people,
    impactPaid: "UNKNOWN",
    worldToScreen: worldToScreen,
    screenToWorld: screenToWorld,
    selected: function () { return selectedId; },
    view: function () {
      return { zoomed: view.zoomed, scale: view.scale, camX: view.camX, camY: view.camY };
    }
  };

  resize();
  renderHud();
  requestAnimationFrame(frame);
})();
