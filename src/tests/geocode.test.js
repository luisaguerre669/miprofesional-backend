// Tests mínimos de geocodificación (forward + reverse + manejo de errores).
// Ejecutar: node --test src/tests/geocode.test.js
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const express = require('express');
const geocodeRouter = require('../routes/geocode');
const { geocodeAddress, reverseGeocode } = require('../utils/geocode');

const REAL_TIMEOUT = 60000;

function buildApp() {
  const app = express();
  app.use('/api/geocode', geocodeRouter);
  return app;
}

describe('GET /api/geocode/search (forward geocoding)', () => {
  test('resuelve una ciudad a coordenadas', async () => {
    const res = await request(buildApp())
      .get('/api/geocode/search')
      .query({ q: 'La Plata' })
      .timeout({ deadline: REAL_TIMEOUT });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data, 'espera data no-null');
    assert.ok(typeof res.body.data.latitude === 'number', 'latitude numérica');
    assert.ok(typeof res.body.data.longitude === 'number', 'longitude numérica');
    assert.ok(res.body.data.latitude < -30 && res.body.data.latitude > -55, 'lat dentro de Argentina');
    assert.ok(res.body.data.displayName, 'displayName presente');
  });

  test('con una dirección completa devuelve street/number', async () => {
    const res = await request(buildApp())
      .get('/api/geocode/search')
      .query({ q: 'Avenida 7 530', city: 'La Plata', state: 'Buenos Aires' })
      .timeout({ deadline: REAL_TIMEOUT });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data?.latitude, 'lat presente');
  });

  test('devuelve 400 si falta q y city', async () => {
    const res = await request(buildApp())
      .get('/api/geocode/search')
      .timeout({ deadline: REAL_TIMEOUT });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('devuelve data:null (200) si no hay resultados', async () => {
    const res = await request(buildApp())
      .get('/api/geocode/search')
      .query({ q: 'zzzzzqqqqzzzzxxxyyy' })
      .timeout({ deadline: REAL_TIMEOUT });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data, null);
  });
});

describe('GET /api/geocode/reverse (reverse geocoding)', () => {
  test('resuelve coordenadas de La Plata a dirección', async () => {
    const res = await request(buildApp())
      .get('/api/geocode/reverse')
      .query({ lat: -34.9206797, lng: -57.9537638 })
      .timeout({ deadline: REAL_TIMEOUT });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data, 'espera data no-null');
    assert.ok(res.body.data.displayName, 'displayName presente');
  });

  test('devuelve 400 si faltan lat/lng', async () => {
    const res = await request(buildApp())
      .get('/api/geocode/reverse')
      .timeout({ deadline: REAL_TIMEOUT });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('devuelve 400 si lat/lng no son numéricos', async () => {
    const res = await request(buildApp())
      .get('/api/geocode/reverse')
      .query({ lat: 'abc', lng: 'def' })
      .timeout({ deadline: REAL_TIMEOUT });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });
});

describe('Manejo de errores de Nominatim', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('geocodeAddress devuelve null ante error HTTP 403 sin lanzar', async () => {
    global.fetch = async () => ({ ok: false, status: 403 });
    const result = await geocodeAddress({ address: 'Av 7 530', city: 'La Plata', state: 'Buenos Aires' });
    assert.strictEqual(result, null);
  });

  test('geocodeAddress devuelve null ante HTTP 500 tras reintentos', async () => {
    global.fetch = async () => ({ ok: false, status: 500 });
    const result = await geocodeAddress({ address: 'Av 7 530', city: 'La Plata', state: 'Buenos Aires' });
    assert.strictEqual(result, null);
  });

  test('geocodeAddress devuelve null si Nominatim responde vacío', async () => {
    global.fetch = async () => ({ ok: true, json: async () => [] });
    const result = await geocodeAddress({ address: 'Av 7 530', city: 'La Plata' });
    assert.strictEqual(result, null);
  });

  test('reverseGeocode devuelve null si Nominatim responde con error', async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ error: 'Unable to geocode' }) });
    const result = await reverseGeocode({ latitude: -34.92, longitude: -57.95 });
    assert.strictEqual(result, null);
  });

  test('reverseGeocode valida coordenadas inválidas sin llamar a Nominatim', async () => {
    let called = false;
    global.fetch = async () => { called = true; };
    const result = await reverseGeocode({ latitude: NaN, longitude: 0 });
    assert.strictEqual(result, null);
    assert.strictEqual(called, false);
  });

  test('el endpoint responde 200 data:null ante fallo de Nominatim (no 500)', async () => {
    global.fetch = async () => { throw new Error('network down'); };
    const res = await request(buildApp())
      .get('/api/geocode/search')
      .query({ q: 'Calle Falsa 123' })
      .timeout({ deadline: REAL_TIMEOUT });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data, null);
  });
});