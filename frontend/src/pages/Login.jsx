import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/useAuth';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (!res.data?.success) throw new Error(res.data?.message || 'Login failed');
      login({ token: res.data.token, user: res.data.user });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="bg-zinc-900 p-10 rounded-2xl w-100 shadow-2xl border border-zinc-800"
      >
        <h1 className="text-4xl font-bold text-white text-center">Welcome Back</h1>
        <p className="text-zinc-400 text-center mt-2">Login to continue</p>

        <div className="mt-8 space-y-5">
          <input
            type="email"
            required
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none"
          />
          <input
            type="password"
            required
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none"
          />
          {error ? <div className="text-red-400 text-sm">{error}</div> : null}
          <button
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
}

