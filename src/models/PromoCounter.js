const mongoose = require("mongoose");

const PROMO_MAX = 700;

// In-memory cache
let cache = { data: null, ts: 0 };
const CACHE_TTL = 3000; // 3 seconds

const promoSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
}, { timestamps: true });

const PromoCounter = mongoose.model("PromoCounter", promoSchema);

async function getDoc() {
  let doc = await PromoCounter.findOne({ key: "first_700" });
  if (!doc) {
    doc = await PromoCounter.create({ key: "first_700", count: 0 });
  }
  return doc;
}

async function getRemainingSpots() {
  try {
    const doc = await getDoc();
    return Math.max(0, PROMO_MAX - doc.count);
  } catch {
    return 0;
  }
}

async function getPromoStatus() {
  const now = Date.now();
  if (cache.data && now - cache.ts < CACHE_TTL) {
    return cache.data;
  }
  try {
    const doc = await getDoc();
    const used = doc.count;
    const remaining = Math.max(0, PROMO_MAX - used);
    const active = remaining > 0;
    const data = { total: PROMO_MAX, used, remaining, active };
    cache = { data, ts: now };
    return data;
  } catch {
    return { total: PROMO_MAX, used: 0, remaining: 0, active: false };
  }
}

function invalidateCache() {
  cache = { data: null, ts: 0 };
}

async function incrementPromo() {
  try {
    await PromoCounter.updateOne({ key: "first_700" }, { $inc: { count: 1 } }, { upsert: true });
    invalidateCache();
  } catch {
    // best-effort
  }
}

async function resetPromo() {
  try {
    await PromoCounter.updateOne({ key: "first_700" }, { $set: { count: 0 } }, { upsert: true });
    invalidateCache();
    return await getPromoStatus();
  } catch {
    return { total: PROMO_MAX, used: 0, remaining: 0, active: false };
  }
}

async function getTrialDays() {
  const remaining = await getRemainingSpots();
  return remaining > 0 ? 60 : 30;
}

module.exports = PromoCounter;
module.exports.getRemainingSpots = getRemainingSpots;
module.exports.getPromoStatus = getPromoStatus;
module.exports.incrementPromo = incrementPromo;
module.exports.resetPromo = resetPromo;
module.exports.getTrialDays = getTrialDays;