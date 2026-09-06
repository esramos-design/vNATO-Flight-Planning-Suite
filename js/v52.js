/* vNATO Flight Planning Suite V5.2 corrections
 * - Complete sortie profile state save/restore
 * - User-managed airfield presets
 * - VATSIM Mach/altitude compatibility helper
 */
(function(){
  'use strict';
  const PROFILE_KEY='vnato_flight_profiles';
  const AIRFIELD_KEY='vnato_airfield_presets';
  const SKIP_IDS=new Set(['icaoOutput','icaoValidationOutput','profileNameInput','savedProfilesSelect','presetBaseSelect']);

  function byId(id){ return document.getElementById(id); }
  function safeJson(key, fallback){ try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch(_){return fallback;} }

  function captureControlState(){
    const root=byId('icaoTab') || document;
    const state={};
    root.querySelectorAll('input[id],select[id],textarea[id]').forEach(el=>{
      if(SKIP_IDS.has(el.id) || el.type==='button' || el.type==='submit') return;
      if(el.type==='checkbox' || el.type==='radio') state[el.id]={kind:'checked',value:!!el.checked};
      else state[el.id]={kind:'value',value:el.value};
    });
    // Dispatch/common fields are outside icaoTab in this UI.
    ['countrySelect','fplCallsign','fplAcftType','fplDep','fplEobt','fplArr','fplEetArr','fplAlt'].forEach(id=>{
      const el=byId(id); if(el) state[id]={kind:'value',value:el.value};
    });
    return state;
  }

  function restoreControlState(state){
    Object.entries(state||{}).forEach(([id,rec])=>{
      const el=byId(id); if(!el || !rec) return;
      if(rec.kind==='checked') el.checked=!!rec.value; else el.value=rec.value ?? '';
    });
    // Rebuild PBN display text after checkbox restoration.
    if(typeof window.updateIcaoPbnSelection==='function') window.updateIcaoPbnSelection();
    if(typeof window.updatePbnSelection==='function') window.updatePbnSelection();
  }

  window.saveFlightProfile=function(){
    const name=(byId('profileNameInput')?.value||'').trim();
    if(!name){ alert('Please enter a name for your flight profile.'); return; }
    const profiles=safeJson(PROFILE_KEY,{});
    profiles[name]={schema:2,savedAt:new Date().toISOString(),controls:captureControlState()};
    localStorage.setItem(PROFILE_KEY,JSON.stringify(profiles));
    window.loadSavedProfilesList();
    byId('profileNameInput').value='';
    alert(`Flight profile "${name}" saved with the complete FPL state.`);
  };

  const oldLoad=window.loadFlightProfile;
  window.loadFlightProfile=function(name){
    if(!name) return;
    const profiles=safeJson(PROFILE_KEY,{}), p=profiles[name];
    if(!p) return;
    if(p.schema===2 && p.controls){
      restoreControlState(p.controls);
      alert(`Profile "${name}" restored completely.`);
      return;
    }
    // Backward compatibility with V5.1 and older saved profiles.
    if(typeof oldLoad==='function') oldLoad(name);
  };

  function loadAirfieldPresets(){
    const sel=byId('presetBaseSelect'); if(!sel) return;
    const current=sel.value;
    sel.innerHTML='<option value="">[Airfield Presets]</option>';
    const presets=safeJson(AIRFIELD_KEY,{});
    Object.keys(presets).sort().forEach(name=>{
      const p=presets[name], o=document.createElement('option');
      o.value=name; o.textContent=`${name}: ${p.dep||'----'} → ${p.arr||'----'}${p.alt?' / '+p.alt:''}`; sel.appendChild(o);
    });
    if(presets[current]) sel.value=current;
  }

  window.applyAirfieldPreset=function(name){
    if(!name) return;
    const p=safeJson(AIRFIELD_KEY,{})[name]; if(!p) return;
    if(byId('fplDep')) byId('fplDep').value=p.dep||'';
    if(byId('fplArr')) byId('fplArr').value=p.arr||'';
    if(byId('fplAlt')) byId('fplAlt').value=p.alt||'';
  };

  window.saveAirfieldPreset=function(){
    const dep=(byId('fplDep')?.value||'').trim().toUpperCase();
    const arr=(byId('fplArr')?.value||'').trim().toUpperCase();
    const alt=(byId('fplAlt')?.value||'').trim().toUpperCase();
    if(!dep || !arr){ alert('Enter Departure and Arrival before saving an airfield preset.'); return; }
    const suggested=`${dep}-${arr}`;
    const name=(prompt('Airfield preset name:',suggested)||'').trim(); if(!name) return;
    const presets=safeJson(AIRFIELD_KEY,{}); presets[name]={dep,arr,alt};
    localStorage.setItem(AIRFIELD_KEY,JSON.stringify(presets)); loadAirfieldPresets();
  };

  window.deleteAirfieldPreset=function(){
    const sel=byId('presetBaseSelect'), name=sel?.value; if(!name){alert('Select an airfield preset first.');return;}
    if(!confirm(`Delete airfield preset "${name}"?`)) return;
    const presets=safeJson(AIRFIELD_KEY,{}); delete presets[name]; localStorage.setItem(AIRFIELD_KEY,JSON.stringify(presets)); loadAirfieldPresets();
  };

  function insertPresetControls(){
    const sel=byId('presetBaseSelect'); if(!sel || byId('saveAirfieldPresetBtn')) return;
    const box=document.createElement('div'); box.style.cssText='display:flex;gap:4px;margin-top:5px;grid-column:1/2;';
    box.innerHTML='<button type="button" id="saveAirfieldPresetBtn" class="fpl-copy-btn" style="position:static;background:#0072CE;padding:3px 7px;font-size:10px;" onclick="saveAirfieldPreset()">Save Airfields</button><button type="button" class="fpl-copy-btn" style="position:static;background:#ef4444;padding:3px 7px;font-size:10px;" onclick="deleteAirfieldPreset()">Delete</button>';
    sel.parentElement.insertBefore(box,sel.nextSibling);
  }

  function isaMachToTasKt(mach, altitudeFt){
    if(!(mach>0) || !(altitudeFt>=0)) return null;
    const h=Math.min(altitudeFt,65000)*0.3048;
    let T = h<=11000 ? 288.15-0.0065*h : 216.65;
    const a=Math.sqrt(1.4*287.05287*T); // m/s
    return mach*a*1.94384449;
  }

  function updateVatsimCompat(){
    const box=byId('vatsimCompat52'); if(!box) return;
    const su=byId('icaoSpdUnit')?.value||'', sv=(byId('icaoSpdVal')?.value||'').trim();
    const lu=byId('icaoAltUnit')?.value||'', lv=(byId('icaoAltVal')?.value||'').trim();
    let altFt=null;
    if(lu==='F' && /^\d{3}$/.test(lv)) altFt=parseInt(lv,10)*100;
    else if(lu==='A' && /^\d{3}$/.test(lv)) altFt=parseInt(lv,10)*100;
    else if(lu==='S' && /^\d{4}$/.test(lv)) altFt=Math.round(parseInt(lv,10)*10*3.28084);
    else if(lu==='M' && /^\d{4}$/.test(lv)) altFt=Math.round(parseInt(lv,10)*10*3.28084);
    let speed='—', note='';
    if(su==='N' && /^\d{4}$/.test(sv)) speed=`${parseInt(sv,10)} KT`;
    else if(su==='K' && /^\d{4}$/.test(sv)) speed=`${Math.round(parseInt(sv,10)*0.539957)} KT`;
    else if(su==='M' && /^\d{3}$/.test(sv)){
      const mach=parseInt(sv,10)/100;
      const est=altFt!=null?isaMachToTasKt(mach,altFt):null;
      speed=est?`≈ ${Math.round(est)} KT (ISA estimate from M${sv})`:`M${sv}`;
      note='Legacy myVATSIM import may leave Airspeed/Altitude blank when Item 15 starts with Mach. Keep the ICAO Mach value; use these values to verify/fill the web form if required.';
    }
    box.innerHTML=`<b>VATSIM Import Check:</b> Airspeed <b>${speed}</b> &nbsp;|&nbsp; Altitude <b>${altFt!=null?altFt+' FT':'—'}</b>${note?'<br><span style="font-size:10px;color:#92400e;">'+note+'</span>':''}`;
  }

  function insertCompatBox(){
    const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Generate ICAO String');
    if(!btn || byId('vatsimCompat52')) return;
    const d=document.createElement('div'); d.id='vatsimCompat52'; d.style.cssText='margin:8px 0;padding:7px 9px;border:1px solid #93c5fd;background:#eff6ff;border-radius:5px;font-size:11px;color:#1e3a8a;';
    btn.parentElement.insertBefore(d,btn);
    ['icaoSpdUnit','icaoSpdVal','icaoAltUnit','icaoAltVal'].forEach(id=>byId(id)?.addEventListener('input',updateVatsimCompat));
    ['icaoSpdUnit','icaoAltUnit'].forEach(id=>byId(id)?.addEventListener('change',updateVatsimCompat));
    updateVatsimCompat();
  }

  window.addEventListener('DOMContentLoaded',()=>{
    insertPresetControls(); loadAirfieldPresets(); insertCompatBox();
    // Subtle version marker for testers.
    const h=document.querySelector('h1'); if(h && !/V5\.2/.test(h.textContent)){ const s=document.createElement('span'); s.textContent='  V5.2'; s.style.cssText='font-size:11px;color:#64748b;font-weight:600;'; h.appendChild(s); }
  });
})();
