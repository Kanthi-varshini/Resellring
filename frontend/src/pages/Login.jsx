import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const DEMO_USERS = [
  { email: 'kabir@demo.com', label: 'Seller', icon: '📦', hint: 'Active listings' },
  { email: 'tara@demo.com', label: 'Buyer', icon: '🛒', hint: 'Pending offers' },
];

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Enter your email and password.');
    setBusy(true);
    try {
      await login(form.email, form.password);
      toast('Welcome back to the ring');
      navigate('/market');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Orbs */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="blob absolute -top-24 left-1/2 -translate-x-1/2 h-[24rem] w-[36rem] rounded-full bg-acid/7" style={{ animation: 'orbFloat 18s ease-in-out infinite' }} />
        <div className="blob absolute bottom-0 right-0 h-[16rem] w-[16rem] rounded-full bg-ember/4" style={{ animation: 'orbFloat 22s ease-in-out 3s infinite' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="display inline-block text-3xl font-black text-acid"
            style={{ textShadow: '0 0 30px rgba(211,242,106,.3)' }}
          >
            RESELLRING
          </Link>
          <h2 className="display mt-4 text-xl font-black uppercase tracking-wider text-zinc-300">Welcome back</h2>
          <p className="mt-1 text-sm text-zinc-500">Your deals missed you</p>
        </div>

        <form onSubmit={submit} className="listing-card space-y-5 rounded-3xl p-8">
          {/* Demo quick-fill */}
          <div className="grid grid-cols-2 gap-3">
            {DEMO_USERS.map(({ email, label, icon, hint }) => (
              <button
                key={email}
                type="button"
                onClick={() => { setForm({ email, password: 'Demo@1234' }); setError(''); }}
                className={`flex flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left text-xs transition hover:border-acid/50 hover:bg-acid/6 ${form.email === email ? 'border-acid/60 bg-acid/10' : 'border-edge2'}`}
              >
                <span className="text-base">{icon}</span>
                <span className="display font-black text-zinc-200">{label}</span>
                <span className="text-zinc-600">{hint}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
              <span className="text-red-400">⚠</span>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-600">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              placeholder="you@example.com"
              className="input-dark w-full rounded-xl px-4 py-3 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-600">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              placeholder="••••••••"
              className="input-dark w-full rounded-xl px-4 py-3 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="btn-3d btn-acid w-full rounded-2xl py-3.5 text-sm font-bold disabled:opacity-50"
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-void border-t-void/50" />
                Logging…
              </span>
            ) : 'Enter the Ring →'}
          </button>

          <p className="text-center text-sm text-zinc-500">
            New?{' '}
            <Link to="/register" className="font-bold text-acid hover:underline">
              Join the ring
            </Link>
          </p>
        </form>

        <p className="mt-5 text-center text-xs text-zinc-700">
          Demo: <span className="text-zinc-500">kabir@demo.com / tara@demo.com · Demo@1234</span>
        </p>
      </div>
    </div>
  );
}
