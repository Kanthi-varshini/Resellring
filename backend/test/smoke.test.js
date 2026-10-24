const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { startTest, stopTest, api, login } = require('./helpers');

let ctx, kabir, tara, zoya, newcomer;

before(async () => {
  ctx = await startTest();
  kabir = await login(ctx, 'kabir@demo.com');
  tara = await login(ctx, 'tara@demo.com');
  zoya = await login(ctx, 'zoya@demo.com');
  const reg = await api(ctx, 'POST', '/auth/register', { body: { name: 'New Buyer', email: 'new@example.com', password: 'New@12345' } });
  newcomer = reg.body;
  const imran = await login(ctx, 'imran@demo.com');
  ctx.tokens = { imran: imran.token };
});

after(async () => stopTest(ctx));

// ---- health & auth -------------------------------------------------------
test('health endpoint responds ok', async () => {
  const r = await api(ctx, 'GET', '/health');
  assert.equal(r.status, 200);
});

test('login rejects wrong password with 401', async () => {
  const r = await api(ctx, 'POST', '/auth/login', { body: { email: 'kabir@demo.com', password: 'nope@123' } });
  assert.equal(r.status, 401);
});

test('creating a listing requires auth (401)', async () => {
  const r = await api(ctx, 'POST', '/listings', { body: { title: 'X', category: 'books', price: 10, condition: 'good' } });
  assert.equal(r.status, 401);
});

// ---- listings ------------------------------------------------------------
test('marketplace browse is public with filters', async () => {
  const r = await api(ctx, 'GET', '/listings?category=books&maxPrice=900');
  assert.equal(r.status, 200);
  assert.ok(r.body.every((l) => l.category === 'books' && l.price <= 900));
  assert.ok(!r.body.some((l) => l.status === 'sold'), 'sold items hidden from browse');
});

test('keyword search matches titles', async () => {
  const r = await api(ctx, 'GET', '/listings?q=lamp');
  assert.equal(r.status, 200);
  assert.ok(r.body.some((l) => l.title.includes('lamp')));
});

test('listing detail includes category price history', async () => {
  // fresh book listing — its category already has 3 sold books in the seed
  const create = await api(ctx, 'POST', '/listings', { token: newcomer.token, body: { title: 'Gate Overflow book', category: 'books', price: 600, condition: 'good' } });
  const r = await api(ctx, 'GET', `/listings/${create.body._id}`, { token: tara.token });
  assert.equal(r.status, 200);
  assert.ok(r.body.categoryPriceHistory.length >= 2, 'seed has sold books for price history');
  assert.ok(r.body.categoryPriceHistory.every((h) => h.soldPrice !== null));
});

test('seller cannot offer on their own listing (400)', async () => {
  const r = await api(ctx, 'POST', `/listings/${ctx.data.phone._id}/offers`, { token: kabir.token, body: { amount: 1000 } });
  assert.equal(r.status, 400);
});

test('a buyer holds only one live offer per listing (409 on second)', async () => {
  const r = await api(ctx, 'POST', `/listings/${ctx.data.phone._id}/offers`, { token: tara.token, body: { amount: 18000 } });
  assert.equal(r.status, 409);
});

// ---- offer state machine -------------------------------------------------
test('seller counters an open offer (open → countered)', async () => {
  const r = await api(ctx, 'PATCH', `/offers/${ctx.data.offer1._id}/counter`, { token: kabir.token, body: { amount: 19500 } });
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'countered');
  assert.ok(r.body.history.some((h) => h.action === 'countered'));
});

test('buyer cannot accept their own offer (403) — only the seller', async () => {
  const r = await api(ctx, 'PATCH', `/offers/${ctx.data.offer1._id}/accept`, { token: tara.token });
  assert.equal(r.status, 403);
});

test('withdrawing a countered offer works (countered → withdrawn)', async () => {
  const r = await api(ctx, 'PATCH', `/offers/${ctx.data.offer1._id}/withdraw`, { token: tara.token });
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'withdrawn');
  ctx.withdrawn = true;
});

