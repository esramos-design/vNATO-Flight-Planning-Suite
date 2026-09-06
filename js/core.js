// js/core.js
function toggleHelp(id) {
  const box = document.getElementById(id);
  if (box) {
    box.classList.toggle('show');
  }
}

function switchFplMode(selectedTabId) {
  const tabs = ['routeTab', 'remarksTab', 'icaoTab'];
  tabs.forEach(tab => {
    const el = document.getElementById(tab);
    if (el) el.classList.remove('active');
  });

  const activeTab = document.getElementById(selectedTabId);
  if (activeTab) activeTab.classList.add('active');
}

function copyToClipboard(id) {
  const textarea = document.getElementById(id);
  if (!textarea || !textarea.value) return;
  
  navigator.clipboard.writeText(textarea.value).then(() => {
    textarea.style.backgroundColor = "#e6fffa";
    setTimeout(() => {
      textarea.style.backgroundColor = "#f8fafc";
    }, 400);
  });
}

function handleCountryChange() {
  const country = document.getElementById('countrySelect').value;
  const pdfLink = document.getElementById('manualPdfLink');
  
  if (pdfLink) {
    if (country === 'FR') {
      pdfLink.href = 'https://virtualnato.org/icrew/index.php/modernui#/documentation/document/146';
      pdfLink.textContent = '📄 Open France AIP Manual (DIRCAM/DGAC)';
    } else if (country === 'DE') {
      pdfLink.href = 'https://virtualnato.org/icrew/index.php/modernui#/documentation/document/147';
      pdfLink.textContent = '📄 Open Germany AIP Manual (Luftwaffe/BMVg)';
    } else if (country === 'UK') {
      pdfLink.href = 'https://virtualnato.org/icrew/index.php/modernui#/documentation/document/148';
      pdfLink.textContent = '📄 Open UK AIP Manual (RAF/MilAIP)';
    }
  }
}

// Toggle Manual Views (OAT Guide, Parameter Glossary, Equip & PBN Guide, METAR Helper, TAF Helper)
function toggleManualView(viewName) {
  const oatGuideBody = document.getElementById('oatGuideBody');
  const paramGlossaryBody = document.getElementById('paramGlossaryBody');
  const equipGuideBody = document.getElementById('equipGuideBody');
  const metarHelperBody = document.getElementById('metarHelperBody');
  const tafHelperBody = document.getElementById('tafHelperBody');
  
  const oatBtn = document.getElementById('oatGuideBtn');
  const paramBtn = document.getElementById('paramGlossaryBtn');
  const equipBtn = document.getElementById('equipGuideBtn');
  const helperBtn = document.getElementById('metarHelperBtn');
  const tafBtn = document.getElementById('tafHelperBtn');
  
  const titleEl = document.getElementById('rightPanelTitle');
  const allSubPanels = document.querySelectorAll('.sub-panel-content');
  const allToolButtons = document.querySelectorAll('.right-panel-btns .action-toggle-btn');

  // Hide calculation/weather panels if open
  allSubPanels.forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  allToolButtons.forEach(b => b.classList.remove('active'));

  // Hide all manual bodies
  [oatGuideBody, paramGlossaryBody, equipGuideBody, metarHelperBody, tafHelperBody].forEach(b => {
    if (b) { b.classList.remove('active'); b.style.display = 'none'; }
  });
  
  // Remove active state from manual buttons
  [oatBtn, paramBtn, equipBtn, helperBtn, tafBtn].forEach(b => { if (b) b.classList.remove('active'); });

  if (viewName === 'oatGuide') {
    if (oatGuideBody) { oatGuideBody.classList.add('active'); oatGuideBody.style.display = 'block'; }
    if (oatBtn) oatBtn.classList.add('active');
    if (titleEl) titleEl.textContent = 'Operational Air Traffic (OAT) Guide';
  } else if (viewName === 'paramGlossary') {
    if (paramGlossaryBody) { paramGlossaryBody.classList.add('active'); paramGlossaryBody.style.display = 'block'; }
    if (paramBtn) paramBtn.classList.add('active');
    if (titleEl) titleEl.textContent = 'Parameter Glossary';
  } else if (viewName === 'equipGuide') {
    if (equipGuideBody) { equipGuideBody.classList.add('active'); equipGuideBody.style.display = 'block'; }
    if (equipBtn) equipBtn.classList.add('active');
    if (titleEl) titleEl.textContent = 'Equipment, Transponder & PBN Reference Guide';
  } else if (viewName === 'metarHelper') {
    if (metarHelperBody) { metarHelperBody.classList.add('active'); metarHelperBody.style.display = 'block'; }
    if (helperBtn) helperBtn.classList.add('active');
    if (titleEl) titleEl.textContent = 'METAR Decoding & Reading Guide';
  } else if (viewName === 'tafHelper') {
    if (tafHelperBody) { tafHelperBody.classList.add('active'); tafHelperBody.style.display = 'block'; }
    if (tafBtn) tafBtn.classList.add('active');
    if (titleEl) titleEl.textContent = 'Terminal Aerodrome Forecast (TAF) Guide';
  }
}

