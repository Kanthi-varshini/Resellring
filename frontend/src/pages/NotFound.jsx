import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="display text-7xl font-bold text-acid">404</p>
      <h1 className="display text-xl font-bold">SOLD OUT</h1>
      <p className="text-zinc-400">The page you're looking for doesn't exist.</p>
      <Link to="/market" className="rounded bg-acid px-6 py-2.5 font-bold text-void">Back to the market</Link>
    </div>
  );
}
