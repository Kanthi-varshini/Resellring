import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', campus: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function validate() {
    if (form.name.trim().length < 2) return 'Enter your name (2+ characters).';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      return 'Password needs 8+ characters with a letter and a number.';
    return '';
  }

  async function submit(e) {
    e.preventDefault();
    const v = validate();
    setError(v);
    if (v) return;
    setBusy(true);
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim() });
      toast('In the ring — list something or make an offer');
      navigate('/market');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="display text-2xl font-bold text-acid">JOIN THE RING</h1>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-edge bg-card p-6">
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <label className="block"><span className="text-sm text-zinc-300">Name</span>
            <input value={form.name} onChange={set('name')} className="mt-1 w-full rounded-lg border border-edge bg-void px-3 py-2.5 text-white outline-none focus:border-acid" /></label>
          <label className="block"><span className="text-sm text-zinc-300">Campus</span>
            <input value={form.campus} onChange={set('campus')} placeholder="e.g. VIT Pune" className="mt-1 w-full rounded-lg border border-edge bg-void px-3 py-2.5 text-white outline-none focus:border-acid" /></label>
          <label className="block"><span className="text-sm text-zinc-300">Email</span>
            <input type="email" value={form.email} onChange={set('email')} className="mt-1 w-full rounded-lg border border-edge bg-void px-3 py-2.5 text-white outline-none focus:border-acid" /></label>
          <label className="block"><span className="text-sm text-zinc-300">Password</span>
            <input type="password" value={form.password} onChange={set('password')} className="mt-1 w-full rounded-lg border border-edge bg-void px-3 py-2.5 text-white outline-none focus:border-acid" /></label>
          <button disabled={busy} className="w-full rounded-lg bg-acid py-2.5 font-bold text-void disabled:opacity-60">{busy ? 'Joining…' : 'Create account'}</button>
          <p className="text-center text-sm text-zinc-400">Already in? <Link to="/login" className="font-semibold text-acid hover:underline">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
