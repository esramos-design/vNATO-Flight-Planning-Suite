// SWIFT Route Generator
function generateRouteString() {
  const country = document.getElementById('countrySelect').value;
  const rawRoute = document.getElementById('route').value.trim().toUpperCase();
  const gatToOat = document.getElementById('gatToOat').value.trim().toUpperCase();
  const oatToGat = document.getElementById('oatToGat').value.trim().toUpperCase();
  const vfrTrans = document.getElementById('vfrTrans').value.trim().toUpperCase();

  const staySeg1 = document.getElementById('staySeg1').value;
  const stayDur1 = document.getElementById('stayDur1').value.trim();
  const staySeg2 = document.getElementById('staySeg2').value;
  const stayDur2 = document.getElementById('stayDur2').value.trim();
  const staySeg3 = document.getElementById('staySeg3').value;
  const stayDur3 = document.getElementById('stayDur3').value.trim();

  let routeParts = [];

  if (country === 'DE' || country === 'UK') {
    if (!rawRoute.startsWith('OAT')) {
      routeParts.push('OAT');
    }
  }

  if (gatToOat) routeParts.push(gatToOat);
  if (rawRoute) routeParts.push(rawRoute);

  if (staySeg1 !== 'NONE' && stayDur1) {
    routeParts.push(`${staySeg1}/${stayDur1}`);
  }
  if (staySeg2 !== 'NONE' && stayDur2) {
    routeParts.push(`${staySeg2}/${stayDur2}`);
  }
  if (staySeg3 !== 'NONE' && stayDur3) {
    routeParts.push(`${staySeg3}/${stayDur3}`);
  }

  if (oatToGat) routeParts.push(oatToGat);
  if (vfrTrans) routeParts.push(vfrTrans);

  const finalRoute = routeParts.filter(Boolean).join(' ');
  const outputBox = document.getElementById('routeOutput');
  if (outputBox) outputBox.value = finalRoute;
}

// SWIFT Remarks Generator
function generateRemarksString() {
  const wake = document.getElementById('wake').value;
  const equip = document.getElementById('equip').value;
  const trans = document.getElementById('trans').value;
  const pbn = document.getElementById('pbnValue').value;
  const nav = document.getElementById('nav').value;
  const sts = document.getElementById('sts').value;
  const sel = document.getElementById('sel').value.trim().toUpperCase();
  const sur = document.getElementById('sur').value.trim().toUpperCase();
  const per = document.getElementById('per').value.trim().toUpperCase();
  const oragn = document.getElementById('oragn').value.trim().toUpperCase();
  const com = document.getElementById('com').value.trim().toUpperCase();
  const reg = document.getElementById('reg').value.trim().toUpperCase();
  const opr = document.getElementById('opr').value;
  const fuelEnd = document.getElementById('fuelEnd').value.trim();
  const eet = document.getElementById('eet').value.trim().toUpperCase();
  
  const stayinfo = document.getElementById('stayinfo').value.trim().toUpperCase();
  const rmkOat = document.getElementById('rmkOat').value;
  const vso = document.getElementById('vso').value.trim().toUpperCase();
  const vsoTrainee = document.getElementById('vsoTrainee').checked;

  let remarksList = [];

  if (wake) remarksList.push(`WAK/${wake}`);
  if (equip || trans) remarksList.push(`COM/${equip}${trans ? '/' + trans : ''}`);
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
  if (fuelEnd) remarksList.push(`EET/${fuelEnd}`);
  if (eet) remarksList.push(eet);

  const stayDur1 = document.getElementById('stayDur1')?.value.trim();
  const stayDur2 = document.getElementById('stayDur2')?.value.trim();
  const stayDur3 = document.getElementById('stayDur3')?.value.trim();
  const baseStayInfo = stayinfo || 'MILITARY OPERATION WORK AREA';

  if (stayDur1) remarksList.push(`STAYINFO1/${baseStayInfo}`);
  if (stayDur2) remarksList.push(`STAYINFO2/${baseStayInfo}`);
  if (stayDur3) remarksList.push(`STAYINFO3/${baseStayInfo}`);

  if (rmkOat) remarksList.push(rmkOat);
  if (vso) remarksList.push(vso);
  if (vsoTrainee) remarksList.push('VSO TRAINEE');

  const finalRemarks = remarksList.filter(Boolean).join(' ');
  const outputBox = document.getElementById('remarksOutput');
  if (outputBox) outputBox.value = finalRemarks;
}

