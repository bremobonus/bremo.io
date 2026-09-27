(function () {
  "use strict";

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function fmtMs(n) {
    if (n == null || isNaN(n)) return "—";
    return Math.round(n) + " ms";
  }

  function showError(msg) {
    document.getElementById("loading-state").classList.add("hidden");
    var err = document.getElementById("error-state");
    err.textContent = msg;
    err.classList.remove("hidden");
  }

  function renderSummary(data) {
    var grid = document.getElementById("summary-grid");
    if (!grid) return;
    var s = data.summary || {};
    var sites = data.sites || [];
    var avg = 0;
    var n = 0;
    sites.forEach(function (site) {
      if (site.latencyMs != null) { avg += site.latencyMs; n += 1; }
    });
    if (n) avg = Math.round(avg / n);
    var cards = [
      { kicker: "Sites", big: String(s.total != null ? s.total : sites.length), hint: "In the network" },
      { kicker: "Up now", big: String(s.up != null ? s.up : "—"), hint: "HTTP OK" },
      { kicker: "Down", big: String(s.down != null ? s.down : "—"), hint: "Needs a look" },
      { kicker: "Avg speed", big: n ? avg + " ms" : "—", hint: "Round-trip check" }
    ];
    grid.innerHTML = "";
    cards.forEach(function (c) {
      var div = document.createElement("div");
      div.className = "stat-card";
      div.innerHTML =
        '<div class="kicker">' + c.kicker + "</div>" +
        '<div class="big">' + c.big + "</div>" +
        '<div class="hint">' + c.hint + "</div>";
      grid.appendChild(div);
    });
  }

  function renderSites(data) {
    var grid = document.getElementById("site-grid");
    if (!grid) return;
    grid.innerHTML = "";
    (data.sites || []).forEach(function (site) {
      var a = document.createElement("a");
      a.className = "site-card";
      a.href = site.url;
      a.target = "_blank";
      a.rel = "noopener";
      var statusChip = site.ok
        ? '<span class="chip up">Up · ' + (site.httpStatus || "OK") + "</span>"
        : '<span class="chip down">Down</span>';
      var phase = site.phase ? '<span class="chip phase">' + site.phase + "</span>" : "";
      var speed = '<span class="chip">' + fmtMs(site.latencyMs) + "</span>";
      a.innerHTML =
        '<div class="row"><div class="name">' + site.name + "</div></div>" +
        '<div class="role">' + (site.role || "") + "</div>" +
        '<div class="role">' + (site.note || "") + "</div>" +
        '<div class="meta">' + statusChip + phase + speed + "</div>";
      grid.appendChild(a);
    });
  }

  function render(data) {
    setText("updated-at", data.updatedAt || "—");
    setText("site-count", String((data.sites || []).length) + " sites");
    setText("helper", (data.labels && data.labels.helper) || "Live status for every Bremo site.");
    setText("truth-note", " " + ((data.labels && data.labels.truth) || "Reachability only — not traffic or revenue."));
    renderSummary(data);
    renderSites(data);
    document.getElementById("loading-state").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  }

  fetch("./data.json", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("Could not load empire data (" + r.status + ")");
      return r.json();
    })
    .then(render)
    .catch(function (e) {
      showError(e.message || "Could not load empire data");
    });
})();
