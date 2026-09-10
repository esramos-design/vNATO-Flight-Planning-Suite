/* vNATO Flight Planning Suite - release metadata (single source of truth) */
(function(){
  "use strict";
  const host = (window.location.hostname || "").toLowerCase();
  function channel(){
    if (host.includes("vnato-flight-planning-suite-alpha")) return {id:"alpha", label:"ALPHA MASTER"};
    if (host.includes("vnato-flight-planning-suite.pages.dev")) return {id:"live", label:"TEAM LIVE"};
    if (host === "localhost" || host === "127.0.0.1" || host === "") return {id:"dev", label:"LOCAL DEV"};
    return {id:"deployed", label:"DEPLOYED BUILD"};
  }
  const ch = channel();
  window.VNATO_RELEASE = Object.freeze({
    appName: "Virtual NATO Flight Planning Suite",
    version: "5.7.25",
    releaseDate: '10 SEP 2026',
    releaseName: 'myVATSIM RMK Compatibility Refinement',
    testerLabel: "V5.7.25 TEST 12 RMK COMPAT",
    establishedYear: 2017,
    owner: "Virtual NATO",
    website: "https://virtualnato.org/",
    channel: ch.id,
    channelLabel: ch.label
  });

  // V5.7.25 TEAM LIVE compatibility layer. TEST 12 verified the no-slash
  // STAYINFO RMK representation in the current myVATSIM importer.
  if (ch.id === "live" || ch.id === "deployed" || ch.id === "dev") {
    const loadCompat = function(){
      if (document.querySelector('script[data-vnato-v5725]')) return;
      const s = document.createElement('script');
      s.src = 'js/v5725.js?v=5725';
      s.setAttribute('data-vnato-v5725', 'true');
      document.body.appendChild(s);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadCompat, {once:true});
    else loadCompat();
  }
})();
