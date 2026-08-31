async function fetchMetarTaf() {
  let icao = document.getElementById('icaoInput').value.trim().toUpperCase();
  if (!icao || icao.length !== 4) {
    alert('Please enter a valid 4-letter ICAO code.');
    return;
  }

  const metarDiv = document.getElementById('metarOutput');
  const tafDiv = document.getElementById('tafOutput');

  metarDiv.textContent = `Fetching METAR for ${icao}...`;
  tafDiv.textContent = `Fetching TAF for ${icao}...`;

  const rawMetarUrl = `https://aviationweather.gov/api/data/metar?ids=${icao}&format=raw`;
  const rawTafUrl = `https://aviationweather.gov/api/data/taf?ids=${icao}&format=raw`;

  async function fetchWithFallback(targetUrl) {
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
    ];

    for (let proxyUrl of proxies) {
      try {
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const text = await res.text();
          if (text) return text.trim();
        }
      } catch (e) {
        // Try next proxy
      }
    }
    return '';
  }

  fetchWithFallback(rawMetarUrl).then(text => {
    metarDiv.textContent = text ? text : `No active METAR report found for ${icao}.`;
    updateDecoderState();
  });

  fetchWithFallback(rawTafUrl).then(text => {
    tafDiv.textContent = text ? text : `No active TAF report found for ${icao}.`;
    updateDecoderState();
  });
}

function updateDecoderState() {
  const metarText = document.getElementById('metarOutput').textContent;
  const tafText = document.getElementById('tafOutput').textContent;
  if (!metarText.includes("Fetching") && !tafText.includes("Fetching")) {
    decodeWeatherString(metarText, tafText);
  }
}

function decodeWeatherString(rawMetar, rawTaf) {
  let output = [];
  
  if (rawMetar && !rawMetar.includes("No active") && !rawMetar.includes("Error")) {
    output.push("=== METAR BREAKDOWN ===");
    
    const windMatch = rawMetar.match(/\b(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT\b/);
    if (windMatch) {
      let dir = windMatch[1] === "VRB" ? "Variable" : windMatch[1] + "°";
      let spd = windMatch[2] + " knots";
      let gust = windMatch[4] ? `, Gusting ${windMatch[4]} knots` : "";
      output.push(`• Wind: From ${dir} at ${spd}${gust}`);
    }

    const visMatch = rawMetar.match(/\b(\d{4})\b/);
    if (visMatch) {
      let visVal = visMatch[1] === "9999" ? "10+ km (Clear visibility)" : `${visMatch[1]} meters`;
      output.push(`• Visibility: ${visVal}`);
    }

    const qnhMatch = rawMetar.match(/\bQ(\d{4})\b/);
    const altimMatch = rawMetar.match(/\bA(\d{4})\b/);
    if (qnhMatch) {
      output.push(`• Altimeter (QNH): ${qnhMatch[1]} hPa`);
    } else if (altimMatch) {
      let inHg = (parseInt(altimMatch[1]) / 100).toFixed(2);
      output.push(`• Altimeter: ${inHg} inHg (${altimMatch[1]})`);
    }

    let wxTempMatch = rawMetar.match(/\b(M?\d{2})\/(M?\d{2})\b/);
    if (wxTempMatch) {
      let temp = wxTempMatch[1].replace('M', '-');
      let dew = wxTempMatch[2].replace('M', '-');
      output.push(`• Temperature: ${temp}°C | Dew Point: ${dew}°C`);
    }
  } else {
    output.push("• No METAR available to decode.");
  }

  if (rawTaf && !rawTaf.includes("No active") && !rawTaf.includes("Error")) {
    output.push("\n=== TAF OVERVIEW ===");
    output.push("• Terminal Forecast is active. Review raw TAF text above for tempo changes, visibility trends, and wind shifts.");
  }

  document.getElementById('decoderOutput').textContent = output.join('\n');
}