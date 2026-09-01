const CHECKWX_API_KEY = "d6bfc15fbcb744b98d259eb2f20495d6";

async function fetchMetarTaf() {
  const icaoInput = document.getElementById('icaoInput');
  if (!icaoInput) return;

  const metarDiv = document.getElementById('metarOutput');
  const tafDiv = document.getElementById('tafOutput');
  const decoderDiv = document.getElementById('decoderOutput');

  const rawInput = icaoInput.value.trim().toUpperCase();
  
  if (!rawInput) {
    if (metarDiv) metarDiv.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Please enter one or more ICAO codes separated by commas (e.g. LFBO, EGLL, EDBB).</span>';
    if (tafDiv) tafDiv.textContent = 'Awaiting ICAO input...';
    if (decoderDiv) decoderDiv.textContent = 'Awaiting ICAO input...';
    return;
  }

  const icaoArray = rawInput.split(',')
                            .map(code => code.trim())
                            .filter(code => code.length === 4);

  if (icaoArray.length === 0) {
    if (metarDiv) metarDiv.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Invalid format: Please enter valid 4-letter ICAO codes (e.g. LFBO, EGLL, EDBB).</span>';
    if (tafDiv) tafDiv.textContent = 'Invalid ICAO code(s).';
    if (decoderDiv) decoderDiv.textContent = 'Invalid ICAO code(s).';
    return;
  }

  const icaoQuery = icaoArray.join(',');

  if (metarDiv) metarDiv.textContent = `Fetching live METAR for ${icaoQuery}...`;
  if (tafDiv) tafDiv.textContent = `Fetching live TAF for ${icaoQuery}...`;
  if (decoderDiv) decoderDiv.textContent = 'Decoding weather parameters...';

  const headers = {
    'X-API-Key': CHECKWX_API_KEY
  };

  try {
    const metarRes = await fetch(`https://api.checkwx.com/metar/${icaoQuery}/decoded`, { headers });
    if (metarRes.ok) {
      const data = await metarRes.json();
      if (data.data && data.data.length > 0) {
        let metarOutputs = [];
        let decoderOutputs = [];

        data.data.forEach(wx => {
          const station = wx.icao || 'UNKNOWN';
          
          metarOutputs.push(`[ ${station} ]\n${wx.raw_text || 'No raw METAR string returned.'}`);

          const windStr = wx.wind ? `${wx.wind.degrees ?? 'VRB'}° at ${wx.wind.speed_kts ?? 0} kts (Gusts: ${wx.wind.gust_kts ? wx.wind.gust_kts + ' kts' : 'None'})` : 'Calm / Unreported';
          const visStr = wx.visibility ? `${wx.visibility.miles ? wx.visibility.miles + ' SM' : (wx.visibility.meters ? wx.visibility.meters + ' m' : 'N/A')}` : 'Unreported';
          const tempStr = wx.temperature ? `${wx.temperature.celsius}°C (Dewpoint: ${wx.dewpoint ? wx.dewpoint.celsius + '°C' : 'N/A'})` : 'N/A';
          const altStr = wx.barometer ? `${wx.barometer.in_hg} inHg (${wx.barometer.hpa} hPa)` : 'N/A';
          const flightCat = wx.flight_category || 'UNKNOWN';

          decoderOutputs.push(`
            <div style="margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #cce0ff;">
              <b>Station ${station} (${flightCat}):</b><br>
              • <b>Wind:</b> ${windStr}<br>
              • <b>Visibility:</b> ${visStr}<br>
              • <b>Temp / Dewpoint:</b> ${tempStr}<br>
              • <b>Altimeter:</b> ${altStr}
            </div>
          `);
        });

        if (metarDiv) metarDiv.textContent = metarOutputs.join('\n\n');
        if (decoderDiv) decoderDiv.innerHTML = decoderOutputs.join('');
      } else {
        if (metarDiv) metarDiv.textContent = `No active METAR reports found for ${icaoQuery}.`;
        if (decoderDiv) decoderDiv.textContent = 'No decoder data available.';
      }
    } else if (metarRes.status === 401) {
      if (metarDiv) metarDiv.textContent = `CheckWX API Key Error: Please verify your API key in js/weather.js.`;
    } else if (metarRes.status === 429) {
      if (metarDiv) metarDiv.textContent = `Rate limit exceeded: Daily CheckWX request quota reached.`;
    } else {
      if (metarDiv) metarDiv.textContent = `Unable to retrieve METAR for ${icaoQuery} (HTTP ${metarRes.status}).`;
    }
  } catch (e) {
    if (metarDiv) metarDiv.textContent = `Network error connecting to CheckWX API.`;
  }

  try {
    const tafRes = await fetch(`https://api.checkwx.com/taf/${icaoQuery}`, { headers });
    if (tafRes.ok) {
      const data = await tafRes.json();
      if (data.data && data.data.length > 0) {
        let tafOutputs = [];
        data.data.forEach(tafData => {
          const rawTaf = typeof tafData === 'string' ? tafData : (tafData.raw_text || JSON.stringify(tafData));
          tafOutputs.push(rawTaf);
        });
        if (tafDiv) tafDiv.textContent = tafOutputs.join('\n\n');
      } else {
        if (tafDiv) tafDiv.textContent = `No active TAF report found for ${icaoQuery}.`;
      }
    } else {
      if (tafDiv) tafDiv.textContent = `No TAF report available for ${icaoQuery}.`;
    }
  } catch (e) {
    if (tafDiv) tafDiv.textContent = `Error loading TAF feed.`;
  }
}
