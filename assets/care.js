/* Bremo Care — shared behaviour. No dependencies, degrades gracefully. */
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Progressive-enhancement form handler.
  // Until a real backend/form endpoint is wired up (see README), we store the
  // submission locally and show a confirmation, so nothing is silently lost.
  // Set data-endpoint on the <form> to POST to a real collector (Formspree,
  // your own API, etc.) and the same success UI is shown.
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
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(done).catch(function () {
          storeLocally(form, data); done();
        });
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
    } catch (err) { /* storage unavailable — fail quietly */ }
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

  // Footer year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
