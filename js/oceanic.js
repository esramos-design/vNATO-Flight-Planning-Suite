/* js/oceanic.js - Oceanic Report V1.1
 * Automatic named-fix resolution using locally imported X-Plane-style navdata.
 * Third-party navdata is NOT bundled with this application; imports remain local.
 */
(function(){
  'use strict';

  const API_URL = 'https://data.vatsim.net/v3/vatsim-data.json';
  const POLL_MS = 15000;
  const CROSS_TOLERANCE_NM = 3.0;
  const MAX_INTERPOLATION_SECONDS = 90;
  const DB_NAME = 'vnato-oceanic-navdata';
  const DB_VERSION = 1;
  const DB_STORE = 'datasets';
  const CUSTOM_KEY = 'vnatoOceanicCustomFixesV1';

  const state = {
    connected:false, timer:null, previous:null, current:null,
    callsign:'', routeText:'', points:[], lastFeed:null, report:'', dirty:false,
    navMeta:null, navCache:null, resolving:false
  };

  function el(id){ return document.getElementById(id); }
  function esc(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function setStatus(text, cls){ const e=el('oceanicStatus'); if(e){e.textContent=text;e.className='oceanic-status '+cls;} }
  function setText(id,v){ const e=el(id); if(e)e.textContent=v; }
  function toRad(x){return x*Math.PI/180;}
  function haversineNm(a,b){
    const R=3440.065, p1=toRad(a.lat), p2=toRad(b.lat), dp=toRad(b.lat-a.lat), dl=toRad(b.lon-a.lon);
    const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
    return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
  }

  // ---------------------------------------------------------------------------
  // IndexedDB: raw local navigation dataset + metadata
  // ---------------------------------------------------------------------------
  function openDb(){
    return new Promise((resolve,reject)=>{
      if(!window.indexedDB){ reject(new Error('IndexedDB is not available in this browser.')); return; }
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{ const db=req.result; if(!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE); };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error || new Error('Unable to open local navdata database.'));
    });
  }
  async function dbPut(key,value){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(DB_STORE,'readwrite'); tx.objectStore(DB_STORE).put(value,key);
      tx.oncomplete=()=>{db.close();resolve();}; tx.onerror=()=>{const e=tx.error;db.close();reject(e);};
    });
  }
  async function dbGet(key){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(DB_STORE,'readonly'); const req=tx.objectStore(DB_STORE).get(key);
      req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
      tx.oncomplete=()=>db.close();
    });
  }
  async function dbClear(){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(DB_STORE,'readwrite'); tx.objectStore(DB_STORE).clear();
      tx.oncomplete=()=>{db.close();resolve();}; tx.onerror=()=>{const e=tx.error;db.close();reject(e);};
    });
  }

  function getCustomFixes(){
    try{ const obj=JSON.parse(localStorage.getItem(CUSTOM_KEY)||'{}'); return obj && typeof obj==='object' ? obj : {}; }
    catch(_){ return {}; }
  }
  function saveCustomFixes(obj){ localStorage.setItem(CUSTOM_KEY,JSON.stringify(obj)); }

  // ---------------------------------------------------------------------------
  // Minimal ZIP reader. Reads only selected entries and uses the browser's
  // native DecompressionStream for DEFLATE entries. No third-party ZIP library.
  // ---------------------------------------------------------------------------
  function u16(d,o){return d.getUint16(o,true);} function u32(d,o){return d.getUint32(o,true);}
  function findEocd(bytes){
    const d=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    for(let i=bytes.byteLength-22;i>=Math.max(0,bytes.byteLength-65557);i--){ if(u32(d,i)===0x06054b50) return i; }
    return -1;
  }
  async function inflateRaw(bytes){
    if(typeof DecompressionStream==='undefined') throw new Error('ZIP decompression is not supported by this browser. Extract Waypoints.txt and Navaids.txt and import those files instead.');
    const ds=new DecompressionStream('deflate-raw');
    const stream=new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  async function readZipSelected(arrayBuffer, wanted){
    const bytes=new Uint8Array(arrayBuffer), d=new DataView(arrayBuffer), eocd=findEocd(bytes);
    if(eocd<0) throw new Error('Invalid or unsupported ZIP file.');
    const total=u16(d,eocd+10), cdOffset=u32(d,eocd+16), decoder=new TextDecoder();
    let p=cdOffset; const results={};
    for(let n=0;n<total;n++){
      if(u32(d,p)!==0x02014b50) throw new Error('ZIP central directory is invalid.');
      const method=u16(d,p+10), compSize=u32(d,p+20), nameLen=u16(d,p+28), extraLen=u16(d,p+30), commentLen=u16(d,p+32), localOffset=u32(d,p+42);
      const name=decoder.decode(bytes.subarray(p+46,p+46+nameLen)).replace(/\\/g,'/');
      const base=name.split('/').pop().toLowerCase();
      if(wanted.has(base)){
        if(u32(d,localOffset)!==0x04034b50) throw new Error(`Invalid ZIP entry: ${name}`);
        const ln=u16(d,localOffset+26), le=u16(d,localOffset+28), dataStart=localOffset+30+ln+le;
        const compressed=bytes.subarray(dataStart,dataStart+compSize);
        let out;
        if(method===0) out=new Uint8Array(compressed);
        else if(method===8) out=await inflateRaw(compressed);
        else throw new Error(`Unsupported ZIP compression method ${method} for ${name}.`);
        results[base]=decoder.decode(out);
      }
      p+=46+nameLen+extraLen+commentLen;
    }
    return results;
  }

  function countUsefulLines(text){ return String(text||'').split(/\r?\n/).reduce((n,l)=>n+(l.trim()?1:0),0); }
  function cycleFromName(name){ const m=String(name||'').match(/(?:_|\b)(\d{4})(?:\b|\.)/); return m?m[1]:''; }
  function parseCycleJson(text){ try{ const o=JSON.parse(text||'{}'); return String(o.cycle||'').trim(); }catch(_){return '';} }

  async function importNavdata(event){
    const input=event?.target || el('oceanicNavFile'); const files=Array.from(input?.files||[]);
    if(!files.length) return;
    const progress=el('oceanicNavProgress'); if(progress) progress.textContent='Reading navigation data…';
    try{
      let wp='', nv='', cycle='', source='Local X-Plane Navdata';
      for(const file of files){
        const low=file.name.toLowerCase();
        if(low.endsWith('.zip')){
          if(progress) progress.textContent=`Opening ${file.name}…`;
          const entries=await readZipSelected(await file.arrayBuffer(),new Set(['waypoints.txt','navaids.txt','cycle.json']));
          wp=entries['waypoints.txt']||wp; nv=entries['navaids.txt']||nv; cycle=parseCycleJson(entries['cycle.json'])||cycle||cycleFromName(file.name);
        }else{
          const text=await file.text();
          if(/waypoints/i.test(file.name)) wp=text;
          else if(/navaids/i.test(file.name)) nv=text;
          else if(/cycle\.json/i.test(file.name)) cycle=parseCycleJson(text)||cycle;
        }
      }
      if(!wp && !nv) throw new Error('No Waypoints.txt or Navaids.txt was found. Select an X-Plane-style navdata ZIP, or select those text files directly.');
      const meta={source,cycle:cycle||'Unknown',waypointCount:countUsefulLines(wp),navaidCount:countUsefulLines(nv),importedAt:new Date().toISOString()};
      if(progress) progress.textContent='Saving locally in this browser…';
      await dbPut('navdata',{waypoints:wp,navaids:nv,meta});
      state.navMeta=meta; state.navCache={waypoints:wp,navaids:nv};
      renderNavStatus();
      if(progress) progress.textContent=`Imported ${meta.waypointCount.toLocaleString()} waypoints and ${meta.navaidCount.toLocaleString()} navaids.`;
      if(state.points.length) await resolveRoutePoints();
    }catch(err){
      console.error(err); if(progress) progress.textContent=`Import failed: ${err.message}`;
      const chip=el('oceanicNavStatus'); if(chip){chip.textContent='IMPORT ERROR';chip.className='oceanic-nav-chip error';}
    }finally{ if(input) input.value=''; }
  }

  async function forgetNavdata(){
    if(!confirm('Forget the locally imported navigation dataset? Your vNATO custom fixes will be kept.')) return;
    try{ await dbClear(); }catch(err){console.warn(err);}
    state.navMeta=null; state.navCache=null; renderNavStatus();
    state.points.forEach(p=>{ if(p.source==='NAVDATA' || p.source==='NAVAID'){p.lat=null;p.lon=null;p.source='UNRESOLVED';p.status='unresolved';p.ambiguous=false;} });
    render();
  }

  async function loadNavdata(){
    if(state.navCache) return state.navCache;
    try{
      const d=await dbGet('navdata');
      if(d){ state.navMeta=d.meta||null; state.navCache={waypoints:d.waypoints||'',navaids:d.navaids||''}; }
      return state.navCache;
    }catch(err){ console.warn('Navdata load failed',err); return null; }
  }
  function renderNavStatus(){
    const m=state.navMeta, chip=el('oceanicNavStatus');
    if(!m){ setText('oceanicNavSource','—');setText('oceanicNavCycle','—');setText('oceanicNavWaypointCount','0');setText('oceanicNavNavaidCount','0'); if(chip){chip.textContent='NO DATA';chip.className='oceanic-nav-chip empty';} return; }
    setText('oceanicNavSource',m.source||'Local Navdata'); setText('oceanicNavCycle',m.cycle||'Unknown');
    setText('oceanicNavWaypointCount',Number(m.waypointCount||0).toLocaleString()); setText('oceanicNavNavaidCount',Number(m.navaidCount||0).toLocaleString());
    if(chip){chip.textContent='READY';chip.className='oceanic-nav-chip ready';}
  }

  // ---------------------------------------------------------------------------
  // FPL and route parsing
  // ---------------------------------------------------------------------------
  function parseCoord(s){
    const t=String(s||'').toUpperCase();
    let m=t.match(/^(\d{2})(\d{2})(\d{2})?([NS])(\d{3})(\d{2})(\d{2})?([EW])$/);
    if(m){
      const lat=(+m[1])+(+m[2])/60+(m[3]?+(m[3])/3600:0), lon=(+m[5])+(+m[6])/60+(m[7]?+(m[7])/3600:0);
      return {lat:m[4]==='S'?-lat:lat,lon:m[8]==='W'?-lon:lon};
    }
    // ICAO compact oceanic forms such as 52N020W / 5230N02000W.
    m=t.match(/^(\d{2})(\d{2})?([NS])(\d{3})(\d{2})?([EW])$/);
    if(m){
      const lat=(+m[1])+(m[2]?+m[2]/60:0), lon=(+m[4])+(m[5]?+m[5]/60:0);
      return {lat:m[3]==='S'?-lat:lat,lon:m[6]==='W'?-lon:lon};
    }
    return null;
  }
  function parseFpl(text){
    const raw=String(text||'').replace(/\r/g,'').split('\n').map(x=>x.trim()).filter(Boolean);
    let callsign='', route='';
    const line1=raw.find(x=>/^\(FPL-/i.test(x));
    if(line1){ const m=line1.match(/^\(FPL-([^-\s]+)/i); if(m) callsign=m[1].toUpperCase(); }
    const dash15=raw.find(x=>/^-([NMK]\d{4}|[A-Z]\d{4})/i.test(x));
    if(dash15){ route=dash15.replace(/^-/,'').replace(/^[NMK]\d{4}(?:[FA]\d{3}|A\d{3}|F\d{3})\s*/,'').trim(); }
    const one=String(text||'').replace(/\n/g,' ');
    if(!route){ const m=one.match(/-[NMK]\d{4}(?:[FA]\d{3}|A\d{3}|F\d{3})\s+(.+?)\s+-[A-Z]{4}\d{4}/i); if(m) route=m[1].trim(); }
    return {callsign,route};
  }
  function routeTokens(route){ return String(route||'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean).filter(t=>!/^\(FPL/i.test(t)); }
  function buildPoints(route){
    const ignore=new Set(['DCT','OAT','V','I','Y','Z','T','IFR','VFR']);
    const custom=getCustomFixes(), out=[];
    routeTokens(route).forEach(token=>{
      const clean=token.replace(/[;,]$/,'').toUpperCase();
      const c=parseCoord(clean);
      if(c){ out.push({name:clean,...c,status:'pending',actual:null,eta:null,source:'COORD',ambiguous:false}); return; }
      if(ignore.has(clean) || /^STAY\d+\//.test(clean) || /^N\d{4}[FA]\d{3}$/.test(clean) || /^M\d{3}$/.test(clean) || /^[AF]\d{3}$/.test(clean) || /^\d+$/.test(clean)) return;
      // Ignore common ATS airway designators; 3+ letter tactical names such as MGO01 remain candidates.
      if(/^[A-Z]{1,2}\d{1,4}[A-Z]?$/.test(clean)) return;
      if(!/^[A-Z0-9]{2,7}$/.test(clean)) return;
      if(custom[clean] && Number.isFinite(+custom[clean].lat) && Number.isFinite(+custom[clean].lon)){
        out.push({name:clean,lat:+custom[clean].lat,lon:+custom[clean].lon,status:'pending',actual:null,eta:null,source:'CUSTOM',ambiguous:false});
      }else out.push({name:clean,lat:null,lon:null,status:'unresolved',actual:null,eta:null,source:'UNRESOLVED',ambiguous:false});
    });
    return out.filter((p,i,a)=>i===a.findIndex(x=>x.name===p.name));
  }

  function scanNavdata(text, needed, type){
    const found=new Map(); if(!text || !needed.size) return found;
    const lines=text.split(/\r?\n/);
    for(const line of lines){
      if(!line) continue; const comma=line.indexOf(','); if(comma<1) continue;
      const ident=line.slice(0,comma).trim().toUpperCase(); if(!needed.has(ident)) continue;
      const f=line.split(','); let lat,lon;
      if(type==='WAYPOINT'){lat=+f[1];lon=+f[2];} else {lat=+f[6];lon=+f[7];}
      if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180) continue;
      if(!found.has(ident))found.set(ident,[]);
      const arr=found.get(ident);
      if(!arr.some(x=>Math.abs(x.lat-lat)<1e-7&&Math.abs(x.lon-lon)<1e-7&&x.type===type)) arr.push({lat,lon,type});
    }
    return found;
  }
  function mergeCandidates(a,b){
    const out=new Map();
    for(const [k,v] of a)out.set(k,v.slice());
    for(const [k,v] of b){const arr=out.get(k)||[];v.forEach(x=>{if(!arr.some(y=>Math.abs(y.lat-x.lat)<1e-7&&Math.abs(y.lon-x.lon)<1e-7&&y.type===x.type))arr.push(x);});out.set(k,arr);}
    return out;
  }
  function chooseCandidate(index,cands){
    if(!cands?.length)return null; if(cands.length===1)return {...cands[0],ambiguous:false};
    const p=state.points[index]; let prev=null,next=null;
    for(let i=index-1;i>=0;i--){if(state.points[i].lat!=null){prev=state.points[i];break;}}
    for(let i=index+1;i<state.points.length;i++){if(state.points[i].lat!=null){next=state.points[i];break;}}
    const cur=state.current?{lat:state.current.latitude,lon:state.current.longitude}:null;
    let best=null,bestScore=Infinity;
    for(const c of cands){
      let score=c.type==='NAVAID'?25:0;
      if(prev)score+=haversineNm(prev,c);
      if(next)score+=haversineNm(c,next);
      if(!prev&&!next&&cur)score+=haversineNm(cur,c);
      if(score<bestScore){bestScore=score;best=c;}
    }
    return best?{...best,ambiguous:true,candidateCount:cands.length}:null;
  }
  async function resolveRoutePoints(){
    if(state.resolving)return; state.resolving=true;
    const progress=el('oceanicNavProgress');
    try{
      const needed=new Set(state.points.filter(p=>p.lat==null).map(p=>p.name));
      if(!needed.size){render();return;}
      const data=await loadNavdata(); if(!data){render();return;}
      if(progress)progress.textContent=`Resolving ${needed.size} named route point(s)…`;
      const wp=scanNavdata(data.waypoints,needed,'WAYPOINT'), nv=scanNavdata(data.navaids,needed,'NAVAID'), all=mergeCandidates(wp,nv);
      // Resolve unique candidates first, then ambiguous candidates using surrounding geometry.
      state.points.forEach(p=>{ if(p.lat!=null)return; const c=all.get(p.name); if(c?.length===1){p.lat=c[0].lat;p.lon=c[0].lon;p.source=c[0].type==='WAYPOINT'?'NAVDATA':'NAVAID';p.status='pending';p.ambiguous=false;} });
      state.points.forEach((p,i)=>{ if(p.lat!=null)return; const c=all.get(p.name); if(c?.length){const best=chooseCandidate(i,c);if(best){p.lat=best.lat;p.lon=best.lon;p.source=best.type==='WAYPOINT'?'NAVDATA':'NAVAID';p.status='pending';p.ambiguous=!!best.ambiguous;p.candidateCount=best.candidateCount||1;}} });
      render();
      const unresolved=state.points.filter(p=>p.lat==null).length;
      if(progress)progress.textContent=unresolved?`${unresolved} route point(s) remain unresolved; use Set Fix for custom OAT points.`:'All named route points resolved.';
    }finally{state.resolving=false;}
  }

  function setCustomFix(index){
    const p=state.points[index]; if(!p)return;
    const latRaw=prompt(`Latitude for ${p.name} (decimal degrees, north positive):`,p.lat??''); if(latRaw===null)return;
    const lonRaw=prompt(`Longitude for ${p.name} (decimal degrees, east positive):`,p.lon??''); if(lonRaw===null)return;
    const lat=Number(latRaw),lon=Number(lonRaw);
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180){alert('Invalid coordinates. Latitude must be -90..90 and longitude -180..180.');return;}
    const custom=getCustomFixes();custom[p.name]={lat,lon,updatedAt:new Date().toISOString()};saveCustomFixes(custom);
    p.lat=lat;p.lon=lon;p.source='CUSTOM';p.status='pending';p.ambiguous=false;render();
  }
  function removeCustomFix(index){
    const p=state.points[index];if(!p)return;const custom=getCustomFixes();delete custom[p.name];saveCustomFixes(custom);
    p.lat=null;p.lon=null;p.source='UNRESOLVED';p.status='unresolved';render();resolveRoutePoints();
  }

  // ---------------------------------------------------------------------------
  // Live tracking, crossing detection and report rendering
  // ---------------------------------------------------------------------------
  function formatPos(lat,lon){
    function one(v,pos,neg,pad){const a=Math.abs(v),d=Math.floor(a),mm=(a-d)*60,s=mm.toFixed(1).padStart(4,'0');return `${String(d).padStart(pad,'0')}°${s}'${v>=0?pos:neg}`;}
    return `${one(lat,'N','S',2)} ${one(lon,'E','W',3)}`;
  }
  function hhmm(date){ return `${String(date.getUTCHours()).padStart(2,'0')}${String(date.getUTCMinutes()).padStart(2,'0')}Z`; }
  function hms(date){ return `${String(date.getUTCHours()).padStart(2,'0')}:${String(date.getUTCMinutes()).padStart(2,'0')}:${String(date.getUTCSeconds()).padStart(2,'0')}Z`; }
  function etaFor(p){
    if(!state.current || !p || p.lat==null || !Number.isFinite(state.current.groundspeed) || state.current.groundspeed<=5) return null;
    const nm=haversineNm({lat:state.current.latitude,lon:state.current.longitude},p), sec=nm/state.current.groundspeed*3600;
    return new Date(Date.now()+sec*1000);
  }
  function projectSegment(a,b,t){ return {lat:a.lat+(b.lat-a.lat)*t,lon:a.lon+(b.lon-a.lon)*t}; }
  function crossingCandidate(prev,cur,p){
    if(!prev || !cur || p.lat==null) return null;
    const lat0=toRad((prev.lat+cur.lat+p.lat)/3), ax=prev.lon*Math.cos(lat0), ay=prev.lat, bx=cur.lon*Math.cos(lat0), by=cur.lat, px=p.lon*Math.cos(lat0), py=p.lat;
    const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy;if(!den)return null;
    const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/den)),q=projectSegment(prev,cur,t),d=haversineNm(q,p),maxT=(cur.ts-prev.ts)/1000;
    if(d<=CROSS_TOLERANCE_NM&&maxT>=0&&maxT<=MAX_INTERPOLATION_SECONDS)return {t,at:new Date(prev.ts+(cur.ts-prev.ts)*t),distanceNm:d};
    return null;
  }
  function render(){
    const box=el('oceanicRouteTable');if(!box)return;
    if(!state.points.length){box.innerHTML='<div class="oceanic-empty">No usable route fixes found.</div>';setText('oceanicRouteSummary','No route loaded');return;}
    let nextIndex=state.points.findIndex(p=>p.status!=='passed');if(nextIndex<0)nextIndex=state.points.length;
    const rows=['<div class="oceanic-row header"><div>#</div><div>FIX</div><div>STATUS</div><div>ETA</div><div>ACTUAL</div><div>COORDINATES / SOURCE</div></div>'];
    state.points.forEach((p,i)=>{
      const isNext=i===nextIndex&&p.status!=='passed'&&p.lat!=null;if(isNext)p.status='next';else if(p.status==='next')p.status='pending';
      const cls=p.status==='passed'?'passed':p.lat==null?'unresolved':isNext?'next':'';
      const badge=p.status==='passed'?'<span class="oceanic-badge pass">PASSED</span>':p.lat==null?'<span class="oceanic-badge warn">UNRESOLVED</span>':isNext?'<span class="oceanic-badge next">NEXT</span>':'<span class="oceanic-badge wait">WAIT</span>';
      const eta=p.status==='passed'?'—':p.eta?hhmm(p.eta):'—',actual=p.actual?hhmm(p.actual):'—';
      let detail=p.lat==null?'Coordinates required':`${formatPos(p.lat,p.lon)} · ${p.source}${p.ambiguous?` · AUTO ${p.candidateCount} CANDIDATES`:''}`;
      let action='';
      if(p.lat==null)action=` <button class="oceanic-mini-btn" onclick="oceanicSetCustomFix(${i})">Set Fix</button>`;
      else if(p.source==='CUSTOM')action=` <button class="oceanic-mini-btn danger" onclick="oceanicRemoveCustomFix(${i})">Remove</button>`;
      rows.push(`<div class="oceanic-row ${cls}"><div>${i+1}</div><div><strong>${esc(p.name)}</strong></div><div>${badge}</div><div>${eta}</div><div>${actual}</div><div>${esc(detail)}${action}</div></div>`);
    });
    box.innerHTML=rows.join('');
    setText('oceanicRouteSummary',`${state.points.length} point(s) • ${state.points.filter(p=>p.lat!=null).length} trackable • ${state.points.filter(p=>p.lat==null).length} unresolved`);
    const n=state.points.find(p=>p.status==='next');state.report=n?buildReport(n):'';if(el('oceanicReportOutput'))el('oceanicReportOutput').value=state.report;
  }
  function buildReport(next){
    if(!state.current||!next||next.lat==null)return next?`${state.callsign||'CALLSIGN'} POSITION REPORT\nNEXT ${next.name} — coordinates unresolved`:'';
    const pos=formatPos(state.current.latitude,state.current.longitude).replace(/°/g,'').replace(/'/g,''),fl=state.current.altitude>=18000?`FL${Math.round(state.current.altitude/100)}`:`${Math.round(state.current.altitude)}FT`,eta=next.eta?hhmm(next.eta):'—',after=state.points[state.points.indexOf(next)+1];
    return `${state.callsign||'CALLSIGN'} POSITION REPORT\n${pos} ${hms(new Date(state.current.ts))} ${fl}\nNEXT ${next.name} ${eta}${after?`\nTHEN ${after.name}`:''}`;
  }
  function updateLive(p){
    state.current={lat:+p.latitude,lon:+p.longitude,latitude:+p.latitude,longitude:+p.longitude,altitude:+p.altitude,groundspeed:+p.groundspeed,heading:+p.heading,feedTime:p.feedTime,ts:Date.now()};
    setText('oceanicPosition',formatPos(state.current.latitude,state.current.longitude));setText('oceanicAltitude',Number.isFinite(state.current.altitude)?`${Math.round(state.current.altitude)} FT`:'—');setText('oceanicGroundspeed',Number.isFinite(state.current.groundspeed)?`${Math.round(state.current.groundspeed)} KT`:'—');setText('oceanicHeading',Number.isFinite(state.current.heading)?`${String(Math.round(state.current.heading)).padStart(3,'0')}°`:'—');setText('oceanicLastUpdate',p.feedTime?new Date(p.feedTime).toISOString().replace('T',' ').replace('.000Z','Z'):hms(new Date()));
    if(state.previous){const nextPt=state.points.find(pt=>pt.status!=='passed');if(nextPt&&nextPt.lat!=null){const cross=crossingCandidate(state.previous,state.current,nextPt);if(cross){nextPt.status='passed';nextPt.actual=cross.at;nextPt.eta=null;}}}
    state.points.forEach(pt=>{if(pt.status!=='passed')pt.eta=etaFor(pt);});state.previous=state.current;render();
  }
  async function fetchLive(){
    if(!state.connected||!state.callsign)return;
    try{const res=await fetch(API_URL,{cache:'no-store'});if(!res.ok)throw new Error(`HTTP ${res.status}`);const data=await res.json();state.lastFeed=data.general?.update_timestamp||null;const target=state.callsign.trim().toUpperCase(),p=(data.pilots||[]).find(x=>String(x.callsign||'').toUpperCase()===target);if(!p){setStatus('CALLSIGN NOT ONLINE','error');return;}updateLive({...p,feedTime:data.general?.update_timestamp});setStatus('LIVE • VATSIM','live');}
    catch(err){console.error(err);setStatus('VATSIM ERROR','error');}
  }

  async function loadFromFpl(){
    const parsed=parseFpl(el('icaoOutput')?.value||'');if(parsed.callsign)el('oceanicCallsign').value=parsed.callsign;if(parsed.route){state.routeText=parsed.route;await buildRoute();}else setStatus('NO FPL ROUTE','error');
  }
  async function buildRoute(){
    state.callsign=(el('oceanicCallsign')?.value||'').trim().toUpperCase();let route=state.routeText;
    if(!route){const parsed=parseFpl(el('icaoOutput')?.value||'');route=parsed.route;if(parsed.callsign&&!state.callsign){state.callsign=parsed.callsign;el('oceanicCallsign').value=parsed.callsign;}}
    state.routeText=route||'';state.points=buildPoints(state.routeText);state.previous=null;state.current=null;render();await resolveRoutePoints();
  }
  function toggleLive(){
    if(state.connected){state.connected=false;if(state.timer)clearInterval(state.timer);state.timer=null;setStatus('OFFLINE','offline');const b=el('oceanicConnectBtn');if(b)b.textContent='Connect VATSIM';return;}
    state.callsign=(el('oceanicCallsign')?.value||'').trim().toUpperCase();if(!state.callsign){setStatus('ENTER CALLSIGN','error');return;}if(!state.points.length)buildRoute();state.connected=true;setStatus('CONNECTING…','connecting');const b=el('oceanicConnectBtn');if(b)b.textContent='Disconnect';fetchLive();state.timer=setInterval(fetchLive,POLL_MS);
  }
  function clearAll(){
    state.connected=false;if(state.timer)clearInterval(state.timer);state.timer=null;state.previous=null;state.current=null;state.callsign='';state.routeText='';state.points=[];state.report='';['oceanicCallsign','oceanicReportOutput'].forEach(id=>{const e=el(id);if(e)e.value='';});setText('oceanicPosition','—');setText('oceanicAltitude','—');setText('oceanicGroundspeed','—');setText('oceanicHeading','—');setText('oceanicLastUpdate','—');setStatus('OFFLINE','offline');const b=el('oceanicConnectBtn');if(b)b.textContent='Connect VATSIM';render();
  }
  function copyReport(){const e=el('oceanicReportOutput');if(!e?.value)return;navigator.clipboard?.writeText(e.value).then(()=>{e.style.background='#dcfce7';setTimeout(()=>e.style.background='',500);});}

  async function init(){ try{const d=await dbGet('navdata');if(d){state.navMeta=d.meta||null;state.navCache={waypoints:d.waypoints||'',navaids:d.navaids||''};}}catch(_){/* no local dataset yet */} renderNavStatus(); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

  window.oceanicLoadFromFpl=loadFromFpl;
  window.oceanicBuildRoute=buildRoute;
  window.oceanicToggleLive=toggleLive;
  window.oceanicClear=clearAll;
  window.oceanicCopyReport=copyReport;
  window.oceanicSetDirty=function(){state.dirty=true;};
  window.oceanicImportNavdata=importNavdata;
  window.oceanicForgetNavdata=forgetNavdata;
  window.oceanicSetCustomFix=setCustomFix;
  window.oceanicRemoveCustomFix=removeCustomFix;
})();
