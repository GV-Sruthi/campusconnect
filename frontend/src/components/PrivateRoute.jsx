import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-zinc-950 text-white p-6">Loading...</div>;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

