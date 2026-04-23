(function () {
  var KEY = "bremo_koho_variant";
  var VARIANTS = ["control", "treatment"];

  function assign() {
    try {
      var stored = localStorage.getItem(KEY);
      if (stored && VARIANTS.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    var v = Math.random() < 0.5 ? "control" : "treatment";
    try { localStorage.setItem(KEY, v); } catch (e) {}
    return v;
  }

  function trackClick(variant) {
    try {
      var log = JSON.parse(localStorage.getItem("bremo_koho_clicks") || "[]");
      log.push({ variant: variant, ts: Date.now() });
      localStorage.setItem("bremo_koho_clicks", JSON.stringify(log));
    } catch (e) {}
    if (window.dataLayer) {
      window.dataLayer.push({ event: "koho_cta_click", variant: variant });
    }
  }

  function copyPromoFallback(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function copyPromo(code) {
    if (!code) return Promise.resolve(false);
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(code).then(
        function () { return true; },
        function () { return copyPromoFallback(code); }
      );
    }
    return Promise.resolve(copyPromoFallback(code));
  }

  window.BremoAB = {
    getVariant: assign,
    trackClick: trackClick,
    copyPromo: copyPromo,
    routeToKoho: function () {
      var v = assign();
      var target = v === "treatment" ? "/offers/koho.html" : "/offers/koho-control.html";
      window.location.href = target;
    }
  };
})();
