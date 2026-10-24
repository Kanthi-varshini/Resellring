import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, ErrorState } from '../components/states.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const CHAIN_LABEL = { offered: 'Offer', countered: 'Counter', accepted: 'ACCEPTED', declined: 'Declined', withdrawn: 'Withdrawn', 'auto-declined': 'Auto-declined' };

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [listing, setListing] = useState(null);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState('');
  const [offerForm, setOfferForm] = useState({ amount: '', message: '' });
  const [busy, setBusy] = useState(false);

  async function load() {
    setError('');
    try {
      const l = await client.get(`/listings/${id}`);
      setListing(l.data);
      if (user && String(l.data.seller?._id) === String(user.id)) {
        setOffers((await client.get(`/listings/${id}/offers`)).data);
      }
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => { load(); }, [id, user]);

  async function act(fn, msg) {
    setBusy(true);
    try { await fn(); toast(msg); load(); } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  }

  if (error) return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} onRetry={load} /></main></div>;
  if (!listing) return <div className="min-h-screen"><Navbar /><Loading label="Loading the listing…" /></div>;

  const isSeller = user && String(listing.seller?._id) === String(user.id);
  const liveOfferAmount = offers.find((o) => ['open', 'countered'].includes(o.status))?.amount;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Link to="/market" className="text-sm text-zinc-500 hover:text-acid">← Market</Link>
        <div className="mt-3 rounded-xl border border-edge bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <p className="mt-1 text-sm text-zinc-500">
                {listing.category} · {listing.condition} · {listing.campus} · meetup: {listing.meetSpot || 'decide in chat'}
              </p>
              <p className="mt-3 text-zinc-400">{listing.description}</p>
              <p className="mt-3 text-sm text-zinc-500">
                Seller <strong className="text-zinc-300">{listing.seller?.name}</strong>
                {listing.seller?.ratingCount > 0 && <span className="text-acid"> ★ {listing.seller.rating} ({listing.seller.ratingCount})</span>}
                {' · '}{listing.seller?.salesCount} sales
              </p>
            </div>
            <div className="text-right">
              <span className="price-tag display inline-block px-4 py-2 text-2xl font-bold">₹{listing.price.toLocaleString('en-IN')}</span>
              <p className={`mt-3 text-xs font-bold uppercase ${listing.status === 'active' ? 'text-green-400' : listing.status === 'pending' ? 'text-amber-400' : 'text-zinc-500'}`}>
                {listing.status}
              </p>
            </div>
          </div>
        </div>

        {/* Buyer actions */}
        {user && !isSeller && listing.status === 'active' && (
          <div className="mt-4 rounded-xl border border-edge bg-card p-5">
            <h2 className="font-bold">Make an offer</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <input type="number" min="1" value={offerForm.amount} onChange={(e) => setOfferForm({ ...offerForm, amount: e.target.value })} placeholder="₹ amount"
                className="w-32 rounded-lg border border-edge bg-void px-3 py-2 text-sm outline-none focus:border-acid" />
              <input value={offerForm.message} onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })} placeholder="message (optional)"
                className="flex-1 rounded-lg border border-edge bg-void px-3 py-2 text-sm outline-none focus:border-acid" />
              <button disabled={busy}
                onClick={() => act(() => client.post(`/listings/${id}/offers`, { amount: Number(offerForm.amount), message: offerForm.message }), 'Offer placed!')}
                className="rounded-lg bg-acid px-6 py-2 text-sm font-bold text-void">Offer</button>
            </div>
          </div>
        )}
        {!user && <p className="mt-4 text-sm text-zinc-400"><Link to="/login" className="font-bold text-acid">Log in</Link> to make an offer.</p>}

        {/* Offer chain (seller view) */}
        {isSeller && offers.length > 0 && (
          <section className="mt-6 rounded-xl border border-edge bg-card p-5">
            <h2 className="font-bold">Offers ({offers.length})</h2>
            <div className="mt-3 space-y-4">
              {offers.map((o) => (
                <div key={o._id} className="rounded-lg border border-edge p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold">{o.buyer?.name}</span>
                    <span className="price-tag display px-2 py-0.5 text-sm font-bold">₹{o.amount.toLocaleString('en-IN')}</span>
                  </div>
                  {o.message && <p className="mt-1 text-sm italic text-zinc-400">"{o.message}"</p>}
                  {/* visible chain */}
                  <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px]">
                    {o.history.map((h, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className={`rounded px-2 py-0.5 font-bold uppercase ${h.action === 'accepted' ? 'bg-acid text-void' : ['declined', 'auto-declined', 'withdrawn'].includes(h.action) ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-700 text-zinc-200'}`}>
                          {CHAIN_LABEL[h.action]}{h.amount ? ` ₹${h.amount}` : ''}
                        </span>
                        {i < o.history.length - 1 && <span className="text-zinc-600">→</span>}
                      </span>
                    ))}
                  </div>
                  {['open', 'countered'].includes(o.status) && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                      <button disabled={busy} onClick={() => act(() => client.patch(`/offers/${o._id}/accept`), 'Accepted — listing locked, rivals declined')}
                        className="rounded bg-acid px-4 py-2 text-void">Accept</button>
                      <button disabled={busy} onClick={() => {
                        const amount = window.prompt(`Counter-offer amount (current ₹${o.amount}):`);
                        if (amount) act(() => client.patch(`/offers/${o._id}/counter`, { amount: Number(amount) }), 'Counter sent');
                      }} className="rounded border border-edge px-4 py-2 text-zinc-200">Counter</button>
                      <button disabled={busy} onClick={() => act(() => client.patch(`/offers/${o._id}/decline`), 'Declined')}
                        className="rounded border border-edge px-4 py-2 text-zinc-400">Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seller: mark sold */}
        {isSeller && listing.status === 'pending' && (
          <div className="mt-4 rounded-xl border border-acid/40 bg-acid/5 p-5">
            <h2 className="font-bold text-acid">Deal pending with {listing.soldTo?.name || 'buyer'}</h2>
            <p className="mt-1 text-sm text-zinc-400">Agreed at ₹{listing.soldPrice?.toLocaleString('en-IN')} · meetup {listing.meetSpot}</p>
            <button disabled={busy} onClick={() => act(() => client.patch(`/listings/${id}/sold`), 'Marked sold — buyer can now rate you')}
              className="mt-3 rounded bg-acid px-6 py-2 text-sm font-bold text-void">Mark sold (handover done)</button>
          </div>
        )}

        {/* Price history */}
        <section className="mt-6 rounded-xl border border-edge bg-card p-5">
          <h2 className="font-bold">Recently sold {listing.category}</h2>
          <ul className="mt-2 divide-y divide-edge text-sm">
            {listing.categoryPriceHistory?.map((h) => (
              <li key={h._id} className="flex justify-between py-2 text-zinc-400">
                <span className="truncate pr-4">{h.title}</span>
                <span className="font-bold text-acid">₹{h.soldPrice?.toLocaleString('en-IN')}</span>
              </li>
            ))}
            {(listing.categoryPriceHistory || []).length === 0 && <li className="py-2 text-zinc-600">No sales in this category yet.</li>}
          </ul>
        </section>
      </main>
    </div>
  );
}
