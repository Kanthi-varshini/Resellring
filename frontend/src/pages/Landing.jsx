import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const OFFER_CHAIN = [
  { label: 'Offer ₹19,000', cls: 'offer-pending' },
  { label: '→', cls: 'text-zinc-600 text-lg font-bold' },
  { label: 'Counter ₹20,500', cls: 'offer-counter' },
  { label: '→', cls: 'text-zinc-600 text-lg font-bold' },
  { label: 'ACCEPTED ✓', cls: 'offer-accepted' },
];

const LISTINGS = [
  { title: 'MacBook Air M1', price: '₹62,000', tag: 'Electronics', badge: 'badge-available', img: '💻' },
  { title: 'Engineering Textbooks', price: '₹1,800', tag: 'Books', badge: 'badge-available', img: '📚' },
  { title: 'Cycle (Hero Sprint)', price: '₹4,500', tag: 'Transport', badge: 'badge-negotiating', img: '🚲' },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Price tag floaters */}
      <div className="swing absolute right-[8%] top-28 hidden lg:block" style={{ animationDelay: '0s' }}>
        <div className="price-tag">₹ BEST DEALS</div>
      </div>
      <div className="swing absolute left-[5%] bottom-56 hidden lg:block" style={{ animationDelay: '-1.8s' }}>
        <div className="price-tag" style={{ transform: 'rotate(2deg)' }}>NO GHOSTING</div>
      </div>

      {/* Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="blob absolute -top-32 left-1/2 h-[30rem] w-[40rem] rounded-full bg-acid/7" style={{ animation: 'orbFloat 18s ease-in-out infinite' }} />
        <div className="blob absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-ember/4" style={{ animation: 'orbFloat 22s ease-in-out 3s infinite' }} />
      </div>

      {/* Header */}
      <header className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link to="/market" className="display text-xl font-black tracking-tight text-acid acid-glow" style={{ textShadow: '0 0 30px rgba(211,242,106,.3)' }}>
          RESELLRING
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/guide" className="nav-link text-sm">📖 Guide</Link>
          <Link
            to={user ? '/market' : '/register'}
            className="btn-3d btn-acid ml-2 rounded-xl px-6 py-2.5 text-sm"
          >
            {user ? 'Enter the Market →' : 'Join the Ring →'}
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="reveal flex flex-col items-center py-20 text-center sm:py-24">
          <h1 className="display mx-auto max-w-5xl text-6xl font-black leading-[1.0] sm:text-8xl lg:text-9xl">
            <span className="shine-text">SELL FAST</span><br />
            ON CAMPUS.
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-zinc-400">
            Marketplace groups are comment chaos: "available?", haggling in DMs,
            meetups that never happen. ResellRing structures the sale —<br />
            <span className="font-semibold text-zinc-300">listing → offers → acceptance → pickup → rating.</span>
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/market" className="btn-3d btn-acid rounded-2xl px-10 py-4 text-base">
              Browse the Market →
            </Link>
            <Link to="/register" className="btn-3d glass rounded-2xl px-10 py-4 text-base font-bold text-zinc-200 hover:border-acid/30">
              Start Selling
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-14 flex flex-wrap justify-center gap-8">
            {[['₹0', 'Platform fee'], ['7 days', 'Avg sale time'], ['★ 4.8', 'Seller rating'], ['0', 'Ghosted buyers']].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="display text-2xl font-black text-acid">{v}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Offer chain demo */}
        <section className="reveal mx-auto mb-12 max-w-2xl perspective">
          <div className="float-3d listing-card rounded-3xl p-8">
            <p className="display text-xs uppercase tracking-[0.3em] text-zinc-500">
              offer chain · OnePlus 12R · 3 bidders
            </p>

            {/* Chain */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {OFFER_CHAIN.map((o, i) => (
                <span key={i} className={`offer-pill ${o.cls}`}>{o.label}</span>
              ))}
            </div>

            <p className="mt-5 text-sm text-zinc-500">
              Accepting one offer{' '}
              <strong className="text-acid">locks the listing</strong>
              {' '}— all other bidders auto-decline instantly. Nobody gets ghosted.
            </p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[['₹20,500', 'sold price'], ['★ 4.5', 'seller rating'], ['7 days', 'avg to sell']].map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-edge bg-void p-4 text-center">
                  <p className="display text-xl font-bold text-acid">{v}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-600">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample listings */}
        <section className="reveal mb-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="display text-sm font-black uppercase tracking-widest text-zinc-500">Live Listings</h2>
            <Link to="/market" className="text-xs font-bold text-acid hover:underline">View all →</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {LISTINGS.map(({ title, price, tag, badge, img }) => (
              <div key={title} className="listing-card p-5">
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{img}</span>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${badge}`}>{tag}</span>
                </div>
                <h3 className="display mt-4 text-base font-bold text-zinc-100">{title}</h3>
                <p className="display mt-2 text-2xl font-black text-acid">{price}</p>
                <button className="btn-3d btn-acid mt-4 w-full rounded-xl py-2.5 text-sm">
                  Make an Offer
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="reveal mb-8 grid gap-5 pb-16 sm:grid-cols-3">
          {[
            ['💬', 'Offers, Not Comments', 'Real amounts with a visible chain. No "dm price" ever — everything is transparent.'],
            ['🔒', 'Exclusive Deals', 'One winner. Auto-declined rivals with a full audit history so everyone knows it\'s fair.'],
            ['📉', 'Honest Prices', 'Every listing shows the last sold prices in its category before you place a bid.'],
          ].map(([icon, t, b]) => (
            <div key={t} className="hover-lift listing-card rounded-2xl p-7 transition-all">
              <span className="text-3xl">{icon}</span>
              <h3 className="display mt-4 text-sm font-black uppercase tracking-wider text-acid">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{b}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Acid marquee */}
      <div className="border-y border-edge bg-acid py-3">
        <div className="marquee gap-8 text-sm font-black text-void">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="display flex gap-8 pr-8">
              {['BOOKS', '★', 'ELECTRONICS', '★', 'FURNITURE', '★', 'BIKES', '★', 'CYCLES SOLD DAILY', '★', 'ZERO GHOSTING'].map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer className="relative py-12 text-center">
        <p className="display text-sm tracking-[0.2em] text-zinc-700">RESELLRING — THE CAMPUS RESALE RING.</p>
      </footer>
    </div>
  );
}
