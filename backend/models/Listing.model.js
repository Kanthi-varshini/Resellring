const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, enum: ['books', 'electronics', 'furniture', 'bikes', 'other'], required: true },
    price: { type: Number, required: true, min: 1 },
    condition: { type: String, enum: ['new', 'like-new', 'good', 'fair'], required: true },
    campus: { type: String, trim: true, maxlength: 80 },
    meetSpot: { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    photos: [{ type: String }],
    status: { type: String, enum: ['active', 'pending', 'sold'], default: 'active', index: true },
    soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    soldPrice: { type: Number },
    soldAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
