import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen overflow-hidden">
      <span className="swing absolute right-[6%] top-28 hidden price-tag px-4 py-2 text-sm font-bold lg:block">₹ BEST DEALS</span>
      <span className="swing absolute left-[5%] bottom-48 hidden price-tag px-4 py-2 text-sm font-bold lg:block" style={{ animationDelay: '-1.5s' }}>NO GHOSTING</span>

      <header className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4">
        <Link to="/market" className="display text-xl font-bold tracking-tight text-acid">RESELLRING</Link>
        <Link to={user ? '/market' : '/register'} className="rounded bg-acid px-6 py-2.5 text-sm font-bold text-void transition hover:-translate-y-0.5">
          {user ? 'Enter the market' : 'Join the ring'}
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <section className="reveal py-16 text-center sm:py-24">
          <h1 className="display mx-auto max-w-4xl text-6xl font-bold leading-[1.02] sm:text-8xl">
            <span className="shine-text">SELL FAST</span><br />ON CAMPUS.
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg text-zinc-400">
            Marketplace groups are comment chaos: "available?", haggling in DMs,
            meetups that never happen. ResellRing structures the sale —
            listing → offers → acceptance → pickup → rating.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/market" className="rounded bg-acid px-10 py-4 font-bold text-void shadow-lg shadow-lime-500/20 transition hover:-translate-y-0.5">Browse the market →</Link>
            <Link to="/register" className="rounded border border-edge px-10 py-4 font-bold text-zinc-200 hover:border-acid">Start selling</Link>
          </div>
        </section>

        {/* offer chain demo */}
        <section className="reveal mx-auto mb-10 max-w-2xl">
          <div className="rounded-2xl border border-edge bg-card p-7">
            <p className="display text-xs uppercase tracking-widest text-zinc-500">offer chain · SL3 phone</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-bold">
              {[['Offer ₹19,000', 'bg-zinc-700 text-zinc-200'], ['→', 'text-zinc-600'], ['Counter ₹20,500', 'bg-amber-500/20 text-amber-300'], ['→', 'text-zinc-600'], ['ACCEPTED', 'bg-acid text-void']].map(([t, c], i) => (
                <span key={i} className={`rounded px-3 py-1.5 ${c}`}>{t}</span>
              ))}
            </div>
            <p className="mt-4 text-sm text-zinc-500">Accepting one offer <strong className="text-acid">locks the listing</strong> — rivals auto-decline. Nobody gets ghosted.</p>
            <div className="mt-5 flex gap-3 text-xs">
              {[['₹20,500', 'sold price'], ['★ 4.5', 'seller rating'], ['7 days', 'avg sale']].map(([v, l]) => (
                <div key={l} className="flex-1 rounded-xl border border-edge bg-void p-3 text-center">
                  <p className="display text-lg text-acid">{v}</p><p className="text-[10px] uppercase text-zinc-500">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="reveal grid gap-6 pb-16 sm:grid-cols-3">
          {[
            ['💬', 'Offers, not comments', 'Real amounts with a visible chain. No "dm price", ever.'],
            ['🔒', 'Exclusive deals', 'One winner. Auto-declined rivals with a full audit history.'],
            ['📉', 'Honest prices', 'Every listing shows the last sold prices in its category before you bid.'],
          ].map(([icon, t, b]) => (
            <div key={t} className="hover-lift rounded-2xl border border-edge bg-card p-7">
              <span className="text-3xl">{icon}</span>
              <h3 className="display mt-3 text-sm uppercase text-acid">{t}</h3>
              <p className="mt-2 text-sm text-zinc-400">{b}</p>
            </div>
          ))}
        </section>
      </main>

      <div className="border-y border-edge bg-acid py-2.5">
        <div className="marquee gap-8 text-sm font-bold text-void">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex gap-8 pr-8">
              {['BOOKS', 'ELECTRONICS', 'FURNITURE', 'BIKES', 'CYCLES SOLD DAILY', 'ZERO GHOSTING'].map((t) => (
                <span key={t} className="flex items-center gap-8">{t} <span>★</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer className="py-10 text-center text-sm text-zinc-500">RESELLRING — the campus resale ring.</footer>
    </div>
  );
}
