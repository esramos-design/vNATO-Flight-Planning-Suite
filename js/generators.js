function generateRouteString() {
  const country = document.getElementById('countrySelect').value;
  const spdAlt = document.getElementById('spdUnit').value + document.getElementById('spdVal').value + document.getElementById('altUnit').value + document.getElementById('altVal').value;
  
  const gatToOat = document.getElementById('gatToOat').value.trim();
  const oatToGat = document.getElementById('oatToGat').value.trim();
  const vfrTrans = document.getElementById('vfrTrans').value.trim();
  const route = document.getElementById('route').value.trim();
  
  const s1 = document.getElementById('staySeg1').value;
  const d1 = document.getElementById('stayDur1').value.trim();
  const stayStr1 = (s1 !== 'NONE' && d1) ? (s1 + '/' + d1) : '';

  const s2 = document.getElementById('staySeg2').value;
  const d2 = document.getElementById('stayDur2').value.trim();
  const stayStr2 = (s2 !== 'NONE' && d2) ? (s2 + '/' + d2) : '';

  const s3 = document.getElementById('staySeg3').value;
  const d3 = document.getElementById('stayDur3').value.trim();
  const stayStr3 = (s3 !== 'NONE' && d3) ? (s3 + '/' + d3) : '';

  let parts = [];
  if (country === 'UK' || country === 'DE') {
    parts.push('OAT');
  }

  const coreParts = [
    spdAlt,
    gatToOat,
    oatToGat,
    vfrTrans,
    route,
    stayStr1,
    stayStr2,
    stayStr3
  ].filter(p => p !== '');

  parts = parts.concat(coreParts);

  document.getElementById('routeOutput').value = parts.join(' ');
}

function generateRemarksString() {
  const country = document.getElementById('countrySelect').value;
  const wake = document.getElementById('wake').value ? ('WAK/' + document.getElementById('wake').value) : '';
  const equipTrans = document.getElementById('equip').value + '/' + document.getElementById('trans').value;
  
  const pbnVals = document.getElementById('pbnValue').value.trim();
  const pbn = pbnVals ? ('PBN/' + pbnVals) : '';

  const nav = document.getElementById('nav').value ? ('NAV/' + document.getElementById('nav').value) : '';
  const sts = document.getElementById('sts').value ? ('STS/' + document.getElementById('sts').value) : '';
  
  const selVal = document.getElementById('sel').value.trim();
  const sel = selVal ? ('SEL/' + selVal) : '';
  const surVal = document.getElementById('sur').value.trim();
  const sur = surVal ? ('SUR/' + surVal) : '';
  const perVal = document.getElementById('per').value.trim();
  const per = perVal ? ('PER/' + perVal) : '';
  const orgnVal = document.getElementById('oragn').value.trim();
  const orgn = orgnVal ? ('ORGN/' + orgnVal) : '';
  const comVal = document.getElementById('com').value.trim();
  const com = comVal ? ('COM/' + comVal) : '';

  const reg = document.getElementById('reg').value ? ('REG/' + document.getElementById('reg').value) : '';
  const opr = document.getElementById('opr').value ? (`OPR/${document.getElementById('opr').value}`) : '';
  const fuelVal = document.getElementById('fuelEnd').value.trim();
  const fuel = fuelVal ? (`FUEL${fuelVal}`) : '';
  const eet = document.getElementById('eet').value ? ('EET/' + document.getElementById('eet').value) : '';
  
  const stayInfoSeg = document.getElementById('stayInfoSeg').value;
  const stayinfoVal = document.getElementById('stayinfo').value.trim();
  const stayinfoStr = (stayInfoSeg !== 'NONE' && stayinfoVal) ? (stayInfoSeg + '/' + stayinfoVal) : '';

  let rmkOat = document.getElementById('rmkOat').value;
  if (country === 'DE') {
    rmkOat = "RMK/VIRTUALNATO.ORG";
  }

  let vso = document.getElementById('vso').value.trim();
  const isTrainee = document.getElementById('vsoTrainee').checked;
  if (isTrainee) {
    if (country === 'DE') {
      vso = "VSO TRAINEE";
    } else if (vso !== "") {
      vso += " VSO TRAINEE";
    } else {
      vso = "VSO TRAINEE";
    }
  } else if (country === 'DE') {
    vso = "";
  }

  let parts = [];
  if (country === 'FR') {
    parts.push('OAT');
  }

  const coreParts = [
    equipTrans, wake, pbn, nav, sts, sel, sur, per, orgn, com, reg, opr, fuel, eet, stayinfoStr, rmkOat, (country === 'DE' && isTrainee ? 'VSO TRAINEE' : (country !== 'DE' ? vso : ''))
  ].filter(p => p !== '');

  parts = parts.concat(coreParts);

  document.getElementById('remarksOutput').value = parts.join(' ');
}

