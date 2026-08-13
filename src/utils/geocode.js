const logger = require('./logger');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

const NOMINATIM_HEADERS = { 'User-Agent': 'MiProfesional/1.0 (miprofesional.online)' };
const TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, attempts = MAX_ATTEMPTS) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, {
        headers: NOMINATIM_HEADERS,
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        lastError = new Error(`Nominatim returned HTTP ${res.status}`);
        logger.warn(`Nominatim returned ${res.status} for: ${url}`);
        if (res.status === 403 || res.status === 429 || res.status >= 500) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
        return null;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        logger.error(`Nominatim request timed out (attempt ${attempt}/${attempts})`);
      } else {
        logger.error(`Nominatim request failed (attempt ${attempt}/${attempts}):`, err.message);
      }
      if (attempt < attempts) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  logger.error(`Nominatim request failed after ${attempts} attempts:`, lastError?.message);
  return null;
}

function normalize(text) {
  if (!text) return '';
  let s = text.trim().replace(/\s+/g, ' ');
  // Expand abbreviations: match word optionally followed by period
  s = s.replace(/\bAv\.?(?:\s|$)/gi, (m) => m.startsWith('Av') || m.startsWith('av') ? 'Avenida ' : 'avenida ');
  s = s.replace(/\bCll\.?(?:\s|$)/gi, (m) => m.startsWith('C') || m.startsWith('c') ? 'Calle ' : 'calle ');
  s = s.replace(/\bCra\.?(?:\s|$)/gi, (m) => m.startsWith('C') || m.startsWith('c') ? 'Carrera ' : 'carrera ');
  s = s.replace(/\bNro?\.?(?:\s|$)/gi, 'Numero ');
  s = s.replace(/\bBs\s*As\.?\b/gi, 'Buenos Aires');
  s = s.replace(/\bCABA\b/gi, 'Ciudad Autonoma de Buenos Aires');
  s = s.replace(/\bPcia\.?(?:\s|$)/gi, 'Provincia ');
  s = s.replace(/\bSta\.?(?:\s|$)/gi, 'Santa ');
  s = s.replace(/\bS\/N\b/gi, '');
  s = s.replace(/\.(?=\s|$)|\.(?=\.)/g, '');
  s = s.replace(/[<>{}[\]'"`]/g, '');
  return s.replace(/\s+/g, ' ').trim();
}

function parseStreetNumber(text) {
  if (!text) return null;
  const match = text.match(/(\d+)\s*$/);
  return match ? match[1] : null;
}

function selectBestResult(results, { city, state, streetNumber }) {
  if (!results || results.length === 0) return null;

  const cityLower = city ? city.toLowerCase().trim() : '';
  const stateLower = state ? state.toLowerCase().trim() : '';

  const scored = results.map(r => {
    let score = r.importance || 0.5;
    const display = (r.display_name || '').toLowerCase();
    const addr = r.address || {};

    if (cityLower && display.includes(cityLower)) score += 0.3;
    if (stateLower && display.includes(stateLower)) score += 0.2;

    if (r.type === 'house' || r.type === 'building') score += 0.4;
    else if (r.type === 'amenity' || r.type === 'shop') score += 0.1;

    if (r.type === 'city' || r.type === 'town' || r.type === 'village') score -= 0.2;
    if (r.category === 'place' || r.category === 'boundary') score -= 0.3;
    if (r.class === 'highway' || r.type === 'road' || r.type === 'street') score -= 0.3;

    if (addr.house_number && streetNumber) {
      if (addr.house_number === streetNumber) score += 0.5;
      else score -= 0.2;
    } else if (streetNumber && display.includes(streetNumber)) {
      score += 0.3;
    }

    if (cityLower && !display.includes(cityLower)) score -= 0.5;
    if (stateLower && !display.includes(stateLower)) score -= 0.3;

    return { result: r, score };
  });

  scored.sort((a, b) => b.score - a.score);

  logger.debug(`Geocode selection for city="${city}" state="${state}":`, {
    candidates: results.map(r => ({ display: r.display_name, importance: r.importance, type: r.type })),
    selected: scored[0]?.result?.display_name,
    score: scored[0]?.score
  });

  return scored[0].result;
}

async function geocodeAddress({ address, city, state, country = 'Argentina' }) {
  const normAddr = normalize(address);
  const normCity = normalize(city);
  const normState = normalize(state);
  const streetNumber = parseStreetNumber(address);

  const parts = [normAddr, normCity, normState, 'Argentina'].filter(Boolean);
  if (parts.length < 2) {
    logger.warn('Geocode: insufficient address parts', { address, city, state });
    return null;
  }

  const query = parts.join(', ');
  const q = encodeURIComponent(query);
  const url = `${NOMINATIM_URL}?format=json&q=${q}&limit=15&countrycodes=ar&addressdetails=1&accept-language=es`;

  logger.debug(`Geocode request URL: ${url}`);

  try {
    const res = await fetchWithRetry(url);
    if (!res) return null;

    const data = await res.json();
    logger.debug(`Nominatim response count: ${data?.length || 0}`, {
      query,
      firstResult: data?.[0]?.display_name || 'none'
    });

    if (!data || data.length === 0) {
      logger.warn(`No results from Nominatim for: ${query}`);
      return null;
    }

    const best = selectBestResult(data, { city: normCity, state: normState, streetNumber });
    if (!best) {
      logger.warn(`No valid result after selection for: ${query}`);
      return null;
    }

    const { lat, lon, display_name } = best;
    const addr = best.address || {};
    logger.info(`Geocoded: ${query} -> ${lat}, ${lon} | ${display_name}`);

    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      displayName: display_name,
      street: addr.road || '',
      number: addr.house_number || '',
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      state: addr.state || '',
      country: addr.country || 'Argentina',
      neighborhood: addr.neighbourhood || addr.suburb || ''
    };
  } catch (err) {
    logger.error('Geocode request failed:', err.message);
    return null;
  }
}

async function reverseGeocode({ latitude, longitude, zoom = 18 }) {
  if (latitude === undefined || longitude === undefined || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
    logger.warn('Reverse geocode: invalid coordinates', { latitude, longitude });
    return null;
  }
  const url = `${NOMINATIM_REVERSE_URL}?format=json&lat=${latitude}&lon=${longitude}&zoom=${zoom}&addressdetails=1&accept-language=es`;
  logger.debug(`Reverse geocode URL: ${url}`);

  try {
    const res = await fetchWithRetry(url);
    if (!res) return null;

    const data = await res.json();
    if (!data || data.error) {
      logger.warn(`No reverse geocode result for ${latitude}, ${longitude}`, { error: data?.error });
      return null;
    }

    const addr = data.address || {};
    return {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      displayName: data.display_name || '',
      street: addr.road || '',
      number: addr.house_number || '',
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      state: addr.state || '',
      country: addr.country || 'Argentina',
      neighborhood: addr.neighbourhood || addr.suburb || ''
    };
  } catch (err) {
    logger.error('Reverse geocode failed:', err.message);
    return null;
  }
}

module.exports = { geocodeAddress, reverseGeocode };
