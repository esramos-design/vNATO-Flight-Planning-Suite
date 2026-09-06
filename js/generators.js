// ============================================================================
// VIRTUAL NATO FLIGHT PLANNING SUITE - GENERATORS.JS (V5.0.8.ALPHA PATCHED)
// Operational Air Traffic (OAT) & Tactical Dispatch System
// ============================================================================

// Shared UI helpers (tab switching, copy, reset, PBN dropdowns) are defined once
// in js/core.js. Keeping a single authoritative implementation prevents silent
// function overriding caused by duplicate global declarations.

// ============================================================================
// 1. SWIFT ROUTE GENERATOR
// ============================================================================
function generateRouteString() {
  const gatToOat = document.getElementById('gatToOat').value.trim();
  const oatToGat = document.getElementById('oatToGat').value.trim();
  const vfrWpt = document.getElementById('vfrTransWpt').value.trim();
  const vfrType = document.getElementById('vfrTransType').value;
  const vfrParams = document.getElementById('vfrTransParams').value.trim();
  const ifrWpt = document.getElementById('ifrTransWpt').value.trim();
  const ifrType = document.getElementById('ifrTransType').value;
  const ifrParams = document.getElementById('ifrTransParams').value.trim();
  const routeFixes = document.getElementById('route').value.trim();

  let routeParts = [];
  if (gatToOat) routeParts.push(gatToOat);
  if (vfrWpt && vfrType) {
    routeParts.push(`${vfrWpt} ${vfrType}${vfrParams ? ' ' + vfrParams : ''}`);
  }
  if (ifrWpt && ifrType) {
    routeParts.push(`${ifrWpt} ${ifrType}${ifrParams ? ' ' + ifrParams : ''}`);
  }
  if (routeFixes) routeParts.push(routeFixes);

  for (let i = 1; i <= 3; i++) {
    const sWpt = document.getElementById(`stayWpt${i}`)?.value.trim();
    const sSeg = document.getElementById(`staySeg${i}`)?.value;
    const sDur = document.getElementById(`stayDur${i}`)?.value.trim();
    if (sWpt && sSeg && sSeg !== 'NONE' && sDur) {
      routeParts.push(`${sWpt} ${sSeg}/${sDur}`);
    }
  }

  if (oatToGat) routeParts.push(oatToGat);

  const finalRoute = routeParts.join(' ');
  const output = document.getElementById('routeOutput');
  if (output) output.value = finalRoute;
}

// ============================================================================
// 2. SWIFT REMARKS GENERATOR
// ============================================================================
function generateRemarksString() {
  let remarksList = [];
  
  const rmkOat = document.getElementById('rmkOat').value;
  if (rmkOat) remarksList.push(rmkOat);

  const pbn = document.getElementById('pbnValue').value;
  if (pbn) remarksList.push(`PBN/${pbn}`);

  const nav = document.getElementById('nav').value;
  if (nav) remarksList.push(`NAV/${nav}`);

  const sts = document.getElementById('sts').value;
  if (sts) remarksList.push(`STS/${sts}`);

  const sel = document.getElementById('sel').value.trim();
  if (sel) remarksList.push(`SEL/${sel}`);

  const sur = document.getElementById('sur').value.trim();
  if (sur) remarksList.push(`SUR/${sur}`);

  const per = document.getElementById('per').value;
  if (per) remarksList.push(`PER/${per}`);

  const orgn = document.getElementById('orgn').value.trim();
  if (orgn) remarksList.push(`ORGN/${orgn}`);

  const com = document.getElementById('com').value.trim();
  if (com) remarksList.push(`COM/${com}`);

  const reg = document.getElementById('reg').value.trim();
  if (reg) remarksList.push(`REG/${reg}`);

  const opr = document.getElementById('opr').value.trim();
  if (opr) remarksList.push(`OPR/${opr}`);

  const fuelEnd = document.getElementById('fuelEnd').value.trim();
  if (fuelEnd) remarksList.push(`-E/${fuelEnd}`);

  const eet = document.getElementById('eet').value.trim();
  if (eet) remarksList.push(eet);

  for (let i = 1; i <= 3; i++) {
    const sInfo = document.getElementById(`stayinfo${i}`)?.value.trim();
    if (sInfo) remarksList.push(`STAYINFO${i}/${sInfo}`);
  }

  const vso = document.getElementById('vso').value.trim() || 'VIRTUALNATO.ORG';
  remarksList.push(vso);

  if (document.getElementById('vsoTrainee')?.checked) {
    remarksList.push('VSO TRAINEE');
  }

  const output = document.getElementById('remarksOutput');
  if (output) output.value = remarksList.join(' ');
}

