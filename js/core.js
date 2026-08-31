// --- LAYER 1 & 2: SECURITY & ACCESS PROTECTIONS ---
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  alert('Protected Asset: Right-click is disabled for Virtual NATO proprietary assets.');
});

document.addEventListener('keydown', function(e) {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
    (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'c' || e.key === 'a'))
  ) {
    e.preventDefault();
    alert('Protected Asset: This function is restricted.');
  }
});

function verifyPilotAccess() {
  const correctPassword = "vNATO@2026";
  const userPrompt = prompt("🔒 Restricted Access: Enter the Virtual NATO Pilot Passcode:");
  
  if (userPrompt !== correctPassword) {
    alert("Access Denied. Incorrect passcode.");
    document.body.innerHTML = "<h2 style='text-align:center; margin-top:20vh; color:#d9534f;'>Access Denied. Authorized Virtual NATO Personnel Only.</h2>";
    throw new Error("Unauthorized access attempt.");
  }
}
verifyPilotAccess();

function toggleHelp(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.toggle('show');
  }
}

function togglePbnDropdown(e) {
  e.stopPropagation();
  document.getElementById('pbnDropdownList').classList.toggle('show');
}

function toggleIcaoPbnDropdown(e) {
  e.stopPropagation();
  document.getElementById('icaoPbnDropdownList').classList.toggle('show');
}

window.addEventListener('click', function(e) {
  if (!e.target.closest('.pbn-dropdown-container')) {
    const pbnList = document.getElementById('pbnDropdownList');
    const icaoPbnList = document.getElementById('icaoPbnDropdownList');
    if (pbnList) pbnList.classList.remove('show');
    if (icaoPbnList) icaoPbnList.classList.remove('show');
  }
});

function updatePbnSelection() {
  const container = document.getElementById('remarksTab');
  const checkboxes = container.querySelectorAll('#pbnDropdownList input[type="checkbox"]:checked');
  let values = [];
  checkboxes.forEach(cb => values.push(cb.value));
  
  const hiddenInput = document.getElementById('pbnValue');
  const toggleText = document.getElementById('pbnToggleText');
  
  if (values.length > 0) {
    const concatenated = values.join('');
    hiddenInput.value = concatenated;
    toggleText.textContent = concatenated;
  } else {
    hiddenInput.value = '';
    toggleText.textContent = 'Select PBN Capabilities...';
  }
}

function updateIcaoPbnSelection() {
  const container = document.getElementById('icaoTab');
  const checkboxes = container.querySelectorAll('#icaoPbnDropdownList input[type="checkbox"]:checked');
  let values = [];
  checkboxes.forEach(cb => values.push(cb.value));
  
  const hiddenInput = document.getElementById('icaoPbnValue');
  const toggleText = document.getElementById('icaoPbnToggleText');
  
  if (values.length > 0) {
    const concatenated = values.join('');
    hiddenInput.value = concatenated;
    toggleText.textContent = concatenated;
  } else {
    hiddenInput.value = '';
    toggleText.textContent = 'Select PBN Capabilities...';
  }
}

function toggleThreeColumnLayout(isChecked) {
  const docBody = document.getElementById('docBody');
  if (isChecked) {
    docBody.classList.add('three-col');
    docBody.innerHTML = `
      <div class="doc-column-card">
        <h3>Route Generator Parameters</h3>
        <ul>
          <li><b>DOF:</b> Flight date (YYMMDD)</li>
          <li><b>Rules/Type:</b> IFR/VFR/Tactical & Military</li>
          <li><b>Speed/Alt:</b> N0450F245 formatting</li>
          <li><b>GAT/OAT:</b> Transition waypoints</li>
          <li><b>STAY1-3:</b> Low-flying/AAR working delays</li>
        </ul>
      </div>
      <div class="doc-column-card">
        <h3>Remarks Generator Parameters</h3>
        <ul>
          <li><b>WAK/:</b> Wake turbulence category</li>
          <li><b>PBN/:</b> Multi-selected RNAV/RNP codes (concatenated, no spaces)</li>
          <li><b>STS/:</b> Special handling indicators (STATE, SAR, MARSA, etc.)</li>
          <li><b>SEL/SUR/PER:</b> SELCAL, surveillance & performance</li>
          <li><b>ORGN/COM:</b> Originator & comms specs</li>
          <li><b>REG/OPR/FUEL:</b> Registration, operator & fuel</li>
        </ul>
      </div>
      <div class="doc-column-card">
        <h3>Descriptions & Manual</h3>
        <p><b>OAT Operational Standards:</b> Direct integration across European and UK airspace protocols. For France, OAT appears at the beginning of the remarks field.</p>
        <a href="https://virtualnato.org/icrew/index.php/modernui#/documentation/document/146" target="_blank" class="manual-link-btn" style="display:inline-block; margin-top:10px;">📄 Open Country PDF Manual</a>
      </div>
    `;
  } else {
    docBody.classList.remove('three-col');
    location.reload();
  }
}

let activeRightTab = 'manual';
let clockInterval = null;

