const express = require('express');
const { getPromoStatus } = require('../models/PromoCounter');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/promo/status
router.get('/status', async (req, res) => {
  try {
    const status = await getPromoStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    logger.error('Promo status error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estado de la promoción' });
  }
});

module.exports = router;