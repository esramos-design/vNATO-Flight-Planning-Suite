// ============================================================================
// VIRTUAL NATO FLIGHT PLANNING SUITE - GENERATORS.JS (V5.0.8.ALPHA)
// Operational Air Traffic (OAT) & Tactical Dispatch System
// ============================================================================

// Switch between generator tabs/modes
function switchFplMode(modeId) {
  const contents = document.querySelectorAll('.fpl-tab-content');
  contents.forEach(c => c.classList.remove('active'));
  
  const targetTab = document.getElementById(modeId);
  if (targetTab) {
    targetTab.classList.add('active');
  }
}

// Helper: Copy content to clipboard
function copyToClipboard(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.select();
  el.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(el.value).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

// Reset form fields within a specified tab
function resetForm(tabId) {
  const tab = document.getElementById(tabId);
  if (!tab) return;
  const inputs = tab.querySelectorAll('input:not([type="checkbox"]), textarea');
  inputs.forEach(input => input.value = '');
  const selects = tab.querySelectorAll('select');
  selects.forEach(select => select.selectedIndex = 0);
  const checkboxes = tab.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
}

// PBN Dropdown toggles & selection updaters
function togglePbnDropdown(e) {
  if (e) e.stopPropagation();
  const list = document.getElementById('pbnDropdownList');
  if (list) {
    list.style.display = list.style.display === 'block' ? 'none' : 'block';
  }
}

function updatePbnSelection() {
  const checkboxes = document.querySelectorAll('#pbnDropdownList input[type="checkbox"]:checked');
  const values = Array.from(checkboxes).map(cb => cb.value);
  const pbnValInput = document.getElementById('pbnValue');
  const toggleText = document.getElementById('pbnToggleText');
  
  if (pbnValInput) pbnValInput.value = values.join('');
  if (toggleText) {
    toggleText.textContent = values.length > 0 ? values.join('') : 'Select PBN Capabilities...';
  }
}

function toggleIcaoPbnDropdown(e) {
  if (e) e.stopPropagation();
  const list = document.getElementById('icaoPbnDropdownList');
  if (list) {
    list.style.display = list.style.display === 'block' ? 'none' : 'block';
  }
}

function updateIcaoPbnSelection() {
  const checkboxes = document.querySelectorAll('#icaoPbnDropdownList input[type="checkbox"]:checked');
  const values = Array.from(checkboxes).map(cb => cb.value);
  const pbnValInput = document.getElementById('icaoPbnValue');
  const toggleText = document.getElementById('icaoPbnToggleText');
  
  if (pbnValInput) pbnValInput.value = values.join('');
  if (toggleText) {
    toggleText.textContent = values.length > 0 ? values.join('') : 'Select PBN Capabilities...';
  }
}

window.addEventListener('click', () => {
  const pbnList = document.getElementById('pbnDropdownList');
  if (pbnList) pbnList.style.display = 'none';
  const icaoPbnList = document.getElementById('icaoPbnDropdownList');
  if (icaoPbnList) icaoPbnList.style.display = 'none';
});

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
  if (oatToGat) routeParts.push(oatToGat);

  for (let i = 1; i <= 3; i++) {
    const sWpt = document.getElementById(`stayWpt${i}`)?.value.trim();
    const sSeg = document.getElementById(`staySeg${i}`)?.value;
    const sDur = document.getElementById(`stayDur${i}`)?.value.trim();
    if (sWpt && sSeg && sSeg !== 'NONE' && sDur) {
      routeParts.push(`${sWpt} ${sSeg}/${sDur}`);
    }
  }

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
// 3. VATSIM - IMPORT ICAO FPL GENERATOR (V5.0.8.ALPHA PATCHED)
// ============================================================================
function generateIcaoFplString() {
  const rules = document.getElementById('icaoRules').value || 'I';
  const flightType = document.getElementById('icaoType').value || 'M';
  const callsign = document.getElementById('fplCallsign').value.trim().toUpperCase() || 'NATO01';
  
  const spdUnit = document.getElementById('icaoSpdUnit').value || 'N';
  const spdVal = document.getElementById('icaoSpdVal').value.trim() || '0450';
  const cruisingSpeed = spdUnit + spdVal;

  const altUnit = document.getElementById('icaoAltUnit').value || 'F';
  const altVal = document.getElementById('icaoAltVal').value.trim() || '245';
  const cruisingLevel = altUnit + altVal;

  const acftType = document.getElementById('fplAcftType').value.trim().toUpperCase() || 'FA18';
  const wake = document.getElementById('icaoWake').value || 'M';
  const equip = document.getElementById('icaoEquip').value || 'SDE3G';
  const trans = document.getElementById('icaoTrans').value || 'S';

  const dep = document.getElementById('fplDep').value.trim().toUpperCase() || 'LFBO';
  const eobt = document.getElementById('fplEobt').value.trim() || '1200';
  const arr = document.getElementById('fplArr').value.trim().toUpperCase() || 'LFMI';
  const eetArr = document.getElementById('fplEetArr').value.trim() || '0100';
  const altAerodrome = document.getElementById('fplAlt').value.trim().toUpperCase();

  const routeFixes = document.getElementById('icaoRoute').value.trim();
  const gatToOat = document.getElementById('icaoGatToOat').value.trim();
  const oatToGat = document.getElementById('icaoOatToGat').value.trim();
  const vfrWpt = document.getElementById('icaoVfrTransWpt').value.trim();
  const vfrType = document.getElementById('icaoVfrTransType').value;
  const vfrParams = document.getElementById('icaoVfrTransParams').value.trim();
  const ifrWpt = document.getElementById('icaoIfrTransWpt').value.trim();
  const ifrType = document.getElementById('icaoIfrTransType').value;
  const ifrParams = document.getElementById('icaoIfrTransParams').value.trim();

  let routeParts = [];
  if (gatToOat) routeParts.push(gatToOat);
  if (vfrWpt && vfrType) {
    routeParts.push(`${vfrWpt} ${vfrType}${vfrParams ? ' ' + vfrParams : ''}`);
  }
  if (ifrWpt && ifrType) {
    routeParts.push(`${ifrWpt} ${ifrType}${ifrParams ? ' ' + ifrParams : ''}`);
  }
  if (routeFixes) routeParts.push(routeFixes);
  if (oatToGat) routeParts.push(oatToGat);

  for (let i = 1; i <= 3; i++) {
    const sWpt = document.getElementById(`icaoStayWpt${i}`)?.value.trim();
    const sSeg = document.getElementById(`icaoStaySeg${i}`)?.value;
    const sDur = document.getElementById(`icaoStayDur${i}`)?.value.trim();
    if (sWpt && sSeg && sSeg !== 'NONE' && sDur) {
      routeParts.push(`${sWpt} ${sSeg}/${sDur}`);
    }
  }

  const compiledRoute = routeParts.join(' ');

  let fplString = `(FPL-${callsign}-${rules}${flightType}\n`;
  fplString += `-${acftType}/${wake}-${equip}/${trans}\n`;
  fplString += `-${dep}${eobt}\n`;
  fplString += `-${cruisingSpeed}${cruisingLevel}${compiledRoute ? ' ' + compiledRoute : ''}\n`;
  fplString += `-${arr}${eetArr}${altAerodrome ? ' ' + altAerodrome : ''}\n`;
  
  let remarksList = [];
  const pbn = document.getElementById('icaoPbnValue').value;
  if (pbn) remarksList.push(`PBN/${pbn}`);
  
  const nav = document.getElementById('icaoNav').value;
  if (nav) remarksList.push(`NAV/${nav}`);
  
  const sts = document.getElementById('icaoSts').value;
  if (sts) remarksList.push(`STS/${sts}`);

  const sel = document.getElementById('icaoSel').value.trim();
  if (sel) remarksList.push(`SEL/${sel}`);

  const sur = document.getElementById('icaoSur').value.trim();
  if (sur) remarksList.push(`SUR/${sur}`);
  
  const per = document.getElementById('icaoPer').value;
  if (per) remarksList.push(`PER/${per}`);
  
  const orgn = document.getElementById('icaoOrgn').value.trim();
  if (orgn) remarksList.push(`ORGN/${orgn}`);

  const com = document.getElementById('icaoCom').value.trim();
  if (com) remarksList.push(`COM/${com}`);
  
  const reg = document.getElementById('icaoReg').value.trim();
  if (reg) remarksList.push(`REG/${reg}`);
  
  const opr = document.getElementById('icaoOpr').value.trim();
  if (opr) remarksList.push(`OPR/${opr}`);

  const fuel = document.getElementById('icaoFuel').value.trim();
  if (fuel) remarksList.push(`-E/${fuel}`);

  for (let i = 1; i <= 3; i++) {
    const sInfo = document.getElementById(`icaoStayinfo${i}`)?.value.trim();
    if (sInfo) remarksList.push(`STAYINFO${i}/${sInfo}`);
  }

  const customRmk = document.getElementById('icaoRmk').value.trim() || 'RMK/OAT VIRTUALNATO.ORG';
  remarksList.push(customRmk);

  if (document.getElementById('icaoVsoTrainee')?.checked) {
    remarksList.push('VSO TRAINEE');
  }

  fplString += `-${remarksList.join(' ')}`;

  const outputArea = document.getElementById('icaoOutput');
  if (outputArea) {
    outputArea.value = fplString;
  }
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
