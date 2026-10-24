const { z } = require('zod');
const Listing = require('../models/Listing.model');
const Offer = require('../models/Offer.model');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const listingSchema = z.object({
  title: z.string().trim().min(3, 'Give the listing a title').max(120),
  category: z.enum(['books', 'electronics', 'furniture', 'bikes', 'other']),
  price: z.coerce.number().min(1, 'Price must be at least ₹1'),
  condition: z.enum(['new', 'like-new', 'good', 'fair']),
  campus: z.string().trim().max(80).optional(),
  meetSpot: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).optional(),
});

async function requireListing(id, userId) {
  const listing = await Listing.findById(id);
  if (!listing) throw new AppError(404, 'Listing not found');
  if (String(listing.seller) !== String(userId)) throw new AppError(403, 'Not your listing');
  return listing;
}

exports.create = asyncHandler(async (req, res) => {
  const parsed = listingSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const listing = await Listing.create({ ...parsed.data, seller: req.user.id });
  res.status(201).json(listing);
});

exports.list = asyncHandler(async (req, res) => {
  const { category, maxPrice, q, campus, condition } = req.query;
  const filter = { status: { $ne: 'sold' } };
  if (category) filter.category = category;
  if (condition) filter.condition = condition;
  if (maxPrice) filter.price = { $lte: Number(maxPrice) };
  if (campus) filter.campus = new RegExp(campus.trim(), 'i');
  if (q) filter.title = new RegExp(q.trim().split(/\s+/).join('|'), 'i');
  const listings = await Listing.find(filter).populate('seller', 'name rating ratingCount salesCount').sort('-createdAt').limit(60);
  res.json(listings);
});

exports.getOne = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('seller', 'name rating ratingCount salesCount campus');
  if (!listing) throw new AppError(404, 'Listing not found');
  // price history: last 10 sold listings in the same category
  const history = await Listing.find({ category: listing.category, status: 'sold', soldPrice: { $ne: null } })
    .select('title soldPrice soldAt')
    .sort('-soldAt')
    .limit(10);
  res.json({ ...listing.toObject(), categoryPriceHistory: history });
});

exports.update = asyncHandler(async (req, res) => {
  const parsed = listingSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const listing = await requireListing(req.params.id, req.user.id);
  if (listing.status !== 'active') throw new AppError(409, 'Only active listings can be edited');
  Object.assign(listing, parsed.data);
  await listing.save();
  res.json(listing);
});

exports.remove = asyncHandler(async (req, res) => {
  const listing = await requireListing(req.params.id, req.user.id);
  if (listing.status === 'pending') throw new AppError(409, 'Accept an offer or let the buyer withdraw before deleting');
  await Offer.deleteMany({ listing: listing._id, status: { $in: ['open', 'countered'] } });
  await listing.deleteOne();
  res.json({ deleted: true });
});

exports.markSold = asyncHandler(async (req, res) => {
  const listing = await requireListing(req.params.id, req.user.id);
  if (listing.status !== 'pending') throw new AppError(409, 'Accept an offer first — sold requires a pending deal');
  listing.status = 'sold';
  listing.soldAt = new Date();
  listing.soldPrice = listing.soldPrice ?? listing.price;
  await listing.save();
  await User.findByIdAndUpdate(listing.seller, { $inc: { salesCount: 1 } });
  res.json(listing);
});

// My ring: seller dashboard + buyer dashboard
exports.mine = asyncHandler(async (req, res) => {
  const selling = await Listing.find({ seller: req.user.id }).sort('-createdAt');
  const sellingWithOffers = await Promise.all(
    selling.map(async (l) => ({
      ...l.toObject(),
      openOffers: await Offer.countDocuments({ listing: l._id, status: { $in: ['open', 'countered'] } }),
    }))
  );
  const offers = await Offer.find({ buyer: req.user.id }).populate({ path: 'listing', select: 'title price status meetSpot campus' }).sort('-createdAt');
  res.json({ selling: sellingWithOffers, offers });
});
