function calculateTod() {
  const currentAlt = parseFloat(document.getElementById('todCurrentAlt').value) || 0;
  const targetAlt = parseFloat(document.getElementById('todTargetAlt').value) || 0;
  const gs = parseFloat(document.getElementById('todGroundspeed').value) || 0;
  const angle = parseFloat(document.getElementById('todAngle').value) || 3;
  const offset = parseFloat(document.getElementById('todOffset').value) || 0;

  const resAltLoss = document.getElementById('resAltLoss');
  const resDescDist = document.getElementById('resDescDist'); // New field
  const resDistance = document.getElementById('resDistance');
  const resVs = document.getElementById('resVs');
  const resTime = document.getElementById('resTime');

  if (currentAlt <= targetAlt || gs <= 0) {
    resAltLoss.textContent = '0 ft';
    if (resDescDist) resDescDist.textContent = '0.0 NM';
    resDistance.textContent = '0.0 NM';
    resVs.textContent = '0 FPM';
    resTime.textContent = '0.0 min';
    return;
  }

  const altLoss = currentAlt - targetAlt;
  
  // Calculate precise distance required to lose altitude at the given angle
  const angleRad = angle * (Math.PI / 180);
  const descentDist = altLoss / (Math.tan(angleRad) * 6076.115); // 6076.115 ft per NM
  
  // Add the user's offset (e.g., reaching target 20 NM before the fix)
  const totalDistance = descentDist + offset;

  // Vertical Speed = GS (nm/hr) converted to ft/min against the descent angle
  const fpm = (gs * 101.268) * Math.tan(angleRad);
  
  // Time = Distance / (GS / 60)
  const timeMins = descentDist / (gs / 60);

  resAltLoss.textContent = altLoss.toLocaleString() + ' ft';
  if (resDescDist) resDescDist.textContent = descentDist.toFixed(1) + ' NM';
  resDistance.textContent = totalDistance.toFixed(1) + ' NM';
  resVs.textContent = '-' + Math.round(fpm).toLocaleString() + ' FPM';
  resTime.textContent = timeMins.toFixed(1) + ' min';
}

function calculateXwind() {
  let rwyHdg = parseFloat(document.getElementById('xwRwyHeading').value);
  let windDir = parseFloat(document.getElementById('xwWindDir').value);
  let windSpd = parseFloat(document.getElementById('xwWindSpeed').value) || 0;

  if (isNaN(rwyHdg) || isNaN(windDir)) {
    document.getElementById('resHeadwind').textContent = 'Invalid input';
    document.getElementById('resCrosswind').textContent = 'Invalid input';
    document.getElementById('resAngleOffset').textContent = '-';
    return;
  }

  if (rwyHdg <= 36) {
    rwyHdg *= 10;
  }

  let angleDiff = Math.abs(windDir - rwyHdg);
  if (angleDiff > 180) {
    angleDiff = 360 - angleDiff;
  }

  const angleRad = angleDiff * (Math.PI / 180);
  const headwind = windSpd * Math.cos(angleRad);
  const crosswind = Math.abs(windSpd * Math.sin(angleRad));

  let headwindText = headwind >= 0 ? Math.round(headwind) + ' kts (Headwind)' : Math.abs(Math.round(headwind)) + ' kts (Tailwind)';

  document.getElementById('resHeadwind').textContent = headwindText;
  document.getElementById('resCrosswind').textContent = Math.round(crosswind) + ' kts';
  document.getElementById('resAngleOffset').textContent = Math.round(angleDiff) + '° off runway';
}

function calculateFuelEte() {
  const dist = parseFloat(document.getElementById('fuelDistance').value) || 0;
  const gs = parseFloat(document.getElementById('fuelGroundspeed').value) || 1;
  const burnRate = parseFloat(document.getElementById('fuelBurnRate').value) || 0;
  const unit = document.getElementById('fuelUnit').value;

  const hours = dist / gs;
  const totalMinutes = Math.round(hours * 60);
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const mm = String(totalMinutes % 60).padStart(2, '0');

  const legFuel = hours * burnRate;
  const reserveFuel = (burnRate / 60) * 30;
  const totalWithReserve = legFuel + reserveFuel;

  document.getElementById('resEte').textContent = `${hh}:${mm} (HH:MM)`;
  document.getElementById('resLegFuel').textContent = Math.round(legFuel).toLocaleString() + ` ${unit}`;
  document.getElementById('resReserveFuel').textContent = Math.round(totalWithReserve).toLocaleString() + ` ${unit}`;
}

function updateMissionClock() {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcSeconds = now.getUTCSeconds();
  
  const zuluStr = String(utcHours).padStart(2, '0') + ':' + String(utcMinutes).padStart(2, '0') + ':' + String(utcSeconds).padStart(2, '0');
  const zuluDateStr = now.toUTCString().slice(0, 16);

  const localStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
  const localDateStr = now.toDateString();

  document.getElementById('clockZulu').textContent = zuluStr;
  document.getElementById('dateZulu').textContent = zuluDateStr;
  document.getElementById('clockLocal').textContent = localStr;
  document.getElementById('dateLocal').textContent = localDateStr;

  const offsetVal = parseInt(document.getElementById('clockOffset').value) || 0;
  let customHours = utcHours + offsetVal;
  if (customHours >= 24) {
    customHours -= 24;
  } else if (customHours < 0) {
    customHours += 24;
  }
  const customStr = String(customHours).padStart(2, '0') + ':' + String(utcMinutes).padStart(2, '0') + ':' + String(utcSeconds).padStart(2, '0') + ` (UTC ${offsetVal >= 0 ? '+' + offsetVal : offsetVal})`;
  document.getElementById('resCustomOffsetTime').textContent = customStr;
}

function calculateDensityAltitude() {
  const elev = parseFloat(document.getElementById('daElevation').value) || 0;
  const altimeter = parseFloat(document.getElementById('daAltimeter').value) || 29.92;
  const tempC = parseFloat(document.getElementById('daTemp').value) || 15;
  const acftType = document.getElementById('daAircraftType').value;

  let altSettingInHg = altimeter > 200 ? altimeter * 0.02953 : altimeter;
  const pressAlt = elev + (29.92 - altSettingInHg) * 1000;

  const stdTempC = 15 - (2 * (pressAlt / 1000));
  const isaDev = tempC - stdTempC;

  const densityAlt = pressAlt + (120 * isaDev);

  let factor = acftType === 'jet' ? 0.0035 : 0.0045;
  const perfDegradation = Math.max(0, densityAlt * factor);

  document.getElementById('resPressAlt').textContent = Math.round(pressAlt).toLocaleString() + ' ft';
  document.getElementById('resDensityAlt').textContent = Math.round(densityAlt).toLocaleString() + ' ft';
  document.getElementById('resPerfDegradation').textContent = '+' + perfDegradation.toFixed(1) + '%';
}
