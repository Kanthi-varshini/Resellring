const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Listing = require('../models/Listing.model');
const Offer = require('../models/Offer.model');
const Rating = require('../models/Rating.model');

const DEMO_PASSWORD = 'Demo@1234';

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [kabir, tara, zoya, imran] = await User.create(
    { name: 'Kabir Shah', email: 'kabir@demo.com', passwordHash: hash, campus: 'VIT Pune', phone: '9845011111' },
    { name: 'Tara Iyer', email: 'tara@demo.com', passwordHash: hash, campus: 'VIT Pune' },
    { name: 'Zoya Ahmed', email: 'zoya@demo.com', passwordHash: hash, campus: 'COEP' },
    { name: 'Imran Qureshi', email: 'imran@demo.com', passwordHash: hash, campus: 'VIT Pune' }
  );

  const daysAgo = (d) => new Date(Date.now() - d * 86400000);

  // Active listing with 2 live offers (one countered)
  const phone = await Listing.create({
    seller: kabir._id, title: 'SL3 phone 128GB — flawless', category: 'electronics', price: 22000,
    condition: 'like-new', campus: 'VIT Pune', meetSpot: 'Main gate food court',
    description: 'Bought 8 months ago, screen guard from day one, box + charger included.',
  });
  const offer1 = await Offer.create({ listing: phone._id, buyer: tara._id, amount: 19000, message: 'Can pick up today!', history: [{ action: 'offered', amount: 19000 }] });
  const offer2 = await Offer.create({ listing: phone._id, buyer: zoya._id, amount: 20000, history: [{ action: 'offered', amount: 20000 }] });
  offer2.status = 'countered';
  offer2.amount = 20500;
  offer2.history.push({ action: 'countered', amount: 20500 });
  await offer2.save();

  // Accepted → pending pickup
  const lamp = await Listing.create({
    seller: kabir._id, title: 'Study lamp with clamp', category: 'furniture', price: 700,
    condition: 'good', campus: 'VIT Pune', meetSpot: 'Library steps',
  });
  const lampOffer = await Offer.create({ listing: lamp._id, buyer: imran._id, amount: 600, history: [{ action: 'offered', amount: 600 }] });
  lampOffer.status = 'accepted';
  lampOffer.history.push({ action: 'accepted', amount: 600 });
  await lampOffer.save();
  lamp.status = 'pending';
  lamp.soldTo = imran._id;
  lamp.soldPrice = 600;
  await lamp.save();
  // one auto-declined rival offer
  await Offer.create({ listing: lamp._id, buyer: tara._id, amount: 650, status: 'declined', history: [{ action: 'offered', amount: 650 }, { action: 'auto-declined' }] });

  // Sold with rating + price history anchors
  const book1 = await Listing.create({
    seller: kabir._id, title: 'CLRS Introduction to Algorithms (3e)', category: 'books', price: 900,
    condition: 'good', campus: 'VIT Pune', status: 'sold', soldTo: tara._id, soldPrice: 800, soldAt: daysAgo(6),
  });
  await Rating.create({ listing: book1._id, by: tara._id, to: kabir._id, stars: 5, comment: 'Book exactly as described, quick meetup.' });
  await User.findByIdAndUpdate(kabir._id, { rating: 5, ratingCount: 1, salesCount: 1 });
  await Listing.create({ seller: imran._id, title: 'HC Verma Concepts of Physics Vol 1', category: 'books', price: 500, condition: 'fair', campus: 'VIT Pune', status: 'sold', soldTo: tara._id, soldPrice: 420, soldAt: daysAgo(12) });
  await Listing.create({ seller: zoya._id, title: 'NCERT Chemistry Class 12 set', category: 'books', price: 350, condition: 'good', campus: 'COEP', status: 'sold', soldTo: imran._id, soldPrice: 300, soldAt: daysAgo(20) });

  // Other active listings
  await Listing.create({ seller: tara._id, title: 'Hero Sprint bicycle', category: 'bikes', price: 4500, condition: 'good', campus: 'VIT Pune', meetSpot: 'Cycle stand' });
  await Listing.create({ seller: zoya._id, title: 'Bluetooth speaker, loud!', category: 'electronics', price: 1200, condition: 'like-new', campus: 'COEP' });

  return { kabir, tara, zoya, imran, phone, offer1, offer2, lamp, lampOffer };
}

module.exports = seed;
module.exports.DEMO_PASSWORD = DEMO_PASSWORD;
