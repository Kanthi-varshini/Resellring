const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { startTest, stopTest, api, login } = require('./helpers');

let ctx, tara, kabir;

before(async () => {
  ctx = await startTest();
  tara = await login(ctx, 'tara@demo.com');
  kabir = await login(ctx, 'kabir@demo.com');
});

after(async () => stopTest(ctx));

test('watchlist add/remove/dedupe works', async () => {
  const r1 = await api(ctx, 'POST', `/listings/${ctx.data.phone._id}/watch`, { token: tara.token });
  assert.equal(r1.status, 201);
  const dupe = await api(ctx, 'POST', `/listings/${ctx.data.phone._id}/watch`, { token: tara.token });
  assert.equal(dupe.status, 201); // idempotent upsert
  const list = await api(ctx, 'GET', '/watchlist', { token: tara.token });
  assert.equal(list.body.filter((l) => l._id === String(ctx.data.phone._id)).length, 1);
  const self = await api(ctx, 'POST', `/listings/${ctx.data.phone._id}/watch`, { token: kabir.token });
  assert.equal(self.status, 400, 'cannot watch own listing');
  const un = await api(ctx, 'DELETE', `/listings/${ctx.data.phone._id}/watch`, { token: tara.token });
  assert.equal(un.status, 200);
});

test('public seller profile shows ratings, sales and active listings', async () => {
  const sellerId = (await api(ctx, "GET", "/auth/me", { token: kabir.token })).body._id;
  const r = await api(ctx, 'GET', `/sellers/${sellerId}`, { token: tara.token });
  assert.equal(r.status, 200);
  assert.equal(r.body.seller.name, 'Kabir Shah');
  assert.ok(r.body.seller.ratingCount >= 1);
  assert.ok(r.body.activeListings.length >= 2);
  assert.ok(r.body.recentSales.length >= 1);
  assert.ok(r.body.reviews.some((rev) => rev.by?.name === 'Tara Iyer'));
});