// Toggle Right Panel Mode with Full Open/Close Toggle Support for Tool Buttons
function toggleRightPanelMode(mode) {
  const allSubPanels = document.querySelectorAll('.sub-panel-content');
  const oatGuideBody = document.getElementById('oatGuideBody');
  const paramGlossaryBody = document.getElementById('paramGlossaryBody');
  const equipGuideBody = document.getElementById('equipGuideBody');
  const metarHelperBody = document.getElementById('metarHelperBody');
  const tafHelperBody = document.getElementById('tafHelperBody');
  
  const allToolButtons = document.querySelectorAll('.right-panel-btns .action-toggle-btn');
  const oatBtn = document.getElementById('oatGuideBtn');
  const paramBtn = document.getElementById('paramGlossaryBtn');
  const equipBtn = document.getElementById('equipGuideBtn');
  const helperBtn = document.getElementById('metarHelperBtn');
  const tafBtn = document.getElementById('tafHelperBtn');
  
  const targetButton = document.getElementById(mode + 'ToggleBtn');
  const targetSubPanel = document.getElementById(mode + 'Body');
  const titleEl = document.getElementById('rightPanelTitle');
  
  const isAlreadyActive = targetButton && targetButton.classList.contains('active');

  // Reset all panels and tool buttons
  allSubPanels.forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  allToolButtons.forEach(b => b.classList.remove('active'));
  
  [oatGuideBody, paramGlossaryBody, equipGuideBody, metarHelperBody, tafHelperBody].forEach(b => {
    if (b) { b.classList.remove('active'); b.style.display = 'none'; }
  });
  
  [oatBtn, paramBtn, equipBtn, helperBtn, tafBtn].forEach(b => { if (b) b.classList.remove('active'); });

  if (isAlreadyActive) {
    if (oatGuideBody) {
      oatGuideBody.classList.add('active');
      oatGuideBody.style.display = 'block';
    }
    if (oatBtn) oatBtn.classList.add('active');
    if (titleEl) titleEl.textContent = 'Operational Air Traffic (OAT) Guide';
  } else {
    if (targetSubPanel) {
      targetSubPanel.classList.add('active');
      targetSubPanel.style.display = 'block';
    }
    if (targetButton) targetButton.classList.add('active');
    
    if (titleEl) {
      if (mode === 'metar') titleEl.textContent = 'METAR / TAF Weather Briefing';
      else if (mode === 'tod') titleEl.textContent = 'Top of Descent (TOD) Calculator';
      else if (mode === 'xwind') titleEl.textContent = 'Crosswind & Headwind Calculator';
      else if (mode === 'fuel') titleEl.textContent = 'Fuel Burn & ETE Estimator';
      else if (mode === 'da') titleEl.textContent = 'Density Altitude & Performance Indexer';
      else if (mode === 'oceanic') titleEl.textContent = 'Oceanic Report — VATSIM Live Position';
    }
  }
}

