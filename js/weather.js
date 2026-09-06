// ============================================================================
// VIRTUAL NATO FLIGHT PLANNING SUITE - WEATHER.JS (V5.0.12.ALPHA)
// CheckWX API Integration & Compact Stylized Two-Column METAR/TAF Layout
// ============================================================================

const CHECKWX_API_KEY = "d6bfc15fbcb744b98d259eb2f20495d6";

async function fetchMetarTaf() {
  const inputEl = document.getElementById('icaoInput');
  const inputVal = inputEl ? inputEl.value.trim() : '';
  if (!inputVal) {
    alert('Please enter at least one ICAO code (e.g. LFBO, EGLL).');
    return;
  }

  const icaos = inputVal.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
  if (icaos.length === 0) return;

  const metarOutput = document.getElementById('metarOutput');
  const tafOutput = document.getElementById('tafOutput');
  const decoderOutput = document.getElementById('decoderOutput');

  if (!metarOutput || !tafOutput || !decoderOutput) return;

  metarOutput.innerHTML = 'Fetching METAR reports...';
  tafOutput.innerHTML = 'Fetching TAF reports...';
  decoderOutput.innerHTML = 'Decoding weather parameters...';

  if (CHECKWX_API_KEY === 'YOUR_CHECKWX_API_KEY_HERE') {
    metarOutput.innerHTML = '<span style="color: #ef4444;">Error: Please configure your CheckWX API key in weather.js</span>';
    tafOutput.innerHTML = '<span style="color: #ef4444;">API key missing.</span>';
    decoderOutput.innerHTML = '<span style="color: #ef4444;">API key missing.</span>';
    return;
  }

  const stationsQuery = icaos.join(',');
  const headers = { 'X-API-Key': CHECKWX_API_KEY };

  try {
    const [metarRes, tafRes] = await Promise.all([
      fetch(`https://api.checkwx.com/metar/${stationsQuery}/decoded`, { headers }),
      fetch(`https://api.checkwx.com/taf/${stationsQuery}/decoded`, { headers })
    ]);

    const metarData = await metarRes.json();
    const tafData = await tafRes.json();

    let metarHtml = '';
    let tafHtml = '';
    let decoderHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 6px;">';

    // Process METARs
    if (metarData && metarData.data && metarData.data.length > 0) {
      metarData.data.forEach(m => {
        const rawText = m.raw_text || m.raw || 'No raw METAR available';
        metarHtml += `
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 3px solid #0072CE; border-radius: 4px; padding: 6px 8px; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">
              <span style="font-weight: bold; color: #002B49; font-size: 11px;">${m.icao} METAR</span>
              <span style="font-size: 9px; background: #e0f2fe; color: #0369a1; padding: 1px 4px; border-radius: 3px; font-weight: bold;">LIVE</span>
            </div>
            <div style="font-family: monospace; font-size: 11px; color: #334155; word-break: break-all; line-height: 1.2;">${rawText}</div>
          </div>
        `;

        const windStr = m.wind ? `${m.wind.degrees || 'VRB'}° / ${m.wind.speed_kts || 0} kts${m.wind.gust_kts ? ' (G' + m.wind.gust_kts + ')' : ''}` : 'Calm';
        const visStr = m.visibility ? `${m.visibility.miles || m.visibility.meters || 'VMC'} SM` : 'N/A';
        const tempStr = m.temperature ? `${m.temperature.celsius}°C (DP: ${m.dewpoint ? m.dewpoint.celsius : 'N/A'}°C)` : 'N/A';
        const altStr = m.barometer ? `${m.barometer.hg || 'N/A'} inHg (${m.barometer.mb || 'N/A'} hPa)` : 'N/A';

        decoderHtml += `
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 8px;">
            <div style="font-weight: bold; color: #002B49; font-size: 11px; margin-bottom: 2px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">${m.icao} Parameters</div>
            <ul style="margin: 0; padding-left: 14px; font-size: 11px; color: #334155; line-height: 1.2;">
              <li style="margin-bottom: 1px;"><b>Wind:</b> ${windStr}</li>
              <li style="margin-bottom: 1px;"><b>Vis:</b> ${visStr}</li>
              <li style="margin-bottom: 1px;"><b>Temp:</b> ${tempStr}</li>
              <li style="margin-bottom: 0;"><b>QNH:</b> ${altStr}</li>
            </ul>
          </div>
        `;
      });
    } else {
      metarHtml = '<div style="padding: 6px; font-size: 11px; color: #64748b;">No METAR data returned.</div>';
      decoderHtml += '<div style="padding: 6px; font-size: 11px; color: #64748b;">No weather data to decode.</div>';
    }

    // Process TAFs
    if (tafData && tafData.data && tafData.data.length > 0) {
      tafData.data.forEach(t => {
        const rawTafText = t.raw_text || t.raw || 'No raw TAF available';
        tafHtml += `
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 3px solid #10b981; border-radius: 4px; padding: 6px 8px; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">
              <span style="font-weight: bold; color: #002B49; font-size: 11px;">${t.icao} TAF</span>
              <span style="font-size: 9px; background: #d1fae5; color: #065f46; padding: 1px 4px; border-radius: 3px; font-weight: bold;">FORECAST</span>
            </div>
            <div style="font-family: monospace; font-size: 11px; color: #334155; word-break: break-all; line-height: 1.2;">${rawTafText}</div>
          </div>
        `;
      });
    } else {
      tafHtml = '<div style="padding: 6px; font-size: 11px; color: #64748b;">No TAF data returned.</div>';
    }

    decoderHtml += '</div>';

    metarOutput.innerHTML = metarHtml;
    tafOutput.innerHTML = tafHtml;
    decoderOutput.innerHTML = decoderHtml;

  } catch (err) {
    console.error('CheckWX API Fetch Error:', err);
    metarOutput.innerHTML = '<span style="color: #ef4444; font-size: 11px;">Failed to retrieve METAR reports.</span>';
    tafOutput.innerHTML = '<span style="color: #ef4444; font-size: 11px;">Failed to retrieve TAF forecasts.</span>';
    decoderOutput.innerHTML = '<span style="color: #ef4444; font-size: 11px;">Decoder offline due to API error.</span>';
  }
}
