import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-void/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          to="/market"
          className="display text-xl font-black tracking-tight text-acid transition hover:opacity-80"
          style={{ textShadow: '0 0 20px rgba(211,242,106,.25)' }}
        >
          RESELLRING
        </Link>

        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link to="/market" className="nav-link">Market</Link>
          {user && <Link to="/my-ring" className="nav-link">My Ring</Link>}
          <Link to="/guide" className="nav-link">📖 Guide</Link>
          {user ? (
            <>
              <span className="mono mx-2 hidden rounded border border-edge bg-card2 px-3 py-1 text-[10px] text-zinc-500 md:block">
                {user.name}
              </span>
              <button
                onClick={() => { logout(); navigate('/market'); }}
                className="rounded-xl border border-edge px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-acid/50 hover:text-acid"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Log in</Link>
              <Link to="/register" className="btn-3d btn-acid ml-2 rounded-xl px-5 py-2 text-sm font-bold">
                Join the Ring
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