// Flanked Header Mission Clock Updater Function
function updateMissionClock() {
  const now = new Date();
  
  const utcHours = String(now.getUTCHours()).padStart(2, '0');
  const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
  const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
  
  const localHours = String(now.getHours()).padStart(2, '0');
  const localMinutes = String(now.getMinutes()).padStart(2, '0');
  const localSeconds = String(now.getSeconds()).padStart(2, '0');

  const headerClockZulu = document.getElementById('headerClockZulu');
  const headerClockLocal = document.getElementById('headerClockLocal');

  if (headerClockZulu) headerClockZulu.textContent = `${utcHours}:${utcMinutes}:${utcSeconds}`;
  if (headerClockLocal) headerClockLocal.textContent = `${localHours}:${localMinutes}:${localSeconds}`;
}

setInterval(updateMissionClock, 1000);

function resetForm(tabId) {
  const container = document.getElementById(tabId);
  if (!container) return;
  container.querySelectorAll('input[type="text"], textarea').forEach(input => {
    input.value = '';
  });
  container.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
  container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  const pbnDisplay = container.querySelector('[id$="PbnToggleText"]');
  if (pbnDisplay) pbnDisplay.textContent = 'Select PBN Capabilities...';
  container.querySelectorAll('input[type="hidden"]').forEach(input => input.value = '');

  // Restore intentional defaults after a clear operation. This prevents stale
  // aircraft/equipment data while keeping the standard vNATO RMK signature.
  if (tabId === 'icaoTab') {
    const rmk = document.getElementById('icaoRmk');
    if (rmk) rmk.value = 'RMK/OAT VIRTUALNATO.ORG';
    const flightType = document.getElementById('icaoType');
    if (flightType) flightType.value = 'M';
    const spdUnit = document.getElementById('icaoSpdUnit');
    if (spdUnit) spdUnit.value = 'N';
    const altUnit = document.getElementById('icaoAltUnit');
    if (altUnit) altUnit.value = 'F';
    const vfrMode = document.getElementById('icaoVfrInsertMode');
    if (vfrMode) vfrMode.value = 'AFTER';
    const ifrMode = document.getElementById('icaoIfrInsertMode');
    if (ifrMode) ifrMode.value = 'AFTER';
  }
}

function togglePbnDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('pbnDropdownList');
  if (dropdown) dropdown.classList.toggle('show');
}

function toggleIcaoPbnDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('icaoPbnDropdownList');
  if (dropdown) dropdown.classList.toggle('show');
}

function updatePbnSelection() {
  const checkboxes = document.querySelectorAll('#pbnDropdownList input[type="checkbox"]:checked');
  const selected = Array.from(checkboxes).map(cb => cb.value).join('');
  const hiddenInput = document.getElementById('pbnValue');
  const toggleText = document.getElementById('pbnToggleText');

  if (hiddenInput) hiddenInput.value = selected;
  if (toggleText) {
    toggleText.textContent = selected ? `PBN Selected: ${selected}` : 'Select PBN Capabilities...';
  }
}

function updateIcaoPbnSelection() {
  const checkboxes = document.querySelectorAll('#icaoPbnDropdownList input[type="checkbox"]:checked');
  const selected = Array.from(checkboxes).map(cb => cb.value).join('');
  const hiddenInput = document.getElementById('icaoPbnValue');
  const toggleText = document.getElementById('icaoPbnToggleText');

  if (hiddenInput) hiddenInput.value = selected;
  if (toggleText) {
    toggleText.textContent = selected ? `PBN Selected: ${selected}` : 'Select PBN Capabilities...';
  }
}

document.addEventListener('click', function(e) {
  const pbn1 = document.getElementById('pbnDropdownList');
  const pbn2 = document.getElementById('icaoPbnDropdownList');
  
  if (pbn1 && !e.target.closest('.pbn-dropdown-container')) {
    pbn1.classList.remove('show');
  }
  if (pbn2 && !e.target.closest('.pbn-dropdown-container')) {
    pbn2.classList.remove('show');
  }
});
