/* Bremo — shared behaviour. No dependencies, degrades gracefully. */
(function () {
  "use strict";
  var root = document.documentElement;

  /* Theme: follow the system, let the viewer override, remember the choice. */
  try {
    var saved = localStorage.getItem("bremo_theme");
    if (saved) root.setAttribute("data-theme", saved);
  } catch (e) {}
  var themeBtn = document.querySelector(".theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var isDark = (root.getAttribute("data-theme") ||
        (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light")) === "dark";
      var next = isDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("bremo_theme", next); } catch (e) {}
    });
  }

  /* Mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* Hairline appears on the header only once you leave the top */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Quiet reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Forms — POST to the endpoint, fall back to localStorage so a lead is never lost */
  document.querySelectorAll("form[data-care-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = {};
      new FormData(form).forEach(function (v, k) {
        if (data[k] !== undefined) {
          if (!Array.isArray(data[k])) data[k] = [data[k]];
          data[k].push(v);
        } else { data[k] = v; }
      });

      var endpoint = form.getAttribute("data-endpoint");
      var done = function () { showSuccess(form); };

      if (endpoint) {
        var btn = form.querySelector("button[type=submit]");
        if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          done();
        }).catch(function () { storeLocally(form, data); done(); });
      } else {
        storeLocally(form, data);
        done();
      }
    });
  });

  function storeLocally(form, data) {
    try {
      var key = "bremo_" + (form.getAttribute("data-care-form") || "form") + "_submissions";
      var log = JSON.parse(localStorage.getItem(key) || "[]");
      log.push({ data: data, ts: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(log));
    } catch (err) {}
  }

  function showSuccess(form) {
    var box = form.parentNode.querySelector(".form-success");
    form.style.display = "none";
    if (box) {
      box.classList.add("show");
      box.setAttribute("tabindex", "-1");
      box.focus();
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
