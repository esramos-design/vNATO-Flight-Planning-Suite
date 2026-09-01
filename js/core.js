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

// Toggle Manual Views (OAT Guide vs Parameter Glossary)
function toggleManualView(viewName) {
  const oatGuideBody = document.getElementById('oatGuideBody');
  const paramGlossaryBody = document.getElementById('paramGlossaryBody');
  const oatBtn = document.getElementById('oatGuideBtn');
  const paramBtn = document.getElementById('paramGlossaryBtn');
  const titleEl = document.getElementById('rightPanelTitle');
  const allSubPanels = document.querySelectorAll('.sub-panel-content');
  const allToolButtons = document.querySelectorAll('.right-panel-btns .action-toggle-btn');

  // Hide calculation/weather panels if open
  allSubPanels.forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  allToolButtons.forEach(b => b.classList.remove('active'));

  if (viewName === 'oatGuide') {
    if (oatGuideBody) {
      oatGuideBody.classList.add('active');
      oatGuideBody.style.display = 'block';
    }
    if (paramGlossaryBody) {
      paramGlossaryBody.classList.remove('active');
      paramGlossaryBody.style.display = 'none';
    }
    if (oatBtn) oatBtn.classList.add('active');
    if (paramBtn) paramBtn.classList.remove('active');
    if (titleEl) titleEl.textContent = 'Operational Air Traffic (OAT) Guide';
  } else if (viewName === 'paramGlossary') {
    if (paramGlossaryBody) {
      paramGlossaryBody.classList.add('active');
      paramGlossaryBody.style.display = 'block';
    }
    if (oatGuideBody) {
      oatGuideBody.classList.remove('active');
      oatGuideBody.style.display = 'none';
    }
    if (paramBtn) paramBtn.classList.add('active');
    if (oatBtn) oatBtn.classList.remove('active');
    if (titleEl) titleEl.textContent = 'Parameter Glossary';
  }
}

// Toggle Right Panel Mode with Full Open/Close Toggle Support for Tool Buttons
function toggleRightPanelMode(mode) {
  const allSubPanels = document.querySelectorAll('.sub-panel-content');
  const oatGuideBody = document.getElementById('oatGuideBody');
  const paramGlossaryBody = document.getElementById('paramGlossaryBody');
  const allToolButtons = document.querySelectorAll('.right-panel-btns .action-toggle-btn');
  const oatBtn = document.getElementById('oatGuideBtn');
  const paramBtn = document.getElementById('paramGlossaryBtn');
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
  if (oatGuideBody) {
    oatGuideBody.classList.remove('active');
    oatGuideBody.style.display = 'none';
  }
  if (paramGlossaryBody) {
    paramGlossaryBody.classList.remove('active');
    paramGlossaryBody.style.display = 'none';
  }
  if (oatBtn) oatBtn.classList.remove('active');
  if (paramBtn) paramBtn.classList.remove('active');

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
