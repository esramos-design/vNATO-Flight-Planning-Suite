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
    version: "5.7.23",
    releaseDate: '07 SEP 2026',
    releaseName: 'ALPHA Admin Button Stack',
    testerLabel: "V5.7.23 THEME CONTROL LAYOUT TEST",
    establishedYear: 2017,
    owner: "Virtual NATO",
    website: "https://virtualnato.org/",
    channel: ch.id,
    channelLabel: ch.label
  });
})();
