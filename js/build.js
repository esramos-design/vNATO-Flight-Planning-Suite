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
    version: "5.7.26",
    releaseDate: '10 SEP 2026',
    releaseName: 'Military Aircraft Avionics Presets & Independent Panels',
    testerLabel: "V5.7.26 AIRCRAFT PRESETS / DUAL SCROLL LIVE",
    establishedYear: 2017,
    owner: "Virtual NATO",
    website: "https://virtualnato.org/",
    channel: ch.id,
    channelLabel: ch.label
  });

  // TEAM LIVE: retain verified V5.7.25 myVATSIM STAYINFO compatibility, then
  // load V5.7.26 aircraft presets and independent desktop panel scrolling.
  if (ch.id === "live" || ch.id === "deployed" || ch.id === "dev") {
    const load = function(src, marker, done){
      if (document.querySelector(`script[${marker}]`)) { if(done) done(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.setAttribute(marker, 'true');
      if(done) s.addEventListener('load', done, {once:true});
      document.body.appendChild(s);
    };
    const loadModules = function(){
      load('js/v5725.js?v=5725', 'data-vnato-v5725', function(){
        load('js/v5726.js?v=5726', 'data-vnato-v5726');
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadModules, {once:true});
    else loadModules();
  }
})();
