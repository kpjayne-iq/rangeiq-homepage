/*
 * RangeIQ cookie-consent + Google Consent Mode v2 controller.
 *
 * Consent Mode defaults are set INLINE in each page's <head> (all denied) so
 * GA4 and Google Ads load in a cookieless, consent-denied state on first paint.
 * This script renders the banner, persists the visitor's choice, and — only on
 * acceptance — updates Consent Mode to granted and loads Microsoft Clarity.
 *
 * Non-essential tools gated here: Google Analytics 4 (G-WVG2PWLN8F),
 * Google Ads (AW-18142420946), Microsoft Clarity (x0blshjqav).
 * Essential cookies (Supabase auth, CSRF, Tolt affiliate attribution) are not
 * gated and are disclosed in the Privacy Policy.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "riq_consent_v1";
  var CLARITY_ID = "x0blshjqav";
  var clarityLoaded = false;

  function gtagSafe() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag === "function") {
      window.gtag.apply(window, arguments);
    } else {
      window.dataLayer.push(arguments);
    }
  }

  function loadClarity() {
    if (clarityLoaded || window.clarity) return;
    clarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }

  function applyGranted() {
    gtagSafe("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted"
    });
    loadClarity();
  }

  function applyDenied() {
    gtagSafe("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied"
    });
  }

  function store(choice) {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch (e) {}
  }

  function read() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function injectStyles() {
    if (document.getElementById("riq-consent-style")) return;
    var css =
      "#riq-consent{position:fixed;left:0;right:0;bottom:0;z-index:99999;" +
      "background:#111821;border-top:1px solid rgba(217,185,91,0.25);" +
      "box-shadow:0 -10px 40px rgba(0,0,0,0.5);font-family:'Inter',-apple-system,sans-serif;" +
      "color:#A8B4BF;padding:18px 20px;transform:translateY(100%);transition:transform 320ms ease}" +
      "#riq-consent.riq-show{transform:translateY(0)}" +
      "#riq-consent .riq-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;" +
      "gap:20px;flex-wrap:wrap;justify-content:space-between}" +
      "#riq-consent p{margin:0;font-size:13.5px;line-height:1.6;flex:1 1 420px;min-width:260px}" +
      "#riq-consent a{color:#D9B95B;text-decoration:none}" +
      "#riq-consent a:hover{text-decoration:underline}" +
      "#riq-consent .riq-btns{display:flex;gap:10px;flex-wrap:wrap}" +
      "#riq-consent button{font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;" +
      "border-radius:9px;padding:10px 18px;border:1px solid transparent;transition:all 160ms ease}" +
      "#riq-consent .riq-accept{background:#D9B95B;color:#0B0F14;border-color:#D9B95B}" +
      "#riq-consent .riq-accept:hover{background:#E3C56B}" +
      "#riq-consent .riq-reject{background:transparent;color:#A8B4BF;border-color:#243140}" +
      "#riq-consent .riq-reject:hover{border-color:#6F7D8A;color:#E7ECEF}";
    var s = document.createElement("style");
    s.id = "riq-consent-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildBanner() {
    injectStyles();
    var bar = document.createElement("div");
    bar.id = "riq-consent";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Cookie consent");
    bar.innerHTML =
      '<div class="riq-inner">' +
      '<p>We use cookies and similar tools. Essential cookies keep the site working; ' +
      'with your consent we also use analytics (Google Analytics, Microsoft Clarity) and ' +
      'Google Ads measurement to improve RangeIQ. See our ' +
      '<a href="/privacy.html">Privacy Policy</a>.</p>' +
      '<div class="riq-btns">' +
      '<button type="button" class="riq-reject">Reject non-essential</button>' +
      '<button type="button" class="riq-accept">Accept all</button>' +
      '</div></div>';
    document.body.appendChild(bar);
    // setTimeout (not requestAnimationFrame) so the banner still appears in
    // background/inactive tabs, where rAF callbacks are paused.
    setTimeout(function () { bar.classList.add("riq-show"); }, 30);

    bar.querySelector(".riq-accept").addEventListener("click", function () {
      store("granted"); applyGranted(); dismiss(bar);
    });
    bar.querySelector(".riq-reject").addEventListener("click", function () {
      store("denied"); applyDenied(); dismiss(bar);
    });
  }

  function dismiss(bar) {
    bar.classList.remove("riq-show");
    setTimeout(function () { if (bar && bar.parentNode) bar.parentNode.removeChild(bar); }, 360);
  }

  // Allow a footer "Cookie settings" link to re-open the banner: onclick="riqCookieSettings()"
  window.riqCookieSettings = function () {
    if (!document.getElementById("riq-consent")) buildBanner();
  };

  function init() {
    var choice = read();
    if (choice === "granted") { applyGranted(); return; }
    if (choice === "denied") { applyDenied(); return; }
    buildBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
