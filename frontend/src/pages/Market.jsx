import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, Empty, ErrorState } from '../components/states.jsx';
import SceneBackground from '../components/SceneBackground.jsx';

const CATS = ['', 'books', 'electronics', 'furniture', 'bikes', 'other'];
const CAT_LETTERS = { books: 'B', electronics: 'E', furniture: 'F', bikes: 'K', other: 'O' };

export default function Market() {
  const [listings, setListings] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', category: '', maxPrice: '', campus: '' });

  async function load(f = filters) {
    setError('');
    try {
      const qs = Object.entries(f).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
      setListings((await client.get(`/listings${qs ? `?${qs}` : ''}`)).data);
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <SceneBackground />
      <main className="relative mx-auto max-w-6xl px-4 py-10">
        <h1 className="display text-3xl font-bold">THE MARKET</h1>
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="mt-6 grid gap-2 rounded-xl border border-edge bg-card p-4 sm:grid-cols-5">
          <input value={filters.q} onChange={set('q')} placeholder="what do you need?" className="rounded-lg border border-edge bg-void px-3 py-2 text-sm outline-none focus:border-acid" />
          <select value={filters.category} onChange={set('category')} className="rounded-lg border border-edge bg-void px-3 py-2 text-sm outline-none focus:border-acid">
            {CATS.map((c) => <option key={c} value={c}>{c || 'all categories'}</option>)}
          </select>
          <input value={filters.maxPrice} onChange={set('maxPrice')} type="number" placeholder="max ₹" className="rounded-lg border border-edge bg-void px-3 py-2 text-sm outline-none focus:border-acid" />
          <input value={filters.campus} onChange={set('campus')} placeholder="campus" className="rounded-lg border border-edge bg-void px-3 py-2 text-sm outline-none focus:border-acid" />
          <button className="rounded-lg bg-acid py-2 text-sm font-bold text-void">Search</button>
        </form>

        {error && <div className="mt-6"><ErrorState message={error} onRetry={() => load()} /></div>}
        {!error && listings === null && <Loading label="Scanning the ring…" />}
        {!error && listings !== null && listings.length === 0 && (
          <div className="mt-6"><Empty title="Nothing matches" hint="Widen the filters or be the first to list it." /></div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings?.map((l) => (
            <Link key={l._id} to={`/listings/${l._id}`} className="group rounded-xl border border-edge bg-card p-5 transition hover:-translate-y-1 hover:border-acid">
              <div className="flex h-24 items-center justify-center rounded-lg bg-void">
                <span className="display text-5xl font-bold text-zinc-800 group-hover:text-acid">{CAT_LETTERS[l.category]}</span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <h3 className="font-bold leading-snug">{l.title}</h3>
                <span className="price-tag display shrink-0 px-2 py-1 text-sm font-bold">₹{l.price.toLocaleString('en-IN')}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {l.condition} · {l.campus || 'campus N/A'} · by {l.seller?.name}
                {l.seller?.ratingCount > 0 && <span className="text-acid"> ★{l.seller.rating}</span>}
              </p>
              {l.status === 'pending' && <p className="mt-1 text-xs font-bold text-amber-400">deal pending — offers closed</p>}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
