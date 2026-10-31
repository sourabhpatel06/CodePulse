import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/contests', label: 'Contests' },
  { to: '/community', label: 'Community' },
  { to: '/connect', label: 'Manage handles' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onClick }) =>
    links.map((link) => {
      const active = location.pathname === link.to;
      return (
        <Link
          key={link.to}
          to={link.to}
          onClick={onClick}
          className={`text-sm font-medium rounded-lg px-3 py-1.5 border ${
            active ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {link.label}
        </Link>
      );
    });

  return (
    <div className="mb-6">
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
        <NavLinks />
        <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700 ml-auto px-3 py-1.5">
          Log out
        </button>
      </div>

      <div className="flex sm:hidden items-center justify-between">
        <span className="text-sm font-medium text-slate-900">CodePulse</span>
        <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" className="text-slate-600 p-1.5">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="flex sm:hidden flex-col gap-2 mt-3 pb-2 border-b border-slate-200">
          <NavLinks onClick={() => setOpen(false)} />
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700 text-left px-3 py-1.5">
            Log out
          </button>
        </div>
      )}
    </div>
  );
}