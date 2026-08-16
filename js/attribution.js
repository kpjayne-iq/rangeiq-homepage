// Forward acquisition params from the marketing site to the app.
// Ads and articles land here (rangeiqpoker.com), but signup happens on
// app.rangeiqpoker.com — a different origin, so UTM params die at the hop
// unless the outbound links carry them. On landing, any utm_* params are
// stashed in sessionStorage; every link to the app is then decorated with
// them (without clobbering params a link already has). The app's own
// first-touch capture (src/lib/utm.js) picks them up on arrival.
(function () {
  var APP_HOST = "app.rangeiqpoker.com";
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  try {
    var here = new URLSearchParams(location.search);
    var stash = {};
    var has = false;
    KEYS.forEach(function (k) { var v = here.get(k); if (v) { stash[k] = v; has = true; } });
    if (has) {
      sessionStorage.setItem("riq_utm", JSON.stringify(stash));
    } else {
      stash = JSON.parse(sessionStorage.getItem("riq_utm") || "{}");
    }
    var keys = Object.keys(stash);
    if (!keys.length) return;
    var decorate = function () {
      document.querySelectorAll('a[href*="' + APP_HOST + '"]').forEach(function (a) {
        try {
          var u = new URL(a.href);
          keys.forEach(function (k) {
            if (!u.searchParams.has(k)) u.searchParams.set(k, stash[k]);
          });
          a.href = u.toString();
        } catch (e) { /* leave the link untouched */ }
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", decorate);
    } else {
      decorate();
    }
  } catch (e) { /* attribution must never break the page */ }
})();
