const express = require('express');
const { getPromoStatus, resetPromo } = require('../models/PromoCounter');
const Professional = require('../models/Professional');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth');
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

// GET /api/promo/stats — breakdown by role (admin only)
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const status = await getPromoStatus();
    const promoPros = await Professional.countDocuments({ promoApplied: true });
    const breakdown = await Professional.aggregate([
      { $match: { promoApplied: true } },
      { $group: { _id: '$primaryCategory', count: { $sum: 1 } } },
    ]);
    const byRole = { professional: 0, comercio: 0, empresa: 0 };
    for (const b of breakdown) {
      if (b._id === 'comercio') byRole.comercio = b.count;
      else if (b._id === 'empresa') byRole.empresa = b.count;
      else byRole.professional += b.count;
    }
    res.json({
      success: true,
      data: {
        total: status.total,
        used: status.used,
        remaining: status.remaining,
        active: status.active,
        byRole,
        totalAdheridos: promoPros,
      },
    });
  } catch (error) {
    logger.error('Promo stats error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas de la promoción' });
  }
});

// POST /api/promo/reset — admin only
router.post('/reset', authenticate, requireAdmin, async (req, res) => {
  try {
    const status = await resetPromo();
    // Also clear promoApplied flag from all professionals
    await Professional.updateMany({ promoApplied: true }, { $set: { promoApplied: false } });
    logger.info('Promo reset by admin', { adminId: req.user._id });
    res.json({ success: true, message: 'Promoción restablecida exitosamente', data: status });
  } catch (error) {
    logger.error('Promo reset error:', error);
    res.status(500).json({ success: false, message: 'Error al restablecer la promoción' });
  }
});

module.exports = router;
