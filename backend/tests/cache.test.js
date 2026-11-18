import assert from 'node:assert/strict';
import { cacheEngine, cacheResponse, invalidateCache } from '../utils/cache.js';

console.log('🧪 Starting Cache Engine & Middleware Unit Tests...');

// 1. Basic Set & Get
cacheEngine.set('test:key1', { message: 'hello' }, 10, 'test-tag');
const val1 = cacheEngine.get('test:key1');
assert.deepStrictEqual(val1, { message: 'hello' }, 'Cache should retrieve stored object');
console.log('  ✔ PASS: Basic Set & Get');

// 2. Metrics Tracking
const metrics1 = cacheEngine.getMetrics();
assert(metrics1.hits >= 1, 'Hits should increment on successful retrieval');
assert.strictEqual(cacheEngine.get('non-existent-key'), null);
const metrics2 = cacheEngine.getMetrics();
assert(metrics2.misses >= 1, 'Misses should increment on non-existent key');
console.log('  ✔ PASS: Metrics tracking (Hits & Misses)');

// 3. Tag-based Invalidation (Array and single string tags)
cacheEngine.set('item:1', 'apple', 10, ['fruits']);
cacheEngine.set('item:2', 'banana', 10, ['fruits', 'yellow']);
cacheEngine.set('item:3', 'carrot', 10, 'vegetables');

assert.strictEqual(cacheEngine.get('item:1'), 'apple');
assert.strictEqual(cacheEngine.get('item:2'), 'banana');
assert.strictEqual(cacheEngine.get('item:3'), 'carrot');

const purged = invalidateCache(['fruits']);
assert.strictEqual(purged, 2, 'Should purge exactly 2 keys tagged with fruits');
assert.strictEqual(cacheEngine.get('item:1'), null, 'item:1 should be purged');
assert.strictEqual(cacheEngine.get('item:2'), null, 'item:2 should be purged');
assert.strictEqual(cacheEngine.get('item:3'), 'carrot', 'item:3 should remain intact');
console.log('  ✔ PASS: Tag-based Invalidation (Purged 2 keys cleanly)');

// 4. Express Cache Middleware Simulation
const mockReq = { originalUrl: '/api/zones', method: 'GET' };
const mockHeaders = {};
const mockRes = {
  statusCode: 200,
  setHeader: (k, v) => { mockHeaders[k] = v; },
  status: function(code) { this.statusCode = code; return this; },
  json: function(body) {
    this._body = body;
    return this;
  }
};
let nextCalled = false;
const middleware = cacheResponse(15, 'zones');

// First pass: Miss
middleware(mockReq, mockRes, () => {
  nextCalled = true;
  mockRes.json({ zones: [1, 2, 3] });
});
assert.strictEqual(nextCalled, true, 'Next should be called on cache miss');
assert.strictEqual(mockHeaders['X-Cache'], 'MISS', 'Header should be MISS');

// Second pass: Hit
const mockRes2 = {
  statusCode: 200,
  setHeader: (k, v) => { mockHeaders[k] = v; },
  status: function(code) { this.statusCode = code; return this; },
  json: function(body) {
    this._body = body;
    return this;
  }
};
let nextCalled2 = false;
middleware(mockReq, mockRes2, () => {
  nextCalled2 = true;
});
assert.strictEqual(nextCalled2, false, 'Next should NOT be called on cache hit');
assert.strictEqual(mockHeaders['X-Cache'], 'HIT', 'Header should be HIT');
assert.deepStrictEqual(mockRes2._body, { zones: [1, 2, 3] });
console.log('  ✔ PASS: Express cacheResponse middleware HIT / MISS');

console.log('\n🎉 ALL CACHE TESTS PASSED SUCCESSFULLY!');