// vPILOT FPL String Generator (Handles VATSIM rule restriction 'T' -> 'I' fallback)
function generateIcaoFplString() {
  let rules = document.getElementById('icaoRules').value;
  if (rules === 'T') {
    rules = 'I'; 
  }

  const type = document.getElementById('icaoType').value;
  const spdUnit = document.getElementById('icaoSpdUnit').value;
  const spdVal = document.getElementById('icaoSpdVal').value.trim().toUpperCase();
  const altUnit = document.getElementById('icaoAltUnit').value;
  const altVal = document.getElementById('icaoAltVal').value.trim().toUpperCase();
  const callsign = document.getElementById('fplCallsign').value.trim().toUpperCase();
  const acftType = document.getElementById('fplAcftType').value.trim().toUpperCase();
  const dep = document.getElementById('fplDep').value.trim().toUpperCase();
  const eobt = document.getElementById('fplEobt').value.trim().toUpperCase();
  const arr = document.getElementById('fplArr').value.trim().toUpperCase();
  const eetArr = document.getElementById('fplEetArr').value.trim().toUpperCase();
  const altAerodrome = document.getElementById('fplAlt').value.trim().toUpperCase();

  const routeType = document.getElementById('icaoRouteType').value;
  const rawRoute = document.getElementById('icaoRoute').value.trim().toUpperCase();
  const gatToOat = document.getElementById('icaoGatToOat').value.trim().toUpperCase();
  const oatToGat = document.getElementById('icaoOatToGat').value.trim().toUpperCase();
  const vfrTrans = document.getElementById('icaoVfrTrans').value.trim().toUpperCase();

  const staySeg1 = document.getElementById('icaoStaySeg1').value;
  const stayDur1 = document.getElementById('icaoStayDur1').value.trim();
  const staySeg2 = document.getElementById('icaoStaySeg2').value;
  const stayDur2 = document.getElementById('icaoStayDur2').value.trim();
  const staySeg3 = document.getElementById('icaoStaySeg3').value;
  const stayDur3 = document.getElementById('icaoStayDur3').value.trim();

  const wake = document.getElementById('icaoWake').value;
  const equip = document.getElementById('icaoEquip').value;
  const trans = document.getElementById('icaoTrans').value;
  const pbn = document.getElementById('icaoPbnValue').value;
  const nav = document.getElementById('icaoNav').value;
  const sts = document.getElementById('icaoSts').value;
  const sel = document.getElementById('icaoSel').value.trim().toUpperCase();
  const sur = document.getElementById('icaoSur').value.trim().toUpperCase();
  const per = document.getElementById('icaoPer').value.trim().toUpperCase();
  const oragn = document.getElementById('icaoOrgn').value.trim().toUpperCase();
  const com = document.getElementById('icaoCom').value.trim().toUpperCase();
  const reg = document.getElementById('icaoReg').value.trim().toUpperCase();
  const opr = document.getElementById('icaoOpr').value.trim().toUpperCase();
  const fuelEnd = document.getElementById('icaoFuel').value.trim();
  const customStayinfo = document.getElementById('icaoStayinfo').value.trim().toUpperCase();
  const customRmk = document.getElementById('icaoRmk').value.trim().toUpperCase();
  const vsoTrainee = document.getElementById('icaoVsoTrainee').checked;

  let routeParts = [];
  const country = document.getElementById('countrySelect').value;
  if (country === 'DE' || country === 'UK') {
    if (!rawRoute.startsWith('OAT')) {
      routeParts.push('OAT');
    }
  }

  if (gatToOat) routeParts.push(gatToOat);
  if (rawRoute) routeParts.push(rawRoute);

  if (staySeg1 !== 'NONE' && stayDur1) {
    routeParts.push(`${staySeg1}/${stayDur1}`);
  }
  if (staySeg2 !== 'NONE' && stayDur2) {
    routeParts.push(`${staySeg2}/${stayDur2}`);
  }
  if (staySeg3 !== 'NONE' && stayDur3) {
    routeParts.push(`${staySeg3}/${stayDur3}`);
  }

  if (oatToGat) routeParts.push(oatToGat);
  if (vfrTrans) routeParts.push(vfrTrans);

  const finalRoute = routeParts.filter(Boolean).join(' ');

  let item18List = [];
  if (wake) item18List.push(`WAK/${wake}`);
  if (equip || trans) item18List.push(`COM/${equip}${trans ? '/' + trans : ''}`);
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
  if (fuelEnd) item18List.push(`EET/${fuelEnd}`);

  if (stayDur1) item18List.push(`STAYINFO1/${customStayinfo || 'MILITARY OPERATION'}`);
  if (stayDur2) item18List.push(`STAYINFO2/${customStayinfo || 'MILITARY OPERATION'}`);
  if (stayDur3) item18List.push(`STAYINFO3/${customStayinfo || 'MILITARY OPERATION'}`);

  if (customRmk) item18List.push(customRmk);
  if (vsoTrainee) item18List.push('VSO TRAINEE');

  const item18Str = item18List.length > 0 ? '-' + item18List.join(' ') : '';
  const altStr = altAerodrome ? `-${altAerodrome}` : '';
  const speedAltBlock = `${spdUnit}${spdVal}${altUnit}${altVal}`;

  const fplString = `(FPL-${callsign || 'NATO01'}-${rules}${type}
-RFAL/${equip || 'SDT'}/${trans || 'S'}
-${dep || 'LFMI'}${eobt || '1700'}
-${speedAltBlock} ${finalRoute}
-${arr || 'LFBM'}${eetArr || '1750'} ${altAerodrome}
${item18Str}
-E/${fuelEnd || '0200'})`;

  const outputBox = document.getElementById('icaoOutput');
  if (outputBox) outputBox.value = fplString;
}
