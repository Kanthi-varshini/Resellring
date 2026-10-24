const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, unique: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stars: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rating', ratingSchema);
