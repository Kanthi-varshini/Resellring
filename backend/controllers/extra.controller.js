const { z } = require('zod');
const Listing = require('../models/Listing.model');
const Rating = require('../models/Rating.model');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ── Watchlist: save listings, get notified when they're marked sold/pending.
async function watchModel() {
  const mongoose = require('mongoose');
  if (mongoose.models.WatchItem) return mongoose.models.WatchItem;
  const schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  }, { timestamps: true });
  schema.index({ user: 1, listing: 1 }, { unique: true });
  return mongoose.model('WatchItem', schema);
}

exports.watch = asyncHandler(async (req, res) => {
  const WatchItem = await watchModel();
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new AppError(404, 'Listing not found');
  if (String(listing.seller) === String(req.user.id)) throw new AppError(400, 'You cannot watch your own listing');
  await WatchItem.updateOne({ user: req.user.id, listing: listing._id }, { $setOnInsert: { user: req.user.id, listing: listing._id } }, { upsert: true });
  res.status(201).json({ watching: true });
});

exports.unwatch = asyncHandler(async (req, res) => {
  const WatchItem = await watchModel();
  await WatchItem.deleteOne({ user: req.user.id, listing: req.params.id });
  res.json({ watching: false });
});

exports.watchlist = asyncHandler(async (req, res) => {
  const WatchItem = await watchModel();
  const items = await WatchItem.find({ user: req.user.id }).populate({
    path: 'listing', populate: { path: 'seller', select: 'name rating' },
  });
  res.json(items.filter((w) => w.listing).map((w) => w.listing));
});

// ── Public seller profile: ratings, sales, active listings.
exports.sellerProfile = asyncHandler(async (req, res) => {
  const seller = await User.findById(req.params.id).select('name campus rating ratingCount salesCount createdAt');
  if (!seller) throw new AppError(404, 'Seller not found');
  const [active, sold, reviews] = await Promise.all([
    Listing.find({ seller: seller._id, status: { $ne: 'sold' } }).sort('-createdAt').limit(20),
    Listing.find({ seller: seller._id, status: 'sold' }).sort('-soldAt').limit(10).select('title soldPrice soldAt category'),
    Rating.find({ to: seller._id }).populate('by', 'name').sort('-createdAt').limit(10),
  ]);
  res.json({ seller, activeListings: active, recentSales: sold, reviews });
});
