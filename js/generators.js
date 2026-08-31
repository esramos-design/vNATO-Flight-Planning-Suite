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
  
  // Flight Rules: Send single character rule (I, V, Y, Z)
  const flightRules = document.getElementById('icaoRules').value;
  
  // Speed & Alt handling
  let spdUnit = document.getElementById('icaoSpdUnit').value;
  let spdVal = document.getElementById('icaoSpdVal').value.trim();
  const altUnit = document.getElementById('icaoAltUnit').value;
  const altVal = document.getElementById('icaoAltVal').value.trim();

  // If Mach (M) is selected, fallback to Knots equivalent format (N) for VATSIM web parser compatibility
  if (spdUnit === 'M') {
    let machNum = parseFloat(spdVal) || 75;
    if (machNum < 10) machNum *= 100; // Handle 0.75 vs 75
    let knotsEst = Math.round(machNum * 5.75); // Approx TAS conversion at altitude
    spdUnit = 'N';
    spdVal = String(knotsEst).padStart(4, '0');
  } else {
    spdVal = String(spdVal).padStart(4, '0');
  }

  const spdAltHeader = spdUnit + spdVal + altUnit + String(altVal).padStart(3, '0');
  
  const gatToOat = document.getElementById('icaoGatToOat').value.trim();
  const oatToGat = document.getElementById('icaoOatToGat').value.trim();
  const vfrTrans = document.getElementById('icaoVfrTrans').value.trim();
  let route = document.getElementById('icaoRoute').value.trim();
  
  const s1 = document.getElementById('icaoStaySeg1').value;
  const d1 = document.getElementById('icaoStayDur1').value.trim();
  const stayStr1 = (s1 !== 'NONE' && d1) ? (s1 + '/' + d1) : '';

  const s2 = document.getElementById('icaoStaySeg2').value;
  const d2 = document.getElementById('icaoStayDur2').value.trim();
  const stayStr2 = (s2 !== 'NONE' && d2) ? (s2 + '/' + d2) : '';

  const s3 = document.getElementById('icaoStaySeg3').value;
  const d3 = document.getElementById('icaoStayDur3').value.trim();
  const stayStr3 = (s3 !== 'NONE' && d3) ? (s3 + '/' + d3) : '';

  let routeParts = [];
  if (country === 'UK' || country === 'DE') {
    routeParts.push('OAT');
  }

  // Speed and Level
  routeParts.push(spdAltHeader);

  // Avoid duplicate insertion if transition point is already typed into main route field
  if (gatToOat && !route.includes(gatToOat)) {
    routeParts.push(gatToOat);
  }

  if (route) {
    routeParts.push(route);
  }

  if (oatToGat && !route.includes(oatToGat)) {
    routeParts.push(oatToGat);
  }

  if (vfrTrans) routeParts.push(vfrTrans);
  if (stayStr1) routeParts.push(stayStr1);
  if (stayStr2) routeParts.push(stayStr2);
  if (stayStr3) routeParts.push(stayStr3);

  const fullRouteStr = routeParts.join(' ').replace(/\s+/g, ' ');

  // Field 18 (Remarks)
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
  const stayinfoVal = document.getElementById('icaoStayinfo').value.trim();
  
  let rmkVal = document.getElementById('icaoRmk').value.trim();
  if (country === 'DE') {
    rmkVal = "RMK/VIRTUALNATO.ORG";
  } else if (country === 'FR') {
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

  let coreRemarksParts = [
    pbn, nav, wakeTag, sts, sel, sur, per, orgn, com, reg, opr, stayinfoVal, rmkVal
  ].filter(p => p !== '');

  const callsign = document.getElementById('fplCallsign').value.trim();
  const acftType = document.getElementById('fplAcftType').value.trim();
  const equipTrans = document.getElementById('icaoEquip').value.trim() + '/' + document.getElementById('icaoTrans').value.trim();
  const dep = document.getElementById('fplDep').value.trim();
  const eobt = document.getElementById('fplEobt').value.trim();
  const arr = document.getElementById('fplArr').value.trim();
  const eetArr = document.getElementById('fplEetArr').value.trim();
  const alt = document.getElementById('fplAlt').value.trim();

  const arrivalSegment = alt ? `${arr}${eetArr} ${alt}` : `${arr}${eetArr}`;

  // ICAO FPL Syntax: Field 19 Endurance appended as -E/HHMM at the very end
  const enduranceStr = fuelVal ? `\n-E/${fuelVal}` : '';

  const icaoString = `(FPL-${callsign}-${flightRules}\n-${acftType}/${wakeCat}-${equipTrans}\n-${dep}${eobt}\n-${fullRouteStr}\n-${arrivalSegment}\n-${coreRemarksParts.join(' ')}${enduranceStr})`;

  document.getElementById('icaoOutput').value = icaoString;
}
