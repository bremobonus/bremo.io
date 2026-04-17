(function () {
  var KEY = "bremo_koho_variant";
  var VARIANTS = ["control", "treatment"];

  function assign() {
    var stored = localStorage.getItem(KEY);
    if (stored && VARIANTS.indexOf(stored) !== -1) return stored;
    var v = Math.random() < 0.5 ? "control" : "treatment";
    localStorage.setItem(KEY, v);
    return v;
  }

  function trackClick(variant) {
    try {
      var log = JSON.parse(localStorage.getItem("bremo_koho_clicks") || "[]");
      log.push({ variant: variant, ts: Date.now() });
      localStorage.setItem("bremo_koho_clicks", JSON.stringify(log));
    } catch (e) {}
  }

  window.BremoAB = {
    getVariant: assign,
    trackClick: trackClick,
    routeToKoho: function () {
      var v = assign();
      var target = v === "treatment" ? "/offers/koho.html" : "/offers/koho-control.html";
      window.location.href = target;
    }
  };
})();
