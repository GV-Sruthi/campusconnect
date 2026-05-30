import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../api';

export function Navbar({ appName = 'CampusConnect' }) {
  const { token, user, logout } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (!token) return;

    const fetchCount = async () => {
      try {
        const res = await api.get('/notifications');
        const count = res.data.notifications?.filter((item) => !item.isRead).length || 0;
        setUnreadNotifications(count);
      } catch {
        setUnreadNotifications(0);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 20000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <header className="w-full border-b border-zinc-800 bg-zinc-950">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-pink-500">
            {appName}
          </Link>
          {token ? (
            <>
              <Link to="/" className="text-sm text-zinc-300 hover:text-white">
                Dashboard
              </Link>
              <Link to="/notes" className="text-sm text-zinc-300 hover:text-white">
                Notes
              </Link>
              <Link to="/community" className="text-sm text-zinc-300 hover:text-white">
                Community
              </Link>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {!token ? (
            <>
              <Link to="/login">
                <button className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white">
                  Register
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/notifications" className="relative text-sm text-zinc-300 hover:text-white">
                Notifications
                {unreadNotifications > 0 ? (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-2 text-[0.65rem] font-semibold text-white">
                    {unreadNotifications}
                  </span>
                ) : null}
              </Link>
              <Link to="/profile" className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-sm font-semibold text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </span>
                <span className="flex flex-col text-left">
                  <span>{user?.name || 'Student'}</span>
                  <span className="text-xs text-zinc-400">{user?.branch} • Yr {user?.year} • Sem {user?.semester || '–'}</span>
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

