import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, Empty, ErrorState } from '../components/states.jsx';
import { useToast } from '../context/ToastContext.jsx';
import SceneBackground from '../components/SceneBackground.jsx';

export default function MyRing() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'books', price: '', condition: 'good', campus: '', meetSpot: '', description: '' });

  async function load() {
    setError('');
    try { setData((await client.get('/listings/mine')).data); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    try {
      await client.post('/listings', { ...form, price: Number(form.price) });
      toast('Listed on the market!');
      setShowNew(false);
      setForm({ ...form, title: '', price: '', description: '' });
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function act(fn, msg) {
    try { await fn(); toast(msg); load(); } catch (err) { toast(err.message, 'error'); }
  }

  if (error) return <div className="relative min-h-screen"><Navbar />
      <SceneBackground /><main className="relative mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} onRetry={load} /></main></div>;
  if (!data) return <div className="relative min-h-screen"><Navbar /><Loading label="Opening your ring…" /></div>;

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="display text-2xl font-bold">MY RING</h1>
          <button onClick={() => setShowNew(true)} className="rounded bg-acid px-5 py-2.5 text-sm font-bold text-void">+ List something</button>
        </div>

        <section className="mt-6">
          <h2 className="font-bold text-zinc-300">Selling ({data.selling.length})</h2>
          {data.selling.length === 0 && <Empty title="Nothing listed yet" hint={'That drawer full of "someday" items? List them.'} />}
          <div className="mt-3 space-y-2">
            {data.selling.map((l) => (
              <div key={l._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-edge bg-card p-4">
                <div>
                  <Link to={`/listings/${l._id}`} className="font-bold hover:text-acid">{l.title}</Link>
                  <p className="text-xs text-zinc-500">{l.category} · {l.condition} · <span className="uppercase">{l.status}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  {l.openOffers > 0 && <span className="rounded bg-acid/15 px-2 py-1 text-xs font-bold text-acid">{l.openOffers} live offer{l.openOffers > 1 ? 's' : ''}</span>}
                  <span className="display text-sm font-bold text-acid">₹{l.price.toLocaleString('en-IN')}</span>
                  {l.status === 'pending' && (
                    <button onClick={() => act(() => client.patch(`/listings/${l._id}/sold`), 'Marked sold')}
                      className="rounded bg-acid px-3 py-1.5 text-xs font-bold text-void">Mark sold</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-bold text-zinc-300">Your offers ({data.offers.length})</h2>
          <div className="mt-3 space-y-2">
            {data.offers.map((o) => (
              <div key={o._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-edge bg-card p-4">
                <div>
                  <Link to={`/listings/${o.listing?._id}`} className="font-bold hover:text-acid">{o.listing?.title}</Link>
                  <p className="text-xs text-zinc-500">asking ₹{o.listing?.price?.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="display text-sm font-bold text-acid">₹{o.amount.toLocaleString('en-IN')}</span>
                  <span className={`rounded px-2 py-1 text-[11px] font-bold uppercase ${o.status === 'accepted' ? 'bg-green-500/15 text-green-400' : o.status === 'declined' ? 'bg-red-500/10 text-red-400' : o.status === 'countered' ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {o.status}
                  </span>
                  {['open', 'countered'].includes(o.status) && (
                    <button onClick={() => act(() => client.patch(`/offers/${o._id}/withdraw`), 'Offer withdrawn')}
                      className="rounded border border-edge px-3 py-1.5 text-xs font-semibold text-zinc-400">Withdraw</button>
                  )}
                </div>
              </div>
            ))}
            {data.offers.length === 0 && <p className="text-sm text-zinc-500">No offers yet — <Link to="/market" className="text-acid hover:underline">go make one</Link>.</p>}
          </div>
        </section>
      </main>

      {showNew && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setShowNew(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={create} className="w-full max-w-md rounded-xl border border-edge bg-card p-6">
            <h2 className="display font-bold text-acid">NEW LISTING</h2>
            <label className="mt-4 block"><span className="text-sm text-zinc-300">Title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border border-edge bg-void px-3 py-2 outline-none focus:border-acid" /></label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <label className="block"><span className="text-sm text-zinc-300">Price ₹</span>
                <input type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 w-full rounded-lg border border-edge bg-void px-3 py-2 outline-none focus:border-acid" /></label>
              <label className="block"><span className="text-sm text-zinc-300">Category</span>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-lg border border-edge bg-void px-2 py-2 outline-none focus:border-acid">
                  {['books', 'electronics', 'furniture', 'bikes', 'other'].map((c) => <option key={c}>{c}</option>)}
                </select></label>
              <label className="block"><span className="text-sm text-zinc-300">Condition</span>
                <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="mt-1 w-full rounded-lg border border-edge bg-void px-2 py-2 outline-none focus:border-acid">
                  {['new', 'like-new', 'good', 'fair'].map((c) => <option key={c}>{c}</option>)}
                </select></label>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="block"><span className="text-sm text-zinc-300">Campus</span>
                <input value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })} className="mt-1 w-full rounded-lg border border-edge bg-void px-3 py-2 outline-none focus:border-acid" /></label>
              <label className="block"><span className="text-sm text-zinc-300">Meetup spot</span>
                <input value={form.meetSpot} onChange={(e) => setForm({ ...form, meetSpot: e.target.value })} className="mt-1 w-full rounded-lg border border-edge bg-void px-3 py-2 outline-none focus:border-acid" /></label>
            </div>
            <label className="mt-3 block"><span className="text-sm text-zinc-300">Description</span>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="2" className="mt-1 w-full rounded-lg border border-edge bg-void px-3 py-2 outline-none focus:border-acid" /></label>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setShowNew(false)} className="flex-1 rounded-lg border border-edge py-2.5 font-semibold text-zinc-300">Cancel</button>
              <button className="flex-1 rounded-lg bg-acid py-2.5 font-bold text-void">List it</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
