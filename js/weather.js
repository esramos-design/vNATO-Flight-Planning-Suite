
// ============================================================================
// VIRTUAL NATO FLIGHT PLANNING SUITE - WEATHER.JS (V5.0.9.ALPHA)
// CheckWX API Integration & Column Grid Weather Fetcher
// ============================================================================

// Replace with your CheckWX API Key or configure via settings
const CHECKWX_API_KEY = "d6bfc15fbcb744b98d259eb2f20495d6";

async function fetchMetarTaf() {
  const inputVal = document.getElementById('icaoInput').value.trim();
  if (!inputVal) {
    alert('Please enter at least one ICAO code (e.g. LFBO, EGLL).');
    return;
  }

  const icaos = inputVal.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
  if (icaos.length === 0) return;

  const metarContainer = document.getElementById('metarOutput');
  const tafContainer = document.getElementById('tafOutput');
  const decoderContainer = document.getElementById('decoderOutput');

  metarContainer.innerHTML = 'Fetching METAR reports from CheckWX API...';
  tafContainer.innerHTML = 'Fetching TAF reports from CheckWX API...';
  decoderContainer.innerHTML = 'Decoding weather parameters...';

  if (CHECKWX_API_KEY === 'YOUR_CHECKWX_API_KEY_HERE') {
    metarContainer.innerHTML = '<span style="color: #ef4444;">Error: Please configure your CheckWX API key in weather.js</span>';
    tafContainer.innerHTML = '<span style="color: #ef4444;">API key missing.</span>';
    decoderContainer.innerHTML = '<span style="color: #ef4444;">API key missing.</span>';
    return;
  }

  const stationsQuery = icaos.join(',');
  const headers = {
    'X-API-Key': CHECKWX_API_KEY
  };

  try {
    const [metarRes, tafRes] = await Promise.all([
      fetch(`https://api.checkwx.com/metar/${stationsQuery}/decoded`, { headers }),
      fetch(`https://api.checkwx.com/taf/${stationsQuery}/decoded`, { headers })
    ]);

    const metarData = await metarRes.json();
    const tafData = await tafRes.json();

    let metarHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">';
    let tafHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">';
    let decoderHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;">';

    // Process METARs
    if (metarData && metarData.data && metarData.data.length > 0) {
      metarData.data.forEach(m => {
        metarHtml += `
          <div style="background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px;">
            <div style="font-weight: bold; color: #002B49; margin-bottom: 4px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; font-size: 12px;">${m.icao} METAR</div>
            <div style="font-family: monospace; font-size: 11px; color: #334155; word-break: break-all;">${m.raw || 'No raw METAR available'}</div>
          </div>
        `;

        // Compact Decoded Weather Column Card with Reduced Spacing
        const windStr = m.wind ? `${m.wind.degrees || 'VRB'}° at ${m.wind.speed_kts || 0} kts${m.wind.gust_kts ? ' (Gusts: ' + m.wind.gust_kts + ' kts)' : ''}` : 'Calm / Not Reported';
        const visStr = m.visibility ? `${m.visibility.miles || m.visibility.meters || 'VMC'} SM` : 'Not Reported';
        const tempStr = m.temperature ? `${m.temperature.celsius}°C (Dewpoint: ${m.dewpoint ? m.dewpoint.celsius : 'N/A'}°C)` : 'Not Reported';
        const altStr = m.barometer ? `${m.barometer.hg || 'N/A'} inHg (${m.barometer.mb || 'N/A'} hPa)` : 'Not Reported';

        decoderHtml += `
          <div style="background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; margin-bottom: 0;">
            <div style="font-weight: bold; color: #002B49; font-size: 12px; margin-bottom: 4px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Station ${m.icao}</div>
            <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #334155; line-height: 1.25;">
              <li style="margin-bottom: 2px;"><b>Wind:</b> ${windStr}</li>
              <li style="margin-bottom: 2px;"><b>Visibility:</b> ${visStr}</li>
              <li style="margin-bottom: 2px;"><b>Temp / Dewpoint:</b> ${tempStr}</li>
              <li style="margin-bottom: 0;"><b>Altimeter:</b> ${altStr}</li>
            </ul>
          </div>
        `;
      });
    } else {
      metarHtml += '<div style="padding: 10px; font-size: 12px; color: #64748b;">No METAR data returned for specified stations.</div>';
      decoderHtml += '<div style="padding: 10px; font-size: 12px; color: #64748b;">No weather data to decode.</div>';
    }

    // Process TAFs
    if (tafData && tafData.data && tafData.data.length > 0) {
      tafData.data.forEach(t => {
        tafHtml += `
          <div style="background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px;">
            <div style="font-weight: bold; color: #002B49; margin-bottom: 4px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; font-size: 12px;">${t.icao} TAF</div>
            <div style="font-family: monospace; font-size: 11px; color: #334155; word-break: break-all;">${t.raw || 'No raw TAF available'}</div>
          </div>
        `;
      });
    } else {
      tafHtml += '<div style="padding: 10px; font-size: 12px; color: #64748b;">No TAF data returned for specified stations.</div>';
    }

    metarHtml += '</div>';
    tafHtml += '</div>';
    decoderHtml += '</div>';

    metarContainer.innerHTML = metarHtml;
    tafContainer.innerHTML = tafHtml;
    decoderContainer.innerHTML = decoderHtml;

  } catch (err) {
    console.error('CheckWX API Fetch Error:', err);
    metarContainer.innerHTML = '<span style="color: #ef4444;">Failed to retrieve METAR reports from API. Check network or API key.</span>';
    tafContainer.innerHTML = '<span style="color: #ef4444;">Failed to retrieve TAF forecasts from API.</span>';
    decoderContainer.innerHTML = '<span style="color: #ef4444;">Decoder offline due to API error.</span>';
  }
}
