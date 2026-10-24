const { z } = require('zod');
const Listing = require('../models/Listing.model');
const Offer = require('../models/Offer.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const offerSchema = z.object({
  amount: z.coerce.number().min(1, 'Offer must be at least ₹1'),
  message: z.string().trim().max(300).optional(),
});

async function requireOffer(id, userId, role) {
  const offer = await Offer.findById(id);
  if (!offer) throw new AppError(404, 'Offer not found');
  if (role === 'buyer') {
    if (String(offer.buyer) !== String(userId)) throw new AppError(403, 'Not your offer');
  } else {
    // seller actions are authorized via the listing's seller
    const listing = await Listing.findById(offer.listing).select('seller');
    if (!listing) throw new AppError(404, 'Listing not found');
    if (String(listing.seller) !== String(userId)) throw new AppError(403, 'Not your listing');
  }
  return offer;
}

exports.make = asyncHandler(async (req, res) => {
  const parsed = offerSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.status !== 'active') throw new AppError(409, 'Only active listings take offers');
  if (String(listing.seller) === String(req.user.id)) throw new AppError(400, 'You cannot offer on your own listing');

  const existing = await Offer.findOne({ listing: listing._id, buyer: req.user.id, status: { $in: ['open', 'countered'] } });
  if (existing) throw new AppError(409, 'You already have a live offer — withdraw it first');

  const offer = await Offer.create({
    listing: listing._id,
    buyer: req.user.id,
    amount: parsed.data.amount,
    message: parsed.data.message,
    history: [{ action: 'offered', amount: parsed.data.amount }],
  });
  res.status(201).json(offer);
});

// Seller accepts → listing locked (pending), all other live offers auto-decline.
exports.accept = asyncHandler(async (req, res) => {
  const offer = await requireOffer(req.params.id, req.user.id, 'seller');
  if (!['open', 'countered'].includes(offer.status)) {
    throw new AppError(409, `Cannot accept an offer that is ${offer.status}`);
  }
  const listing = await Listing.findById(offer.listing);
  if (listing.status !== 'active') throw new AppError(409, `Listing is ${listing.status} — deals are exclusive`);

  offer.status = 'accepted';
  offer.history.push({ action: 'accepted', amount: offer.amount });
  await offer.save();

  listing.status = 'pending';
  listing.soldTo = offer.buyer;
  listing.soldPrice = offer.amount;
  await listing.save();

  // deals are exclusive — every other live offer dies automatically
  await Offer.updateMany(
    { listing: listing._id, _id: { $ne: offer._id }, status: { $in: ['open', 'countered'] } },
    { $set: { status: 'declined' }, $push: { history: { action: 'auto-declined', at: new Date() } } }
  );
  res.json({ offer, listing });
});

exports.counter = asyncHandler(async (req, res) => {
  const parsed = offerSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const offer = await requireOffer(req.params.id, req.user.id, 'seller');
  if (offer.status !== 'open') throw new AppError(409, `Cannot counter an offer that is ${offer.status}`);
  const amount = parsed.data.amount ?? offer.amount;
  offer.status = 'countered';
  offer.amount = amount;
  if (parsed.data.message) offer.message = parsed.data.message;
  offer.history.push({ action: 'countered', amount });
  await offer.save();
  res.json(offer);
});

exports.decline = asyncHandler(async (req, res) => {
  const offer = await requireOffer(req.params.id, req.user.id, 'seller');
  if (!['open', 'countered'].includes(offer.status)) {
    throw new AppError(409, `Cannot decline an offer that is ${offer.status}`);
  }
  offer.status = 'declined';
  offer.history.push({ action: 'declined', amount: offer.amount });
  await offer.save();
  res.json(offer);
});

exports.withdraw = asyncHandler(async (req, res) => {
  const offer = await requireOffer(req.params.id, req.user.id, 'buyer');
  if (!['open', 'countered'].includes(offer.status)) {
    throw new AppError(409, `Cannot withdraw an offer that is ${offer.status}`);
  }
  offer.status = 'withdrawn';
  offer.history.push({ action: 'withdrawn', amount: offer.amount });
  await offer.save();
  res.json(offer);
});

exports.forListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new AppError(404, 'Listing not found');
  if (String(listing.seller) !== String(req.user.id)) throw new AppError(403, 'Only the seller sees incoming offers');
  const offers = await Offer.find({ listing: listing._id }).populate('buyer', 'name rating ratingCount').sort('-createdAt');
  res.json(offers);
});

exports.rate = asyncHandler(async (req, res) => {
  const { z } = require('zod');
  const parsed = z.object({
    stars: z.coerce.number().int().min(1, 'Rating is 1-5 stars').max(5, 'Rating is 1-5 stars'),
    comment: z.string().trim().max(300).optional(),
  }).safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);

  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.status !== 'sold') throw new AppError(409, 'Rate the seller after the sale is marked sold');
  if (String(listing.soldTo) !== String(req.user.id)) throw new AppError(403, 'Only the buyer rates this sale');

  const existing = await require('../models/Rating.model').findOne({ listing: listing._id });
  if (existing) throw new AppError(409, 'You already rated this sale');

  const Rating = require('../models/Rating.model');
  const rating = await Rating.create({ listing: listing._id, by: req.user.id, to: listing.seller, stars: parsed.data.stars, comment: parsed.data.comment });
  const agg = await Rating.aggregate([
    { $match: { to: listing.seller } },
    { $group: { _id: '$to', avg: { $avg: '$stars' }, count: { $sum: 1 } } },
  ]);
  if (agg[0]) {
    await require('../models/User.model').findByIdAndUpdate(listing.seller, {
      rating: Math.round(agg[0].avg * 10) / 10,
      ratingCount: agg[0].count,
    });
  }
  res.status(201).json(rating);
});
