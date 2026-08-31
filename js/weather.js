// CheckWX API Configuration
const CHECKWX_API_KEY = "d6bfc15fbcb744b98d259eb2f20495d6";

async function fetchMetarTaf() {
  const icaoInput = document.getElementById('icaoInput');
  if (!icaoInput) return;

  const icao = icaoInput.value.trim().toUpperCase();
  if (!icao || icao.length !== 4) {
    alert('Please enter a valid 4-letter ICAO code.');
    return;
  }

  const metarDiv = document.getElementById('metarOutput');
  const tafDiv = document.getElementById('tafOutput');
  const decoderDiv = document.getElementById('decoderOutput');

  if (metarDiv) metarDiv.textContent = `Fetching live METAR for ${icao}...`;
  if (tafDiv) tafDiv.textContent = `Fetching live TAF for ${icao}...`;
  if (decoderDiv) decoderDiv.textContent = 'Decoding weather parameters...';

  const headers = {
    'X-API-Key': CHECKWX_API_KEY
  };

  // 1. FETCH METAR & DECODED PARAMS
  try {
    const metarRes = await fetch(`https://api.checkwx.com/metar/${icao}/decoded`, { headers });
    if (metarRes.ok) {
      const data = await metarRes.json();
      if (data.data && data.data.length > 0) {
        const wx = data.data[0];
        
        // Display Raw METAR String
        if (metarDiv) {
          metarDiv.textContent = wx.raw_text || `No raw METAR string returned for ${icao}.`;
        }

        // Format Plain Language Decoder
        if (decoderDiv) {
          const windStr = wx.wind ? `${wx.wind.degrees ?? 'VRB'}° at ${wx.wind.speed_kts ?? 0} kts (Gusts: ${wx.wind.gust_kts ? wx.wind.gust_kts + ' kts' : 'None'})` : 'Calm / Unreported';
          const visStr = wx.visibility ? `${wx.visibility.miles ? wx.visibility.miles + ' SM' : (wx.visibility.meters ? wx.visibility.meters + ' m' : 'N/A')}` : 'Unreported';
          const tempStr = wx.temperature ? `${wx.temperature.celsius}°C (Dewpoint: ${wx.dewpoint ? wx.dewpoint.celsius + '°C' : 'N/A'})` : 'N/A';
          const altStr = wx.barometer ? `${wx.barometer.in_hg} inHg (${wx.barometer.hpa} hPa)` : 'N/A';
          const flightCat = wx.flight_category || 'UNKNOWN';

          decoderDiv.innerHTML = `
            <b>Flight Category:</b> ${flightCat}<br>
            <b>Wind:</b> ${windStr}<br>
            <b>Visibility:</b> ${visStr}<br>
            <b>Temperature:</b> ${tempStr}<br>
            <b>Altimeter:</b> ${altStr}
          `;
        }
      } else {
        if (metarDiv) metarDiv.textContent = `No active METAR report found for ${icao}.`;
        if (decoderDiv) decoderDiv.textContent = 'No decoder data available.';
      }
    } else if (metarRes.status === 401) {
      if (metarDiv) metarDiv.textContent = `CheckWX API Key Error: Please verify your API key in weather.js.`;
    } else if (metarRes.status === 429) {
      if (metarDiv) metarDiv.textContent = `Rate limit exceeded: Daily CheckWX request quota reached.`;
    } else {
      if (metarDiv) metarDiv.textContent = `Unable to retrieve METAR for ${icao} (HTTP ${metarRes.status}).`;
    }
  } catch (e) {
    if (metarDiv) metarDiv.textContent = `Network error connecting to CheckWX API.`;
  }

  // 2. FETCH TAF
  try {
    const tafRes = await fetch(`https://api.checkwx.com/taf/${icao}`, { headers });
    if (tafRes.ok) {
      const data = await tafRes.json();
      if (data.data && data.data.length > 0) {
        const tafData = data.data[0];
        if (tafDiv) {
          tafDiv.textContent = typeof tafData === 'string' ? tafData : (tafData.raw_text || JSON.stringify(tafData));
        }
      } else {
        if (tafDiv) tafDiv.textContent = `No active TAF report found for ${icao}.`;
      }
    } else {
      if (tafDiv) tafDiv.textContent = `No TAF report available for ${icao}.`;
    }
  } catch (e) {
    if (tafDiv) tafDiv.textContent = `Error loading TAF feed.`;
  }
}

// Fallback helper for UI tab switches
function updateDecoderState() {
  const decoderDiv = document.getElementById('decoderOutput');
  if (decoderDiv && decoderDiv.textContent === '') {
    decoderDiv.textContent = "Click 'Fetch Weather' to generate plain language breakdown...";
  }
}
