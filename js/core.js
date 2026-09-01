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

// Toggle Manual Views (OAT Guide, Parameter Glossary, METAR Helper, TAF Helper)
function toggleManualView(viewName) {
  const oatGuideBody = document.getElementById('oatGuideBody');
  const paramGlossaryBody = document.getElementById('paramGlossaryBody');
  const metarHelperBody = document.getElementById('metarHelperBody');
  const tafHelperBody = document.getElementById('tafHelperBody');
  
  const oatBtn = document.getElementById('oatGuideBtn');
  const paramBtn = document.getElementById('paramGlossaryBtn');
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
  [oatGuideBody, paramGlossaryBody, metarHelperBody, tafHelperBody].forEach(b => {
    if (b) { b.classList.remove('active'); b.style.display = 'none'; }
  });
  
  // Remove active state from manual buttons
  [oatBtn, paramBtn, helperBtn, tafBtn].forEach(b => { if (b) b.classList.remove('active'); });

  if (viewName === 'oatGuide') {
    if (oatGuideBody) { oatGuideBody.classList.add('active'); oatGuideBody.style.display = 'block'; }
    if (oatBtn) oatBtn.classList.add('active');
    if (titleEl) titleEl.textContent = 'Operational Air Traffic (OAT) Guide';
  } else if (viewName === 'paramGlossary') {
    if (paramGlossaryBody) { paramGlossaryBody.classList.add('active'); paramGlossaryBody.style.display = 'block'; }
    if (paramBtn) paramBtn.classList.add('active');
    if (titleEl) titleEl.textContent = 'Parameter Glossary';
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
  const metarHelperBody = document.getElementById('metarHelperBody');
  const tafHelperBody = document.getElementById('tafHelperBody');
  
  const allToolButtons = document.querySelectorAll('.right-panel-btns .action-toggle-btn');
  const oatBtn = document.getElementById('oatGuideBtn');
  const paramBtn = document.getElementById('paramGlossaryBtn');
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
  
  [oatGuideBody, paramGlossaryBody, metarHelperBody, tafHelperBody].forEach(b => {
    if (b) { b.classList.remove('active'); b.style.display = 'none'; }
  });
  
  [oatBtn, paramBtn, helperBtn, tafBtn].forEach(b => { if (b) b.classList.remove('active'); });

  if (isAlreadyActive) {
    // Second click: Close tool and return to default OAT Guide view
    if (oatGuideBody) {
      oatGuideBody.classList.add('active');
      oatGuideBody.style.display = 'block';
    }
    if (oatBtn) oatBtn.classList.add('active');
    if (titleEl) titleEl.textContent = 'Operational Air Traffic (OAT) Guide';
  } else {
    // First click: Open tool view and highlight button
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
      else if (mode === 'clock') titleEl.textContent = 'Zulu / UTC Mission Clock';
      else if (mode === 'da') titleEl.textContent = 'Density Altitude & Performance Indexer';
    }
  }
}

// Live Mission Clock Updater Function
function updateMissionClock() {
  const now = new Date();
  
  // UTC / Zulu Time
  const utcHours = String(now.getUTCHours()).padStart(2, '0');
  const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
  const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
  const utcDateStr = now.toUTCString().slice(0, 16);

  const clockZulu = document.getElementById('clockZulu');
  const dateZulu = document.getElementById('dateZulu');
  if (clockZulu) clockZulu.textContent = `${utcHours}:${utcMinutes}:${utcSeconds}`;
  if (dateZulu) dateZulu.textContent = utcDateStr;

  // Local System Time
  const localHours = String(now.getHours()).padStart(2, '0');
  const localMinutes = String(now.getMinutes()).padStart(2, '0');
  const localSeconds = String(now.getSeconds()).padStart(2, '0');
  const localDateStr = now.toDateString();

  const clockLocal = document.getElementById('clockLocal');
  const dateLocal = document.getElementById('dateLocal');
  if (clockLocal) clockLocal.textContent = `${localHours}:${localMinutes}:${localSeconds}`;
  if (dateLocal) dateLocal.textContent = localDateStr;

  // Custom Offset Time Calculation
  const offsetSelect = document.getElementById('clockOffset');
  const offsetHours = offsetSelect ? parseInt(offsetSelect.value, 10) || 0 : 0;
  
  const customTime = new Date(now.getTime() + (offsetHours * 3600000));
  const customH = String(customTime.getUTCHours()).padStart(2, '0');
  const customM = String(customTime.getUTCMinutes()).padStart(2, '0');
  const customS = String(customTime.getUTCSeconds()).padStart(2, '0');

  const resCustomOffsetTime = document.getElementById('resCustomOffsetTime');
  if (resCustomOffsetTime) {
    resCustomOffsetTime.textContent = `${customH}:${customM}:${customS} UTC`;
  }
}

// Start the live mission clock ticker immediately upon load
setInterval(updateMissionClock, 1000);

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
