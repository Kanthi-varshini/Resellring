const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const a = require('../controllers/auth.controller');
const l = require('../controllers/listing.controller');
const o = require('../controllers/offer.controller');
const extra = require('../controllers/extra.controller');
const { requireAuth } = require('../middlewares/auth');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });

router.post('/auth/register', authLimiter, a.register);
router.post('/auth/login', authLimiter, a.login);
router.get('/auth/me', requireAuth, a.me);

router.get('/listings', l.list); // public marketplace browse
router.get('/sellers/:id', extra.sellerProfile); // public profile

router.use(requireAuth);
router.post('/listings', l.create);
router.get('/listings/mine', l.mine); // before /:id
router.get('/listings/:id', l.getOne);
router.patch('/listings/:id', l.update);
router.delete('/listings/:id', l.remove);
router.patch('/listings/:id/sold', l.markSold);
router.post('/listings/:id/offers', o.make);
router.get('/listings/:id/offers', o.forListing);
router.post('/listings/:id/rating', o.rate);
router.patch('/offers/:id/accept', o.accept);
router.patch('/offers/:id/counter', o.counter);
router.patch('/offers/:id/decline', o.decline);
router.patch('/offers/:id/withdraw', o.withdraw);
router.post("/listings/:id/watch", extra.watch);
router.delete('/listings/:id/watch', extra.unwatch);
router.get('/watchlist', extra.watchlist);

module.exports = router;
