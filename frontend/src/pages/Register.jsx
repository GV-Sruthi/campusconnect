import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/useAuth';

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState('A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { name, email, password, rollNumber, branch, year, semester, section });
      if (!res.data?.success) throw new Error(res.data?.message || 'Register failed');
      login({ token: res.data.token, user: res.data.user });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Register failed');
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
        <h1 className="text-4xl font-bold text-white text-center">Create campus account</h1>
        <p className="text-zinc-400 text-center mt-2">Join CampusConnect today</p>

        <div className="mt-8 space-y-5">
          <input
            type="text"
            required
            placeholder="Enter username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none"
          />
          <input
            type="text"
            required
            placeholder="Roll number"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none"
          />
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

          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none"
            >
              {['CSE', 'ECE', 'ME', 'CE', 'EE', 'BT', 'OTHER'].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none"
            >
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="Section (e.g. A)"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none"
            />
          </div>

          {error ? <div className="text-red-400 text-sm">{error}</div> : null}

          <button
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? 'Creating…' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}

