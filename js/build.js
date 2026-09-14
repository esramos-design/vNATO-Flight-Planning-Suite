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
    version: "5.7.57",
    releaseDate: '14 SEP 2026',
    releaseName: 'SimBrief SWIFT Import Corrections and Flight Test Reports',
    testerLabel: "V5.7.57 SIMBRIEF SWIFT IMPORT LIVE",
    establishedYear: 2017,
    owner: "Virtual NATO",
    website: "https://virtualnato.org/",
    channel: ch.id,
    channelLabel: ch.label
  });

  // TEAM LIVE promotion of all validated ALPHA capabilities through V5.7.57.
  // Preserve compatibility, avionics, scrolling, Oceanic/live Mach, winds,
  // Swift behavior, country-aware guidance and the locked disclaimer.
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
        load('js/v5726.js?v=5726', 'data-vnato-v5726', function(){
          load('js/v5726-sac.js?v=5726a', 'data-vnato-v5726-sac', function(){
            load('js/v5727.js?v=5727', 'data-vnato-v5727', function(){
              load('js/v5728.js?v=5728b', 'data-vnato-v5728', function(){
                load('js/v5728-winds.js?v=5728w', 'data-vnato-v5728-winds', function(){
                  load('js/v5729.js?v=5729', 'data-vnato-v5729', function(){
                    load('js/v5730.js?v=5730', 'data-vnato-v5730', function(){
                      load('js/v5731.js?v=5731', 'data-vnato-v5731', function(){
                        load('js/v5732.js?v=5732', 'data-vnato-v5732', function(){
                          load('js/v5733.js?v=5733', 'data-vnato-v5733', function(){
                            load('js/v5734.js?v=5734', 'data-vnato-v5734', function(){
                              load('js/v5735.js?v=5735', 'data-vnato-v5735', function(){
                                load('js/v5736.js?v=5736', 'data-vnato-v5736', function(){
                                  load('js/v5737.js?v=5737', 'data-vnato-v5737', function(){
                                    load('js/v5738.js?v=5738', 'data-vnato-v5738', function(){
                                      load('js/v5739.js?v=5739', 'data-vnato-v5739', function(){
                                        load('js/v5740.js?v=5740', 'data-vnato-v5740', function(){
                                          load('js/v5750.js?v=5750', 'data-vnato-v5750', function(){
                                            load('js/v5751.js?v=5751', 'data-vnato-v5751', function(){
                                              load('js/v5752.js?v=5752', 'data-vnato-v5752', function(){
                                                load('js/v5754.js?v=5757', 'data-vnato-v5754', function(){
                                                  load('js/v5755.js?v=5757', 'data-vnato-v5755', function(){
                                                    load('js/v5756.js?v=5757', 'data-vnato-v5756');
                                                  });
                                                });
                                              });
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadModules, {once:true});
    else loadModules();
  }
})();
