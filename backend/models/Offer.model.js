const mongoose = require('mongoose');

// Offer state machine:
//   open      → accepted | declined | countered | withdrawn (by buyer)
//   countered → accepted | declined | withdrawn (by buyer)
//   terminal: accepted | declined | withdrawn
const offerSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    message: { type: String, trim: true, maxlength: 300 },
    status: { type: String, enum: ['open', 'countered', 'accepted', 'declined', 'withdrawn'], default: 'open' },
    history: [
      {
        action: { type: String, required: true }, // offered | countered | accepted | declined | withdrawn | auto-declined
        amount: { type: Number },
        at: { type: Date, default: Date.now },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
