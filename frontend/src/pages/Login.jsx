import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="display text-2xl font-bold text-acid">WELCOME BACK</h1>
          <p className="text-sm text-zinc-500">Your deals missed you</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-edge bg-card p-6">
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <label className="block"><span className="text-sm text-zinc-300">Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email"
              className="mt-1 w-full rounded-lg border border-edge bg-void px-3 py-2.5 text-white outline-none focus:border-acid" /></label>
          <label className="block"><span className="text-sm text-zinc-300">Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-edge bg-void px-3 py-2.5 text-white outline-none focus:border-acid" /></label>
          <button disabled={busy} className="w-full rounded-lg bg-acid py-2.5 font-bold text-void disabled:opacity-60">{busy ? 'Logging…' : 'Log in'}</button>
          <p className="text-center text-sm text-zinc-400">New? <Link to="/register" className="font-semibold text-acid hover:underline">Join the ring</Link></p>
        </form>
        <p className="mt-4 text-center text-xs text-zinc-500">Demo: kabir@demo.com (seller) · tara@demo.com (buyer) · Demo@1234</p>
      </div>
    </div>
  );
}