function generateIcaoFplString() {
  const country = document.getElementById('countrySelect').value;
  const rulesType = document.getElementById('icaoRules').value + document.getElementById('icaoType').value;
  
  const spdAltHeader = document.getElementById('spdUnit').value + document.getElementById('spdVal').value + document.getElementById('altUnit').value + document.getElementById('altVal').value;
  
  const gatToOat = document.getElementById('gatToOat').value.trim();
  const oatToGat = document.getElementById('oatToGat').value.trim();
  const vfrTrans = document.getElementById('vfrTrans').value.trim();
  const route = document.getElementById('route').value.trim();
  
  const s1 = document.getElementById('staySeg1').value;
  const d1 = document.getElementById('stayDur1').value.trim();
  const stayStr1 = (s1 !== 'NONE' && d1) ? (s1 + '/' + d1) : '';

  const s2 = document.getElementById('staySeg2').value;
  const d2 = document.getElementById('stayDur2').value.trim();
  const stayStr2 = (s2 !== 'NONE' && d2) ? (s2 + '/' + d2) : '';

  const s3 = document.getElementById('staySeg3').value;
  const d3 = document.getElementById('stayDur3').value.trim();
  const stayStr3 = (s3 !== 'NONE' && d3) ? (s3 + '/' + d3) : '';

  let routeParts = [];
  if (country === 'UK' || country === 'DE') {
    routeParts.push('OAT');
  }

  const coreRouteParts = [
    spdAltHeader,
    gatToOat,
    oatToGat,
    vfrTrans,
    route,
    stayStr1,
    stayStr2,
    stayStr3
  ].filter(p => p !== '');

  routeParts = routeParts.concat(coreRouteParts);
  const fullRouteStr = routeParts.join(' ');

  const wakeCat = document.getElementById('icaoWake').value;
  const wakeTag = wakeCat ? ('WAK/' + wakeCat) : '';
  
  const pbnVals = document.getElementById('icaoPbnValue').value.trim();
  const pbn = pbnVals ? ('PBN/' + pbnVals) : '';

  const navVal = document.getElementById('icaoNav').value.trim();
  const nav = navVal ? ('NAV/' + navVal) : '';
  const stsVal = document.getElementById('icaoSts').value.trim();
  const sts = stsVal ? ('STS/' + stsVal) : '';

  const selVal = document.getElementById('icaoSel').value.trim();
  const sel = selVal ? ('SEL/' + selVal) : '';
  const surVal = document.getElementById('icaoSur').value.trim();
  const sur = surVal ? ('SUR/' + surVal) : '';
  const perVal = document.getElementById('icaoPer').value.trim();
  const per = perVal ? ('PER/' + perVal) : '';
  const orgnVal = document.getElementById('icaoOrgn').value.trim();
  const orgn = orgnVal ? ('ORGN/' + orgnVal) : '';
  const comVal = document.getElementById('icaoCom').value.trim();
  const com = comVal ? ('COM/' + comVal) : '';

  const regVal = document.getElementById('icaoReg').value.trim();
  const reg = regVal ? ('REG/' + regVal) : '';
  const oprVal = document.getElementById('icaoOpr').value.trim();
  const opr = oprVal ? (`OPR/${oprVal}`) : '';
  
  const fuelVal = document.getElementById('icaoFuel').value.trim();
  const fuel = fuelVal ? (`FUEL${fuelVal}`) : '';
  
  const stayinfoVal = document.getElementById('icaoStayinfo').value.trim();
  
  let rmkVal = document.getElementById('icaoRmk').value.trim();
  if (country === 'DE') {
    rmkVal = "RMK/VIRTUALNATO.ORG";
  } else if (country === 'FR') {
    // Keep OAT status inside RMK/ to maintain valid ICAO syntax for VATSIM importer
    if (!rmkVal.includes("OAT")) {
      rmkVal = rmkVal.replace("RMK/", "RMK/OAT ");
    }
  }

  const isTrainee = document.getElementById('icaoVsoTrainee').checked;
  if (isTrainee) {
    if (country === 'DE') {
      rmkVal += " VSO TRAINEE";
    } else if (rmkVal !== "") {
      rmkVal += " VSO TRAINEE";
    } else {
      rmkVal = "RMK/VSO TRAINEE";
    }
  }

  let remarksParts = [];

  const coreRemarksParts = [
    pbn, nav, wakeTag, sts, sel, sur, per, orgn, com, reg, opr, fuel, stayinfoVal, rmkVal
  ].filter(p => p !== '');

  remarksParts = remarksParts.concat(coreRemarksParts);

  const callsign = document.getElementById('fplCallsign').value.trim();
  const acftType = document.getElementById('fplAcftType').value.trim();
  const equipTrans = document.getElementById('icaoEquip').value.trim() + '/' + document.getElementById('icaoTrans').value.trim();
  const dep = document.getElementById('fplDep').value.trim();
  const eobt = document.getElementById('fplEobt').value.trim();
  const arr = document.getElementById('fplArr').value.trim();
  const eetArr = document.getElementById('fplEetArr').value.trim();
  const alt = document.getElementById('fplAlt').value.trim();

  const arrivalSegment = alt ? `${arr}${eetArr} ${alt}` : `${arr}${eetArr}`;

  const icaoString = `(FPL-${callsign}-${rulesType}\n-${acftType}/${wakeCat}-${equipTrans}\n-${dep}${eobt}\n-${fullRouteStr}\n-${arrivalSegment}\n-${remarksParts.join(' ')})`;

  document.getElementById('icaoOutput').value = icaoString;
}
