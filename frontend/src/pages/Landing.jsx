import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/market" className="display text-lg font-bold text-acid">RESELLRING</Link>
        <Link to={user ? '/market' : '/register'} className="rounded bg-acid px-5 py-2 text-sm font-bold text-void">
          {user ? 'Enter the market' : 'Join the ring'}
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-4">
        <section className="py-24 text-center">
          <h1 className="display mx-auto max-w-3xl text-5xl font-bold leading-tight">
            SELL FAST<br /><span className="text-acid">ON CAMPUS.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
            Marketplace groups are comment chaos: "available?", haggling in DMs,
            meetups that never happen. ResellRing structures the sale —
            listing → offers → acceptance → pickup → rating.
          </p>
          <div className="mt-9 flex justify-center gap-3">
            <Link to="/market" className="rounded bg-acid px-8 py-3 font-bold text-void">Browse the market</Link>
            <Link to="/register" className="rounded border border-edge px-8 py-3 font-bold text-zinc-200 hover:border-acid">Start selling</Link>
          </div>
        </section>
        <section className="grid gap-4 pb-24 sm:grid-cols-3">
          {[
            ['Offers, not comments', 'Real amounts with a visible chain: offered → countered → accepted. No "dm price".'],
            ['Exclusive deals', 'Accepting one offer locks the listing and auto-declines the rest. Nobody gets ghosted.'],
            ['Honest prices', 'Every listing shows the last sold prices in its category before you bid.'],
          ].map(([t, b]) => (
            <div key={t} className="rounded-xl border border-edge bg-card p-6">
              <h3 className="display text-sm font-bold uppercase text-acid">{t}</h3>
              <p className="mt-2 text-sm text-zinc-400">{b}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t border-edge py-6 text-center text-sm text-zinc-500">RESELLRING — the campus resale ring.</footer>
    </div>
  );
}
