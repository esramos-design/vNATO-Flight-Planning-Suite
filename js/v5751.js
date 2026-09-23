/* vNATO Flight Planning Suite V5.7.64 — TEAM LIVE
 * Add a first-step Oceanic preflight checklist, including the local MSFS Mach bridge.
 * Guidance only: Oceanic calculations, telemetry, and flight-planning logic are unchanged.
 */
(function(){
  'use strict';

  const VERSION='5.7.64';

  function installStyles(){
    if(document.getElementById('v5751OceanicChecklistStyles')) return;
    const style=document.createElement('style');
    style.id='v5751OceanicChecklistStyles';
    style.textContent=`
      .oceanic-first-checklist{margin:10px 0 12px;padding:12px;border:1px solid #60a5fa;border-left:5px solid #0072ce;border-radius:7px;background:#eff6ff;color:#0f2742}
      .oceanic-first-checklist h4{margin:0 0 4px;color:#002b49;font-size:13px;letter-spacing:.02em}
      .oceanic-first-checklist .checklist-intro{margin:0 0 8px;font-size:11px;color:#334155}
      .oceanic-first-checklist ol{margin:0;padding-left:22px;font-size:11px;line-height:1.48}
      .oceanic-first-checklist li{margin:4px 0;padding-left:2px}
      .oceanic-first-checklist code{padding:1px 4px;border:1px solid #bfdbfe;border-radius:3px;background:#fff;color:#0f2742;white-space:normal;overflow-wrap:anywhere}
      .oceanic-first-checklist .mach-caution{margin:9px 0 0;padding:7px 9px;border:1px solid #f59e0b;border-radius:5px;background:#fffbeb;color:#78350f;font-size:11px}
      .oceanic-first-checklist .mach-troubleshoot{margin:9px 0 0;padding:8px 10px;border:1px solid #cbd5e1;border-radius:5px;background:#fff;color:#334155;font-size:10px;line-height:1.45}
      .oceanic-first-checklist .mach-troubleshoot b{color:#002b49}
      .oceanic-first-checklist .mach-troubleshoot ul{margin:5px 0 0;padding-left:18px}
      .oceanic-first-checklist .mach-troubleshoot li{margin:3px 0}
      body.dark-mode .oceanic-first-checklist{background:#12263d;color:#e5eef8;border-color:#2878b8;border-left-color:#38a9ec}
      body.dark-mode .oceanic-first-checklist h4{color:#eef7ff}
      body.dark-mode .oceanic-first-checklist .checklist-intro{color:#bacadd}
      body.dark-mode .oceanic-first-checklist code{background:#0d1b2c;color:#eaf6ff;border-color:#355878}
      body.dark-mode .oceanic-first-checklist .mach-caution{background:#3a2b12;color:#ffe7ad;border-color:#b7791f}
      body.dark-mode .oceanic-first-checklist .mach-troubleshoot{background:#0d1b2c;color:#dbe7ef;border-color:#355878}
      body.dark-mode .oceanic-first-checklist .mach-troubleshoot b{color:#eef7ff}
    `;
    document.head.appendChild(style);
  }

  function checklistMarkup(){
    return `
      <section id="oceanicFirstChecklist" class="oceanic-first-checklist" aria-labelledby="oceanicFirstChecklistTitle">
        <h4 id="oceanicFirstChecklistTitle">FIRST STEP — BEFORE USING OCEANIC REPORT</h4>
        <p class="checklist-intro">Use the native vNATO MSFS Mach Bridge controls below before loading the route or connecting live tracking.</p>
        <ol>
          <li><b>First use on this PC only:</b> click <b>Install Bridge Once</b> and run the vNATO Windows installer. <b>Python is not required.</b></li>
          <li>Start <b>Microsoft Flight Simulator 2024</b>, load the correct aircraft, and enter the flight.</li>
          <li><b>Each Oceanic session:</b> click <b>Start Bridge</b>. If the browser asks permission to open <b>vNATO Mach Bridge</b>, allow it.</li>
          <li>Confirm the bridge is running and a live Mach value is available. A very low Mach value while stationary/on the ground is normal.</li>
          <li>Load or complete the flight plan, confirm the exact VATSIM callsign, and resolve named/custom route fixes with current local navdata.</li>
          <li>Connect VATSIM and verify position, altitude, groundspeed, heading, last update, and Mach before using the generated report.</li>
        </ol>
        <div class="mach-troubleshoot">
          <b>Troubleshooting</b>
          <ul>
            <li><b>Bridge does not start:</b> confirm the native vNATO Mach Bridge installer completed, then click <b>Start Bridge</b> again.</li>
            <li><b>Browser asks to open vNATO Mach Bridge:</b> allow the request; this launches the locally installed helper.</li>
            <li><b>Bridge runs but no useful Mach is shown:</b> confirm MSFS 2024 is fully loaded into the aircraft, then retry.</li>
            <li><b>Installer is blocked by Windows security:</b> do not disable Smart App Control or other Windows protection. Report the block for support.</li>
            <li><b>Still offline:</b> close any existing vNATO Mach Bridge process, restart MSFS, then start the bridge again.</li>
          </ul>
        </div>
        <p class="mach-caution"><b>Mach — BRIDGE OFFLINE:</b> leave Mach blank and continue with the available VATSIM data. Do not estimate Mach from VATSIM groundspeed.</p>
      </section>`;
  }

  function installChecklist(){
    const body=document.getElementById('oceanicBody');
    if(!body || document.getElementById('oceanicFirstChecklist')) return false;
    const card=body.querySelector('.oceanic-panel-card');
    const note=card && card.querySelector('.oceanic-note');
    if(!card) return false;
    const holder=document.createElement('div');
    holder.innerHTML=checklistMarkup().trim();
    const checklist=holder.firstElementChild;
    if(note) note.insertAdjacentElement('afterend',checklist);
    else card.insertAdjacentElement('afterbegin',checklist);
    return true;
  }

  function init(){
    installStyles();
    installChecklist();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.VNATO_V5751={version:VERSION,installChecklist};
})();