test('terminal offers cannot transition again (409)', async () => {
  const r = await api(ctx, 'PATCH', `/offers/${ctx.data.offer1._id}/withdraw`, { token: tara.token });
  assert.equal(r.status, 409);
  assert.ok(r.body.error.message.includes('withdrawn'));
});

test('accepting an offer locks the listing and auto-declines rivals', async () => {
  const r = await api(ctx, 'PATCH', `/offers/${ctx.data.offer2._id}/accept`, { token: kabir.token });
  assert.equal(r.status, 200);
  assert.equal(r.body.listing.status, 'pending');
  assert.equal(r.body.listing.soldPrice, 20500);

  const offers = await api(ctx, 'GET', `/listings/${ctx.data.phone._id}/offers`, { token: kabir.token });
  const others = offers.body.filter((o) => String(o._id) !== String(ctx.data.offer2._id) && o.status !== 'withdrawn');
  assert.ok(others.every((o) => o.status === 'declined'), 'rival offers auto-declined');

  // further offers on a pending listing are rejected
  const late = await api(ctx, 'POST', `/listings/${ctx.data.phone._id}/offers`, { token: newcomer.token, body: { amount: 25000 } });
  assert.equal(late.status, 409);
});

test('marking sold requires a pending deal (409 otherwise)', async () => {
  const listings = await api(ctx, 'GET', '/listings/mine', { token: tara.token });
  const bike = listings.body.selling.find((l) => l.title.includes('bicycle'));
  const r = await api(ctx, 'PATCH', `/listings/${bike._id}/sold`, { token: tara.token });
  assert.equal(r.status, 409);
  const pending = listings.body.selling.find((l) => l.status === 'pending' && l.seller !== undefined && l.title.includes('lamp'));
  // lamp belongs to kabir
  const lampMine = await api(ctx, 'GET', '/listings/mine', { token: kabir.token });
  const lamp = lampMine.body.selling.find((l) => l.title.includes('lamp'));
  const ok = await api(ctx, 'PATCH', `/listings/${lamp._id}/sold`, { token: kabir.token });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.status, 'sold');
  ctx.soldLamp = ok.body;
});

test('buyer rates after sold; double rating and strangers rejected', async () => {
  const ok = await api(ctx, 'POST', `/listings/${ctx.soldLamp._id}/rating`, { token: imranQ(), body: { stars: 4, comment: 'Lamp works great' } });
  assert.equal(ok.status, 201);
  const again = await api(ctx, 'POST', `/listings/${ctx.soldLamp._id}/rating`, { token: imranQ(), body: { stars: 5 } });
  assert.equal(again.status, 409);
  const stranger = await api(ctx, 'POST', `/listings/${ctx.soldLamp._id}/rating`, { token: newcomer.token, body: { stars: 1 } });
  assert.equal(stranger.status, 403);
  function imranQ() { return ctx.tokens.imran; }
});

test('seller rating cache updates after the sale', async () => {
  const me = await api(ctx, 'GET', '/auth/me', { token: kabir.token });
  assert.equal(me.body.ratingCount, 2); // seed 1 + lamp sale
  assert.equal(me.body.rating, 4.5);    // (5 + 4) / 2
});

test('editing a pending listing is blocked (409)', async () => {
  const r = await api(ctx, 'PATCH', `/listings/${ctx.data.phone._id}`, { token: kabir.token, body: { price: 1 } });
  assert.equal(r.status, 409);
});

test('my ring returns selling + buying dashboards', async () => {
  const r = await api(ctx, 'GET', '/listings/mine', { token: tara.token });
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.selling));
  assert.ok(Array.isArray(r.body.offers));
  assert.ok(r.body.offers.some((o) => o.status === 'declined' || o.status === 'withdrawn' || o.status === 'accepted'));
});

test('unknown listing returns structured 404', async () => {
  const r = await api(ctx, 'GET', `/listings/${'0'.repeat(24)}`, { token: tara.token });
  assert.equal(r.status, 404);
});
