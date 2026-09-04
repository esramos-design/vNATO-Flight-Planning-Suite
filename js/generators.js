// js/generators.js
function getVal(id, defaultVal = "") {
  const el = document.getElementById(id);
  return el && el.value.trim() !== "" ? el.value.trim() : defaultVal;
}

function formatTransferPoint(val) {
  if (!val) return "";
  return val.replace(/\//g, ' ');
}

// SWIFT Route Generator
function generateRouteString() {
  const country = getVal('countrySelect');
  let route = getVal('route').toUpperCase();
  const gatToOat = formatTransferPoint(getVal('gatToOat').toUpperCase());
  const oatToGat = formatTransferPoint(getVal('oatToGat').toUpperCase());
  
  let injections = {};
  function addInj(wpt, str) {
    if(!wpt || !str) return;
    if(!injections[wpt]) injections[wpt] = [];
    injections[wpt].push(str);
  }

  const vfrWpt = getVal('vfrTransWpt').toUpperCase();
  const vfrType = getVal('vfrTransType');
  const vfrParams = getVal('vfrTransParams').toUpperCase();
  if (vfrWpt && vfrType && vfrParams) addInj(vfrWpt, `${vfrType} ${vfrParams}`);

  const ifrWpt = getVal('ifrTransWpt').toUpperCase();
  const ifrType = getVal('ifrTransType');
  const ifrParams = getVal('ifrTransParams').toUpperCase();
  if (ifrWpt && ifrType && ifrParams) addInj(ifrWpt, `${ifrType} ${ifrParams}`);

  for (let i = 1; i <= 3; i++) {
    const staySeg = getVal(`staySeg${i}`);
    const stayDur = getVal(`stayDur${i}`);
    const stayWpt = getVal(`stayWpt${i}`).toUpperCase();
    if (staySeg !== 'NONE' && stayDur && stayWpt) {
      addInj(stayWpt, `${staySeg}/${stayDur}`);
    }
  }

  let routeArray = route.split(/\s+/).filter(Boolean);
  let finalRouteArray = [];
  
  if (country === 'DE' || country === 'UK') {
    if (routeArray.length > 0 && routeArray[0] !== 'OAT') {
      finalRouteArray.push('OAT');
    }
  }
  
  if (gatToOat) finalRouteArray.push(gatToOat);

  for (let item of routeArray) {
    finalRouteArray.push(item);
    if (injections[item]) {
      finalRouteArray.push(injections[item].join(' '));
      delete injections[item];
    }
  }

  for (let wpt in injections) {
    finalRouteArray.push(wpt);
    finalRouteArray.push(injections[wpt].join(' '));
  }

  if (oatToGat) finalRouteArray.push(oatToGat);

  const finalRoute = finalRouteArray.join(' ').replace(/\s+/g, ' ').trim();
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
  
  const stayinfo1 = getVal('stayinfo1').toUpperCase();
  const stayinfo2 = getVal('stayinfo2').toUpperCase();
  const stayinfo3 = getVal('stayinfo3').toUpperCase();
  
  const rmkOat = getVal('rmkOat', 'RMK/OAT');
  const vso = getVal('vso', 'VIRTUALNATO.ORG').toUpperCase();
  const vsoTrainee = document.getElementById('vsoTrainee')?.checked;

  let remarksList = [];

  if (pbn) remarksList.push(`PBN/${pbn}`);
  if (nav) remarksList.push(`NAV/${nav}`);
  if (sts) remarksList.push(`STS/${sts}`);
  if (sel) remarksList.push(`SEL/${sel}`);
  if (sur) remarksList.push(`SUR/${sur}`);
  if (per) remarksList.push(`PER/${per}`);
  if (oragn) remarksList.push(`ORGN/${oragn}`);
  if (com) remarksList.push(`COM/${com}`);
  if (reg) remarksList.push(`REG/${reg}`);
  if (opr) remarksList.push(`OPR/${opr}`);
  if (eet) remarksList.push(`EET/${eet}`);

  if (stayinfo1) remarksList.push(`STAYINFO1/${stayinfo1}`);
  if (stayinfo2) remarksList.push(`STAYINFO2/${stayinfo2}`);
  if (stayinfo3) remarksList.push(`STAYINFO3/${stayinfo3}`);

  let rmkString = [];
  if (rmkOat) rmkString.push(rmkOat);
  if (vso) rmkString.push(vso);
  if (vsoTrainee) rmkString.push('VSO TRAINEE');
  
  if (rmkString.length > 0) remarksList.push(rmkString.join(' '));

  const finalRemarks = remarksList.filter(Boolean).join(' ');
  const outputBox = document.getElementById('remarksOutput');
  if (outputBox) outputBox.value = finalRemarks;
}

// vPILOT FPL String Generator
function generateIcaoFplString() {
  let rules = getVal('icaoRules', 'I');
  if (rules === 'T') rules = 'I'; 

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
  
  let injections = {};
  function addInj(wpt, str) {
    if(!wpt || !str) return;
    if(!injections[wpt]) injections[wpt] = [];
    injections[wpt].push(str);
  }

  const vfrWpt = getVal('icaoVfrTransWpt').toUpperCase();
  const vfrType = getVal('icaoVfrTransType');
  const vfrParams = getVal('icaoVfrTransParams').toUpperCase();
  if (vfrWpt && vfrType && vfrParams) addInj(vfrWpt, `${vfrType} ${vfrParams}`);

  const ifrWpt = getVal('icaoIfrTransWpt').toUpperCase();
  const ifrType = getVal('icaoIfrTransType');
  const ifrParams = getVal('icaoIfrTransParams').toUpperCase();
  if (ifrWpt && ifrType && ifrParams) addInj(ifrWpt, `${ifrType} ${ifrParams}`);

  for (let i = 1; i <= 3; i++) {
    const staySeg = getVal(`icaoStaySeg${i}`);
    const stayDur = getVal(`icaoStayDur${i}`);
    const stayWpt = getVal(`icaoStayWpt${i}`).toUpperCase();
    if (staySeg !== 'NONE' && stayDur && stayWpt) {
      addInj(stayWpt, `${staySeg}/${stayDur}`);
    }
  }

  let routeArray = route.split(/\s+/).filter(Boolean);
  let finalRouteArray = [];
  const country = getVal('countrySelect');
  
  if (country === 'DE' || country === 'UK') {
    if (routeArray.length > 0 && routeArray[0] !== 'OAT') {
      finalRouteArray.push('OAT');
    }
  }

  if (gatToOat) finalRouteArray.push(gatToOat);

  for (let item of routeArray) {
    finalRouteArray.push(item);
    if (injections[item]) {
      finalRouteArray.push(injections[item].join(' '));
      delete injections[item];
    }
  }

  for (let wpt in injections) {
    finalRouteArray.push(wpt);
    finalRouteArray.push(injections[wpt].join(' '));
  }

  if (oatToGat) finalRouteArray.push(oatToGat);
  const finalRoute = finalRouteArray.join(' ').replace(/\s+/g, ' ').trim();

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
  
  const stayinfo1 = getVal('icaoStayinfo1').toUpperCase();
  const stayinfo2 = getVal('icaoStayinfo2').toUpperCase();
  const stayinfo3 = getVal('icaoStayinfo3').toUpperCase();
  
  const customRmk = getVal('icaoRmk', 'RMK/OAT VIRTUALNATO.ORG').toUpperCase();
  const vsoTrainee = document.getElementById('icaoVsoTrainee')?.checked;

  let item18List = [];

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
  if (eetItem18) item18List.push(`EET/${eetItem18}`);

  if (stayinfo1) item18List.push(`STAYINFO1/${stayinfo1}`);
  if (stayinfo2) item18List.push(`STAYINFO2/${stayinfo2}`);
  if (stayinfo3) item18List.push(`STAYINFO3/${stayinfo3}`);

  let rmkString = [];
  if (customRmk) rmkString.push(customRmk);
  if (vsoTrainee) rmkString.push('VSO TRAINEE');
  
  if (rmkString.length > 0) item18List.push(rmkString.join(' '));

  const item18Str = item18List.length > 0 ? '-' + item18List.join(' ') : '';
  const altStr = altAerodrome ? ` ${altAerodrome}` : '';
  const speedAltBlock = `${spdUnit}${spdVal}${altUnit}${altVal}`;
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