function toggleRightPanelMode(targetMode) {
  const docBody = document.getElementById('docBody');
  const metarBody = document.getElementById('metarBody');
  const todBody = document.getElementById('todBody');
  const xwindBody = document.getElementById('xwindBody');
  const fuelBody = document.getElementById('fuelBody');
  const clockBody = document.getElementById('clockBody');
  const daBody = document.getElementById('daBody');

  const titleEl = document.getElementById('rightPanelTitle');
  const metarBtn = document.getElementById('metarToggleBtn');
  const todBtn = document.getElementById('todToggleBtn');
  const xwindBtn = document.getElementById('xwindToggleBtn');
  const fuelBtn = document.getElementById('fuelToggleBtn');
  const clockBtn = document.getElementById('clockToggleBtn');
  const daBtn = document.getElementById('daToggleBtn');
  const threeColToggleContainer = document.getElementById('docColumnsToggleContainer');

  if (activeRightTab === targetMode) {
    activeRightTab = 'manual';
  } else {
    activeRightTab = targetMode;
  }

  docBody.classList.remove('active');
  metarBody.classList.remove('active');
  todBody.classList.remove('active');
  xwindBody.classList.remove('active');
  fuelBody.classList.remove('active');
  clockBody.classList.remove('active');
  daBody.classList.remove('active');
  threeColToggleContainer.style.display = 'none';

  metarBtn.textContent = '🌦️ WX';
  todBtn.textContent = '📉 TOD';
  xwindBtn.textContent = '💨 X-Wind';
  fuelBtn.textContent = '⛽ ETE/Fuel';
  clockBtn.textContent = '🕒 UTC Clock';
  daBtn.textContent = '🌡️ Density Alt';

  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }

  if (activeRightTab === 'metar') {
    metarBody.classList.add('active');
    titleEl.textContent = 'Aerodrome Weather (METAR & TAF)';
    metarBtn.textContent = '📖 Back to Manual';
    fetchMetarTaf();
  } else if (activeRightTab === 'tod') {
    todBody.classList.add('active');
    titleEl.textContent = 'Top of Descent (TOD) Calculator';
    todBtn.textContent = '📖 Back to Manual';
    calculateTod();
  } else if (activeRightTab === 'xwind') {
    xwindBody.classList.add('active');
    titleEl.textContent = 'Crosswind & Headwind Calculator';
    xwindBtn.textContent = '📖 Back to Manual';
    calculateXwind();
  } else if (activeRightTab === 'fuel') {
    fuelBody.classList.add('active');
    titleEl.textContent = 'Fuel Burn & ETE Estimator';
    fuelBtn.textContent = '📖 Back to Manual';
    calculateFuelEte();
  } else if (activeRightTab === 'clock') {
    clockBody.classList.add('active');
    titleEl.textContent = 'UTC / Zulu Time Converter & Mission Clock';
    clockBtn.textContent = '📖 Back to Manual';
    updateMissionClock();
    clockInterval = setInterval(updateMissionClock, 1000);
  } else if (activeRightTab === 'da') {
    daBody.classList.add('active');
    titleEl.textContent = 'Density Altitude & Performance Indexer';
    daBtn.textContent = '📖 Back to Manual';
    calculateDensityAltitude();
  } else {
    docBody.classList.add('active');
    titleEl.textContent = 'Operational Air Traffic (OAT) Manual';
    threeColToggleContainer.style.display = 'flex';
  }
}

function switchFplMode(selectedTabId) {
  const contents = document.querySelectorAll('.fpl-tab-content');
  contents.forEach(c => c.classList.remove('active'));
  document.getElementById(selectedTabId).classList.add('active');
}

function updateDefaultOpr() {
  const country = document.getElementById('countrySelect').value;
  const oprSelect = document.getElementById('opr');
  if (country === 'UK') {
    oprSelect.value = '29 SQN ROYAL AIR FORCE';
  } else if (country === 'DE') {
    oprSelect.value = 'GAF';
  } else if (country === 'FR') {
    oprSelect.value = 'FAF';
  }
}

function updateManualLink() {
  const country = document.getElementById('countrySelect').value;
  const linkEl = document.getElementById('manualPdfLink');
  
  if (country === 'FR') {
    linkEl.href = 'https://virtualnato.org/icrew/index.php/modernui#/documentation/document/146';
  } else if (country === 'DE') {
    linkEl.href = 'https://virtualnato.org/icrew/index.php/modernui#/documentation/document/115';
  } else if (country === 'UK') {
    linkEl.href = 'https://virtualnato.org/icrew/index.php/currentui#/documentation/document/130';
  }
}

function handleCountryChange() {
  updateDefaultOpr();
  updateManualLink();
  
  const countrySelect = document.getElementById('countrySelect');
  if (!['FR', 'DE', 'UK'].includes(countrySelect.value)) {
    countrySelect.value = 'FR';
    updateDefaultOpr();
    updateManualLink();
  }
}

function copyToClipboard(elementId) {
  const textarea = document.getElementById(elementId);
  if (!textarea.value) return;
  textarea.select();
  navigator.clipboard.writeText(textarea.value);
}