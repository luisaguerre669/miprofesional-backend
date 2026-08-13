const MONGO_OP_KEYS = ['$where', '$regex', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin', '$or', '$and', '$nor', '$not', '$exists', '$expr', '$jsonSchema', '$mod', '$elemMatch', '$geoIntersects', '$geoWithin', '$near', '$nearSphere', '$all', '$size', '$bitsAllClear', '$bitsAllSet', '$bitsAnyClear', '$bitsAnySet', '$comment', '$natural', '$currentDate', '$inc', '$min', '$max', '$mul', '$rename', '$setOnInsert', '$set', '$unset', '$addToSet', '$pop', '$pull', '$push', '$pullAll', '$each', '$position', '$slice', '$sort'];

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    let cleaned = value.replace(/<[^>]*>/g, '').replace(/[\${}]/, '').trim();
    return cleaned;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const sanitized = {};
    for (const k of Object.keys(value)) {
      if (MONGO_OP_KEYS.includes(k)) continue;
      sanitized[k] = sanitizeValue(value[k]);
    }
    return sanitized;
  }
  return value;
};

const SKIP_FIELDS = new Set(['password', 'newPassword', 'currentPassword', 'confirmPassword', 'token']);

const inputSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const keys = Object.keys(req.body);
    for (let i = 0; i < keys.length; i++) {
      if (SKIP_FIELDS.has(keys[i])) continue;
      req.body[keys[i]] = sanitizeValue(req.body[keys[i]]);
    }
  }
  if (req.query && typeof req.query === 'object') {
    for (const k of Object.keys(req.query)) {
      req.query[k] = sanitizeValue(req.query[k]);
    }
  }
  if (req.params && typeof req.params === 'object') {
    for (const k of Object.keys(req.params)) {
      req.params[k] = sanitizeValue(req.params[k]);
    }
  }
  next();
};

module.exports = { inputSanitizer };
