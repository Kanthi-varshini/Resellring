import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, ErrorState } from '../components/states.jsx';

export default function SellerProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get(`/sellers/${id}`).then((r) => setData(r.data)).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} /></main></div>;
  if (!data) return <div className="min-h-screen"><Navbar /><Loading label="Loading the seller…" /></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Link to="/market" className="text-sm text-zinc-500 hover:text-acid">← Market</Link>
        <div className="mt-3 rounded-xl border border-edge bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="display text-2xl font-bold text-acid">{data.seller.name}</h1>
              <p className="text-sm text-zinc-500">{data.seller.campus} · member since {new Date(data.seller.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex gap-4 text-center">
              <div><p className="display text-xl text-acid">★ {data.seller.rating || '—'}</p><p className="text-[10px] uppercase text-zinc-500">{data.seller.ratingCount} ratings</p></div>
              <div><p className="display text-xl text-acid">{data.seller.salesCount}</p><p className="text-[10px] uppercase text-zinc-500">sales</p></div>
            </div>
          </div>
        </div>

        <h2 className="mt-6 font-bold">Active listings ({data.activeListings.length})</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {data.activeListings.map((l) => (
            <Link key={l._id} to={`/listings/${l._id}`} className="rounded-xl border border-edge bg-card p-4 hover:border-acid">
              <div className="flex justify-between gap-2"><span className="font-bold">{l.title}</span><span className="display text-acid">₹{l.price.toLocaleString('en-IN')}</span></div>
              <p className="text-xs text-zinc-500">{l.category} · {l.condition} · {l.status}</p>
            </Link>
          ))}
        </div>

        <h2 className="mt-6 font-bold">Recent sales</h2>
        <ul className="mt-2 divide-y divide-edge text-sm text-zinc-400">
          {data.recentSales.map((s) => (
            <li key={s._id} className="flex justify-between py-2"><span>{s.title}</span><span className="font-bold text-acid">₹{s.soldPrice?.toLocaleString('en-IN')}</span></li>
          ))}
        </ul>

        <h2 className="mt-6 font-bold">Reviews ({data.reviews.length})</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {data.reviews.map((r) => (
            <li key={r._id} className="rounded-xl border border-edge bg-card p-4">
              <p className="font-bold text-acid">{'★'.repeat(r.stars)}<span className="text-zinc-600">{'★'.repeat(5 - r.stars)}</span> <span className="ml-2 text-xs text-zinc-500">{r.by?.name}</span></p>
              {r.comment && <p className="mt-1 italic text-zinc-400">"{r.comment}"</p>}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