// ============================================================================
// 3. VATSIM - IMPORT ICAO FPL GENERATOR (AUDITED V5.1)
// ============================================================================

function icaoText(id) {
  return (document.getElementById(id)?.value || '').trim();
}

function icaoUpper(id) {
  return icaoText(id).toUpperCase();
}

function normalizeRouteText(value) {
  return (value || '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/\bDCT\s+DCT\b/g, 'DCT')
    .trim();
}

function normalizeRmk(value) {
  const v = (value || '').trim().replace(/\s+/g, ' ');
  if (!v) return 'RMK/OAT VIRTUALNATO.ORG';
  if (/^RMK\s*\//i.test(v)) return v.replace(/^RMK\s*\/\s*/i, 'RMK/');
  return `RMK/${v}`;
}

function isHhmm(value) {
  if (!/^\d{4}$/.test(value || '')) return false;
  const hh = Number(value.slice(0, 2));
  const mm = Number(value.slice(2));
  return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
}

function isDurationHhmm(value) {
  if (!/^\d{4}$/.test(value || '')) return false;
  const mm = Number(value.slice(2));
  return mm >= 0 && mm <= 59;
}

function insertRouteFragment(route, waypoint, fragment, mode, warnings) {
  const cleanRoute = normalizeRouteText(route);
  const wpt = normalizeRouteText(waypoint);
  const frag = normalizeRouteText(fragment);
  if (!wpt || !frag) return cleanRoute;

  const tokens = cleanRoute ? cleanRoute.split(' ') : [];
  const matches = [];
  tokens.forEach((token, idx) => {
    if (token === wpt) matches.push(idx);
  });

  if (!matches.length) {
    warnings.push(`Route insertion target ${wpt} was not found; "${frag}" was not inserted.`);
    return cleanRoute;
  }
  if (matches.length > 1) {
    warnings.push(`Route insertion target ${wpt} occurs ${matches.length} times; the first occurrence was used.`);
  }

  const fragTokens = frag.split(' ');
  const insertAt = (mode || 'AFTER') === 'BEFORE' ? matches[0] : matches[0] + 1;
  tokens.splice(insertAt, 0, ...fragTokens);
  return normalizeRouteText(tokens.join(' '));
}

function compileIcaoRoute(data, warnings) {
  let route = normalizeRouteText(data.route);

  // Insert STAY first. Later transfer insertion at the same waypoint is placed
  // immediately after the waypoint, which yields WPT OAT V PARAM STAY as
  // required by the vNATO test cases rather than WPT STAY OAT V PARAM.
  data.stays.forEach(stay => {
    if (stay.wpt && stay.seg && stay.seg !== 'NONE' && stay.dur) {
      route = insertRouteFragment(route, stay.wpt, `${stay.seg}/${stay.dur}`, 'AFTER', warnings);
    }
  });

  // VFR convention requested by vNATO testing: WPT OAT V NxxxxAxxx
  if (data.vfrWpt && data.vfrType) {
    const frag = [data.vfrType, data.vfrParams].filter(Boolean).join(' ');
    route = insertRouteFragment(route, data.vfrWpt, frag, data.vfrInsertMode, warnings);
  }

  // IFR convention requested by vNATO testing: WPT NxxxxFxxx OAT I
  if (data.ifrWpt && data.ifrType) {
    const frag = [data.ifrParams, data.ifrType].filter(Boolean).join(' ');
    route = insertRouteFragment(route, data.ifrWpt, frag, data.ifrInsertMode, warnings);
  }

  // These are intentionally treated as user-authored route fragments. The
  // compiler does not invent DCT between them, avoiding DCT DCT and invalid
  // DCT around OAT/GAT transition syntax.
  return normalizeRouteText([data.gatToOat, route, data.oatToGat].filter(Boolean).join(' '));
}

function collectIcaoFplData() {
  const rulesRaw = icaoUpper('icaoRules');
  const rules = rulesRaw === 'T' ? 'I' : rulesRaw;
  const equipCustom = icaoUpper('icaoEquipCustom');

  return {
    rulesRaw,
    rules,
    flightType: icaoUpper('icaoType') || 'M',
    callsign: icaoUpper('fplCallsign'),
    speedUnit: icaoUpper('icaoSpdUnit'),
    speedValue: icaoUpper('icaoSpdVal'),
    levelUnit: icaoUpper('icaoAltUnit'),
    levelValue: icaoUpper('icaoAltVal'),
    aircraftType: icaoUpper('fplAcftType'),
    wake: icaoUpper('icaoWake'),
    equipment: equipCustom || icaoUpper('icaoEquip'),
    surveillance: icaoUpper('icaoTrans'),
    departure: icaoUpper('fplDep'),
    eobt: icaoUpper('fplEobt'),
    arrival: icaoUpper('fplArr'),
    totalEet: icaoUpper('fplEetArr'),
    alternate: icaoUpper('fplAlt'),
    dof: icaoUpper('dof'),
    route: icaoUpper('icaoRoute'),
    gatToOat: icaoUpper('icaoGatToOat'),
    oatToGat: icaoUpper('icaoOatToGat'),
    vfrWpt: icaoUpper('icaoVfrTransWpt'),
    vfrType: icaoUpper('icaoVfrTransType'),
    vfrParams: icaoUpper('icaoVfrTransParams'),
    vfrInsertMode: icaoUpper('icaoVfrInsertMode') || 'AFTER',
    ifrWpt: icaoUpper('icaoIfrTransWpt'),
    ifrType: icaoUpper('icaoIfrTransType'),
    ifrParams: icaoUpper('icaoIfrTransParams'),
    ifrInsertMode: icaoUpper('icaoIfrInsertMode') || 'AFTER',
    stays: [1,2,3].map(i => ({
      wpt: icaoUpper(`icaoStayWpt${i}`),
      seg: icaoUpper(`icaoStaySeg${i}`),
      dur: icaoUpper(`icaoStayDur${i}`)
    })),
    pbn: icaoUpper('icaoPbnValue'),
    nav: icaoUpper('icaoNav'),
    sts: icaoUpper('icaoSts'),
    sel: icaoUpper('icaoSel'),
    sur: icaoUpper('icaoSur'),
    per: icaoUpper('icaoPer'),
    orgn: icaoUpper('icaoOrgn'),
    com: icaoUpper('icaoCom'),
    reg: icaoUpper('icaoReg'),
    opr: icaoUpper('icaoOpr'),
    fuel: icaoUpper('icaoFuel'),
    stayinfo: [1,2,3].map(i => icaoText(`icaoStayinfo${i}`).toUpperCase()),
    rmk: normalizeRmk(icaoText('icaoRmk')),
    trainee: !!document.getElementById('icaoVsoTrainee')?.checked
  };
}

function validateIcaoFplData(data) {
  const errors = [];
  const warnings = [];

  if (!['I','V','Y','Z'].includes(data.rules)) errors.push('Item 8: select I, V, Y or Z flight rules. Tactical T is mapped to I for VATSIM import.');
  if (data.rulesRaw === 'T') warnings.push('Item 8: tactical T was mapped to I for VATSIM compatibility; retain OAT status in route/RMK.');
  if (['Y','Z'].includes(data.rules)) warnings.push('VATSIM compatibility: Y/Z may be accepted by the ICAO importer, but network/controller-client support remains limited and the network may represent the plan as I/V. Verify the processed form before filing.');
  if (!/^[A-Z0-9]{2,10}$/.test(data.callsign)) errors.push('Item 7: callsign must contain 2–10 letters/numbers for VATSIM filing.');
  else if (data.callsign.length > 7) warnings.push('Item 7: callsign exceeds the classic ICAO 7-character field, but VATSIM supports longer tactical callsigns; verify controller/client compatibility.');
  if (!/^[A-Z0-9]{2,4}$/.test(data.aircraftType)) errors.push('Item 9: enter a 2–4 character ICAO aircraft type designator.');
  if (!['J','H','M','L'].includes(data.wake)) errors.push('Item 9: select a wake turbulence category.');
  if (!/^[A-Z0-9]+$/.test(data.equipment)) errors.push('Item 10a: equipment code is required.');
  if (!/^[A-Z0-9]+$/.test(data.surveillance)) errors.push('Item 10b: surveillance/transponder code is required.');
  if (!/^[A-Z]{4}$/.test(data.departure)) errors.push('Item 13: departure must be a 4-letter ICAO designator.');
  if (!isHhmm(data.eobt)) errors.push('Item 13: EOBT must be a valid UTC HHMM time.');
  if (!/^[A-Z]{4}$/.test(data.arrival)) errors.push('Item 16: destination must be a 4-letter ICAO designator.');
  if (!isDurationHhmm(data.totalEet)) errors.push('Item 16: total EET must be HHMM (minutes 00–59).');
  if (data.alternate && !/^[A-Z]{4}$/.test(data.alternate)) errors.push('Item 16: alternate must be a 4-letter ICAO designator.');
  if (!['N','K','M'].includes(data.speedUnit)) errors.push('Item 15: invalid cruising speed unit.');
  const speedPattern = data.speedUnit === 'M' ? /^\d{3}$/ : /^\d{4}$/;
  if (!speedPattern.test(data.speedValue)) errors.push(`Item 15: ${data.speedUnit || 'speed'} value has an invalid format.`);
  if (!['F','A','S','M'].includes(data.levelUnit)) errors.push('Item 15: invalid cruising level unit.');
  const levelPattern = ['F','A'].includes(data.levelUnit) ? /^\d{3}$/ : /^\d{4}$/;
  if (!levelPattern.test(data.levelValue)) errors.push(`Item 15: ${data.levelUnit || 'level'} value has an invalid format.`);
  if (!data.route) errors.push('Item 15: route is empty.');

  if (data.dof && !/^\d{6}$/.test(data.dof)) errors.push('Item 18: DOF must be YYMMDD.');
  if (!data.dof) warnings.push('Item 18: DOF is blank. It is recommended for consistent VATSIM import/logging.');
  if (data.fuel && !isDurationHhmm(data.fuel)) errors.push('Item 19: fuel endurance must be HHMM (minutes 00–59).');
  if (!data.fuel) warnings.push('Item 19: fuel endurance is blank.');
  if (data.pbn && !data.equipment.includes('R')) warnings.push('Item 10a/PBN: PBN/ is present but Item 10a does not contain R. Verify the aircraft equipment declaration; use Custom Item 10a if R is applicable.');
  if (data.rmk && !/^RMK\//.test(data.rmk)) errors.push('Item 18: RMK must be encoded as RMK/<text>.');
  if ([data.rmk, data.com, data.orgn, data.opr, data.reg, data.nav, data.sur, data.sel, ...data.stayinfo].some(v => (v || '').includes(':'))) errors.push('VATSIM/FSD compatibility: colon (:) is not permitted in flight-plan text.');
  if (data.stayinfo.some(Boolean)) warnings.push('VATSIM compatibility: STAYINFO is a regional/IFPS-style Item 18 indicator and has had incomplete support in myVATSIM. Confirm that each STAYINFO field survives the import.');

  data.stays.forEach((stay, idx) => {
    if ((stay.wpt || (stay.seg && stay.seg !== 'NONE') || stay.dur) && !(stay.wpt && stay.seg && stay.seg !== 'NONE' && stay.dur)) {
      errors.push(`Item 15: STAY ${idx + 1} requires target WPT, STAY segment and duration.`);
    }
    if (stay.dur && !isDurationHhmm(stay.dur)) errors.push(`Item 15: STAY ${idx + 1} duration must be HHMM.`);
  });

  return {errors, warnings};
}

function renderIcaoValidation(errors, warnings, extraWarnings = []) {
  const el = document.getElementById('icaoValidationOutput');
  if (!el) return;
  const allWarnings = [...warnings, ...extraWarnings];
  if (!errors.length && !allWarnings.length) {
    el.innerHTML = '<div class="icao-audit-ok">✓ VATSIM IMPORT PREFLIGHT: READY — no structural issues detected.</div>';
    return;
  }
  let html = '';
  if (errors.length) {
    html += `<div class="icao-audit-error"><b>✕ ${errors.length} blocking issue${errors.length === 1 ? '' : 's'}</b><ul>${errors.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
  }
  if (allWarnings.length) {
    html += `<div class="icao-audit-warn"><b>⚠ ${allWarnings.length} review item${allWarnings.length === 1 ? '' : 's'}</b><ul>${allWarnings.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
  }
  el.innerHTML = html;
}

function generateIcaoFplString() {
  const data = collectIcaoFplData();
  const validation = validateIcaoFplData(data);
  const routeWarnings = [];
  const compiledRoute = compileIcaoRoute(data, routeWarnings);

  if (validation.errors.length) {
    renderIcaoValidation(validation.errors, validation.warnings, routeWarnings);
    const outputArea = document.getElementById('icaoOutput');
    if (outputArea) outputArea.value = '';
    return;
  }

  const item18 = [];
  if (data.pbn) item18.push(`PBN/${data.pbn}`);
  if (data.nav) item18.push(`NAV/${data.nav}`);
  if (data.sts) item18.push(`STS/${data.sts}`);
  if (data.sel) item18.push(`SEL/${data.sel}`);
  if (data.sur) item18.push(`SUR/${data.sur}`);
  if (data.per) item18.push(`PER/${data.per}`);
  if (data.dof) item18.push(`DOF/${data.dof}`);
  if (data.orgn) item18.push(`ORGN/${data.orgn}`);
  if (data.com) item18.push(`COM/${data.com}`);
  if (data.reg) item18.push(`REG/${data.reg}`);
  if (data.opr) item18.push(`OPR/${data.opr}`);
  data.stayinfo.forEach((value, i) => {
    if (value) item18.push(`STAYINFO${i + 1}/${value}`);
  });

  // RMK is deliberately last so free-text continuation cannot swallow later
  // structured Item 18 indicators in parsers that treat RMK as terminal text.
  let rmk = data.rmk;
  // V5.2 VATSIM compatibility: myVATSIM currently has no dedicated STS/
  // input in the legacy import form, so preserve the proper structured STS/
  // indicator above AND mirror it into RMK after the vNATO identifier.
  if (data.sts && !new RegExp('(?:^|\\s)STS/' + data.sts.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '(?:$|\\s)', 'i').test(rmk)) {
    rmk += ` STS/${data.sts}`;
  }
  if (data.trainee && !/\bVSO TRAINEE\b/i.test(rmk)) rmk += ' VSO TRAINEE';
  item18.push(rmk.trim());

  const speedLevel = `${data.speedUnit}${data.speedValue}${data.levelUnit}${data.levelValue}`;
  const lines = [
    `(FPL-${data.callsign}-${data.rules}${data.flightType}`,
    `-${data.aircraftType}/${data.wake}-${data.equipment}/${data.surveillance}`,
    `-${data.departure}${data.eobt}`,
    `-${speedLevel}${compiledRoute ? ' ' + compiledRoute : ''}`,
    `-${data.arrival}${data.totalEet}${data.alternate ? ' ' + data.alternate : ''}`,
    `-${item18.join(' ')}`
  ];

  if (data.fuel) lines.push(`-E/${data.fuel})`);
  else lines[lines.length - 1] += ')';

  const fplString = lines.join('\n');
  const outputArea = document.getElementById('icaoOutput');
  if (outputArea) outputArea.value = fplString;

  renderIcaoValidation([], validation.warnings, routeWarnings);
}

function newIcaoFlightPlan() {
  if (typeof resetForm === 'function') resetForm('icaoTab');
  const dof = document.getElementById('dof');
  if (dof) dof.value = '';
  const rmk = document.getElementById('icaoRmk');
  if (rmk) rmk.value = 'RMK/OAT VIRTUALNATO.ORG';
  const output = document.getElementById('icaoOutput');
  if (output) output.value = '';
  const audit = document.getElementById('icaoValidationOutput');
  if (audit) audit.innerHTML = '<div class="icao-audit-neutral">New flight plan cleared. Enter data and run Generate ICAO String.</div>';
}

// ============================================================================
// 4. PROFILE MANAGEMENT FUNCTIONS (MANAGEMENT MODAL & INDIVIDUAL DELETE)
// ============================================================================

function openManageProfilesModal() {
  renderProfilesListModal();
  const modal = document.getElementById('manageProfilesModal');
  if (modal) modal.style.display = 'block';
}

function closeManageProfilesModal() {
  const modal = document.getElementById('manageProfilesModal');
  if (modal) modal.style.display = 'none';
}

function renderProfilesListModal() {
  const container = document.getElementById('profilesListContainer');
  if (!container) return;

  let profiles = JSON.parse(localStorage.getItem('vnato_flight_profiles') || '{}');
  const keys = Object.keys(profiles);

  if (keys.length === 0) {
    container.innerHTML = '<div style="padding: 10px; text-align: center; font-size: 11px; color: #64748b;">No saved sortie profiles found.</div>';
    return;
  }

  let html = '';
  keys.forEach(name => {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; background: #fff; margin-bottom: 4px; border-radius: 4px;">
        <span style="font-size: 11px; font-weight: bold; color: #002B49; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px;">${name}</span>
        <button type="button" class="fpl-copy-btn" style="position: static; background: #ef4444; padding: 2px 6px; font-size: 10px;" onclick="deleteSingleProfile('${name}')">Delete</button>
      </div>
    `;
  });
  container.innerHTML = html;
}

function deleteSingleProfile(name) {
  if (confirm(`Are you sure you want to delete profile "${name}"?`)) {
    let profiles = JSON.parse(localStorage.getItem('vnato_flight_profiles') || '{}');
    delete profiles[name];
    localStorage.setItem('vnato_flight_profiles', JSON.stringify(profiles));
    
    renderProfilesListModal();
    if (typeof loadSavedProfilesList === 'function') {
      loadSavedProfilesList();
    }
  }
}

function clearAllProfiles() {
  if (confirm('Are you sure you want to wipe ALL saved sortie profiles? This action cannot be undone.')) {
    localStorage.removeItem('vnato_flight_profiles');
    renderProfilesListModal();
    if (typeof loadSavedProfilesList === 'function') {
      loadSavedProfilesList();
    }
  }
}
