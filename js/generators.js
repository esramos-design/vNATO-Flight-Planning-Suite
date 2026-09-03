// Helper functions for data extraction and formatting
function getVal(id, defaultVal = "") {
  const el = document.getElementById(id);
  return el && el.value.trim() !== "" ? el.value.trim() : defaultVal;
}

function formatTransferPoint(val) {
  if (!val) return "";
  // Removes slashes to comply with Bruno's specific OAT transfer formatting request (e.g., LMG OAT V N0240A010)
  return val.replace(/\//g, ' ');
}

// SWIFT Route Generator
function generateRouteString() {
  const country = getVal('countrySelect');
  let route = getVal('route').toUpperCase();
  const gatToOat = formatTransferPoint(getVal('gatToOat').toUpperCase());
  const oatToGat = formatTransferPoint(getVal('oatToGat').toUpperCase());
  const vfrTrans = formatTransferPoint(getVal('vfrTrans').toUpperCase());
  const ifrTrans = formatTransferPoint(getVal('ifrTrans').toUpperCase());

  // Inject STAY points at target waypoints
  for (let i = 1; i <= 3; i++) {
    const staySeg = getVal(`staySeg${i}`);
    const stayDur = getVal(`stayDur${i}`);
    const stayWpt = getVal(`stayWpt${i}`).toUpperCase();

    if (staySeg !== 'NONE' && stayDur) {
      const stayStr = `${staySeg}/${stayDur}`;
      if (stayWpt) {
        const regex = new RegExp(`\\b${stayWpt}\\b`, 'g');
        if (route.match(regex)) {
          route = route.replace(regex, `${stayWpt} ${stayStr}`);
        } else {
          route += ` ${stayWpt} ${stayStr}`; // Append if target not found
        }
      } else {
        route += ` ${stayStr}`; // Append if no target specified
      }
    }
  }

  let routeParts = [];

  if (country === 'DE' || country === 'UK') {
    if (!route.startsWith('OAT')) {
      routeParts.push('OAT');
    }
  }

  if (gatToOat) routeParts.push(gatToOat);
  if (route) routeParts.push(route);
  if (oatToGat) routeParts.push(oatToGat);
  if (vfrTrans) routeParts.push(vfrTrans);
  if (ifrTrans) routeParts.push(ifrTrans);

  const finalRoute = routeParts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  const outputBox = document.getElementById('routeOutput');
  if (outputBox) outputBox.value = finalRoute;
}

// SWIFT Remarks Generator
function generateRemarksString() {
  const pbn = getVal('pbnValue');
  const nav = getVal('nav');
  const sts = getVal('sts');
  const sel = getVal('sel').toUpperCase();
  const sur = getVal('sur').toUpperCase();
  const per = getVal('per').toUpperCase();
  const oragn = getVal('oragn').toUpperCase();
  const com = getVal('com').toUpperCase();
  const reg = getVal('reg').toUpperCase();
  const opr = getVal('opr');
  const eet = getVal('eet').toUpperCase();
  
  const stayinfo = getVal('stayinfo').toUpperCase();
  const rmkOat = getVal('rmkOat');
  const vso = getVal('vso').toUpperCase();
  const vsoTrainee = document.getElementById('vsoTrainee')?.checked;

  let remarksList = [];

  // FIXED: Removed WAK and Field 10 COM/Equipment mapping to Item 18 to stop jamming.
  if (pbn) remarksList.push(`PBN/${pbn}`);
  if (nav) remarksList.push(`NAV/${nav}`);
  if (sts) remarksList.push(`STS/${sts}`);
  if (sel) remarksList.push(`SEL/${sel}`);
  if (sur) remarksList.push(`SUR/${sur}`);
  if (per) remarksList.push(`PER/${per}`);
  if (oragn) remarksList.push(`ORGN/${oragn}`);
  if (com) remarksList.push(`COM/${com}`); // Only supplementary comms here
  if (reg) remarksList.push(`REG/${reg}`);
  if (opr) remarksList.push(`OPR/${opr}`);
  if (eet) remarksList.push(`EET/${eet}`);

  const stayDur1 = getVal('stayDur1');
  const stayDur2 = getVal('stayDur2');
  const stayDur3 = getVal('stayDur3');
  const baseStayInfo = stayinfo || 'MILITARY OPERATION WORK AREA';

  if (stayDur1) remarksList.push(`STAYINFO1/${baseStayInfo}`);
  if (stayDur2) remarksList.push(`STAYINFO2/${baseStayInfo}`);
  if (stayDur3) remarksList.push(`STAYINFO3/${baseStayInfo}`);

  let rmkString = [];
  if (rmkOat) rmkString.push(rmkOat);
  if (vso) rmkString.push(vso);
  if (vsoTrainee) rmkString.push('VSO TRAINEE');
  
  if (rmkString.length > 0) remarksList.push(rmkString.join(' '));

  const finalRemarks = remarksList.filter(Boolean).join(' ');
  const outputBox = document.getElementById('remarksOutput');
  if (outputBox) outputBox.value = finalRemarks;
}

// vPILOT FPL String Generator (Handles VATSIM rule restriction 'T' -> 'I' fallback)
function generateIcaoFplString() {
  let rules = getVal('icaoRules', 'I');
  if (rules === 'T') {
    rules = 'I'; 
  }

  const type = getVal('icaoType', 'M');
  const spdUnit = getVal('icaoSpdUnit', 'N');
  const spdVal = getVal('icaoSpdVal', '0000').toUpperCase();
  const altUnit = getVal('icaoAltUnit', 'F');
  const altVal = getVal('icaoAltVal', '000').toUpperCase();
  const callsign = getVal('fplCallsign', 'NATO01').toUpperCase();
  const acftType = getVal('fplAcftType', 'ZZZZ').toUpperCase();
  
  const wake = getVal('icaoWake', 'M');
  const equip = getVal('icaoEquip', 'S');
  const trans = getVal('icaoTrans', 'C');
  
  const dep = getVal('fplDep', 'LFMI').toUpperCase();
  const eobt = getVal('fplEobt', '0000').toUpperCase();
  const arr = getVal('fplArr', 'LFBM').toUpperCase();
  const eetArr = getVal('fplEetArr', '0000').toUpperCase();
  const altAerodrome = getVal('fplAlt').toUpperCase();

  let route = getVal('icaoRoute').toUpperCase();
  const gatToOat = formatTransferPoint(getVal('icaoGatToOat').toUpperCase());
  const oatToGat = formatTransferPoint(getVal('icaoOatToGat').toUpperCase());
  const vfrTrans = formatTransferPoint(getVal('icaoVfrTrans').toUpperCase());
  const ifrTrans = formatTransferPoint(getVal('icaoIfrTrans').toUpperCase());

  // Inject STAY points at target waypoints
  for (let i = 1; i <= 3; i++) {
    const staySeg = getVal(`icaoStaySeg${i}`);
    const stayDur = getVal(`icaoStayDur${i}`);
    const stayWpt = getVal(`icaoStayWpt${i}`).toUpperCase();

    if (staySeg !== 'NONE' && stayDur) {
      const stayStr = `${staySeg}/${stayDur}`;
      if (stayWpt) {
        const regex = new RegExp(`\\b${stayWpt}\\b`, 'g');
        if (route.match(regex)) {
          route = route.replace(regex, `${stayWpt} ${stayStr}`);
        } else {
          route += ` ${stayWpt} ${stayStr}`; 
        }
      } else {
        route += ` ${stayStr}`; 
      }
    }
  }

  let routeParts = [];
  const country = getVal('countrySelect');
  if (country === 'DE' || country === 'UK') {
    if (!route.startsWith('OAT')) {
      routeParts.push('OAT');
    }
  }

  if (gatToOat) routeParts.push(gatToOat);
  if (route) routeParts.push(route);
  if (oatToGat) routeParts.push(oatToGat);
  if (vfrTrans) routeParts.push(vfrTrans);
  if (ifrTrans) routeParts.push(ifrTrans);

  const finalRoute = routeParts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

  const pbn = getVal('icaoPbnValue');
  const nav = getVal('icaoNav');
  const sts = getVal('icaoSts');
  const sel = getVal('icaoSel').toUpperCase();
  const sur = getVal('icaoSur').toUpperCase();
  const per = getVal('icaoPer').toUpperCase();
  const oragn = getVal('icaoOrgn').toUpperCase();
  const com = getVal('icaoCom').toUpperCase();
  const reg = getVal('icaoReg').toUpperCase();
  const opr = getVal('icaoOpr').toUpperCase();
  const eetItem18 = getVal('icaoEet').toUpperCase(); 
  
  const fuelEnd = getVal('icaoFuel', '0200');
  const customStayinfo = getVal('icaoStayinfo').toUpperCase();
  // Fixed RMK to populate Virtual NATO default automatically if left blank
  const customRmk = getVal('icaoRmk', 'RMK/OAT VIRTUALNATO.ORG').toUpperCase();
  const vsoTrainee = document.getElementById('icaoVsoTrainee')?.checked;

  let item18List = [];

  // FIXED: No WAK or primary EQUIP appended to Item 18. Fixes Bruno's jam error.
  if (pbn) item18List.push(`PBN/${pbn}`);
  if (nav) item18List.push(`NAV/${nav}`);
  if (sts) item18List.push(`STS/${sts}`);
  if (sel) item18List.push(`SEL/${sel}`);
  if (sur) item18List.push(`SUR/${sur}`);
  if (per) item18List.push(`PER/${per}`);
  if (oragn) item18List.push(`ORGN/${oragn}`);
  if (com) item18List.push(`COM/${com}`);
  if (reg) item18List.push(`REG/${reg}`);
  if (opr) item18List.push(`OPR/${opr}`);
  if (eetItem18) item18List.push(`EET/${eetItem18}`); // FIXED: Separated Fuel Endurance from EET/

  const stayDur1 = getVal('icaoStayDur1');
  const stayDur2 = getVal('icaoStayDur2');
  const stayDur3 = getVal('icaoStayDur3');
  
  if (stayDur1) item18List.push(`STAYINFO1/${customStayinfo || 'MILITARY OPERATION'}`);
  if (stayDur2) item18List.push(`STAYINFO2/${customStayinfo || 'MILITARY OPERATION'}`);
  if (stayDur3) item18List.push(`STAYINFO3/${customStayinfo || 'MILITARY OPERATION'}`);

  let rmkString = [];
  if (customRmk) rmkString.push(customRmk);
  if (vsoTrainee) rmkString.push('VSO TRAINEE');
  
  if (rmkString.length > 0) item18List.push(rmkString.join(' '));

  const item18Str = item18List.length > 0 ? '-' + item18List.join(' ') : '';
  const altStr = altAerodrome ? ` ${altAerodrome}` : '';
  const speedAltBlock = `${spdUnit}${spdVal}${altUnit}${altVal}`;
  
  // FIXED: Removes hardcoded RFAL and builds proper Acft/Wake-Equip/Trans strings in Item 9/10
  const item9_10 = `-${acftType}/${wake}-${equip}/${trans}`;

  const fplString = `(FPL-${callsign}-${rules}${type}
${item9_10}
-${dep}${eobt}
-${speedAltBlock} ${finalRoute}
-${arr}${eetArr}${altStr}
${item18Str}
-E/${fuelEnd})`;

  const outputBox = document.getElementById('icaoOutput');
  if (outputBox) outputBox.value = fplString;
}
