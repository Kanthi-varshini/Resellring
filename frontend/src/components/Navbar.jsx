import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-void/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/market" className="display text-lg font-bold tracking-tight text-acid">RESELLRING</Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link to="/market" className="rounded px-3 py-2 text-zinc-400 hover:text-white">Market</Link>
          {user ? (
            <>
              <Link to="/my-ring" className="rounded px-3 py-2 text-zinc-400 hover:text-white">My ring</Link>
              <span className="hidden text-xs text-zinc-500 md:block">{user.name}</span>
              <button onClick={() => { logout(); navigate('/market'); }} className="ml-1 rounded border border-edge px-3 py-1.5 text-zinc-300 hover:border-acid hover:text-acid">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded px-3 py-2 text-zinc-400 hover:text-white">Log in</Link>
              <Link to="/register" className="rounded bg-acid px-4 py-2 font-bold text-void">Join</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
