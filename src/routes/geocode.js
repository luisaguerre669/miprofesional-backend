const express = require('express');
const { geocodeAddress, reverseGeocode } = require('../utils/geocode');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/geocode/search?q=...&city=...&state=...&country=...
// Forward geocoding: convert an address/query into coordinates.
router.get('/search', async (req, res) => {
  try {
    const { q, address, city, state, country } = req.query;
    const query = q || address || '';
    if (!query && !city) {
      return res.status(400).json({ success: false, message: 'Query parameter "q" (or "address" or "city") required' });
    }
    const result = await geocodeAddress({
      address: query || '',
      city: city || query || '',
      state: state || '',
      country: country || 'Argentina'
    });
    if (!result) {
      return res.json({ success: true, data: null, message: 'No se encontraron resultados' });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('Geocode search error:', err);
    res.status(500).json({ success: false, message: 'Error al geocodificar' });
  }
});

// GET /api/geocode/reverse?lat=...&lng=...
// Reverse geocoding: convert coordinates into an address.
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'lat and lng query params required' });
    }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ success: false, message: 'Invalid lat/lng values' });
    }
    const result = await reverseGeocode({ latitude, longitude });
    if (!result) {
      return res.json({ success: true, data: null, message: 'No se pudo resolver la dirección' });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('Reverse geocode error:', err);
    res.status(500).json({ success: false, message: 'Error al resolver dirección' });
  }
});

module.exports = router;