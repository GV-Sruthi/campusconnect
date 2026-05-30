#!/usr/bin/env python3
"""
NotesNest Frontend Setup Script
Creates all necessary frontend files and directories
Run from frontend root: python3 setup_frontend.py
"""

import os
from pathlib import Path

# Get frontend directory
frontend_dir = Path('.').resolve()

files_to_create = {
    'src/utils/api.js': '''import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
''',

    'src/context/AuthContext.jsx': '''import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const getMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, getMe }}>
      {children}
    </AuthContext.Provider>
  );
};
''',

    'src/hooks/useAuth.js': '''import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
''',

    'src/hooks/usePosts.js': '''import { useState, useCallback } from 'react';
import api from '../utils/api';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPosts = useCallback(async (category = null) => {
    try {
      setLoading(true);
      const { data } = await api.get('/posts', { params: { category } });
      setPosts(data.posts);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (postData) => {
    try {
      setLoading(true);
      const { data } = await api.post('/posts', postData);
      setPosts([data.post, ...posts]);
      return data.post;
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [posts]);

  const upvotePost = useCallback(async (postId) => {
    try {
      const { data } = await api.post(`/posts/${postId}/upvote`);
      setPosts(posts.map(p => p._id === postId ? data.post : p));
    } catch (err) {
      setError(err.response?.data?.message || 'Error upvoting');
    }
  }, [posts]);

  const addComment = useCallback(async (postId, text) => {
    try {
      const { data } = await api.post(`/posts/${postId}/comment`, { text });
      setPosts(posts.map(p => p._id === postId ? data.post : p));
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding comment');
    }
  }, [posts]);

  return { posts, loading, error, getPosts, createPost, upvotePost, addComment };
};
''',

    'src/hooks/useNotes.js': '''import { useState, useCallback } from 'react';
import api from '../utils/api';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getNotes = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const { data } = await api.get('/notes', { params: filters });
      setNotes(data.notes);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching notes');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadNote = useCallback(async (formData) => {
    try {
      setLoading(true);
      const { data } = await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNotes([data.note, ...notes]);
      return data.note;
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading note');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [notes]);

  const upvoteNote = useCallback(async (noteId) => {
    try {
      const { data } = await api.post(`/notes/${noteId}/upvote`);
      setNotes(notes.map(n => n._id === noteId ? data.note : n));
    } catch (err) {
      setError(err.response?.data?.message || 'Error upvoting');
    }
  }, [notes]);

  const bookmarkNote = useCallback(async (noteId) => {
    try {
      const { data } = await api.post(`/notes/${noteId}/bookmark`);
      setNotes(notes.map(n => n._id === noteId ? data.note : n));
    } catch (err) {
      setError(err.response?.data?.message || 'Error bookmarking');
    }
  }, [notes]);

  return { notes, loading, error, getNotes, uploadNote, upvoteNote, bookmarkNote };
};
''',

    'src/components/Navbar.jsx': '''import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            📚 NotesNest
          </Link>

          <div className="flex gap-4">
            {!user ? (
              <>
                <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/notes" className="px-4 py-2 hover:bg-gray-100 rounded">
                  Notes
                </Link>
                <Link to="/events" className="px-4 py-2 hover:bg-gray-100 rounded">
                  Events
                </Link>
                <Link to={`/profile/${user.id}`} className="px-4 py-2 hover:bg-gray-100 rounded">
                  {user.name}
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
''',

    'src/components/PrivateRoute.jsx': '''import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};
''',

    'src/components/PostCard.jsx': '''export const PostCard = ({ post, onUpvote, onComment }) => {
  const categoryColors = {
    announcement: 'bg-blue-100 text-blue-800',
    lostfound: 'bg-yellow-100 text-yellow-800',
    recruitment: 'bg-green-100 text-green-800',
    discussion: 'bg-purple-100 text-purple-800',
    urgent: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      {post.isPinned && <div className="bg-red-500 text-white px-2 py-1 rounded text-xs mb-2">📌 Pinned</div>}
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold">{post.title}</h3>
        <span className={`px-2 py-1 rounded text-xs ${categoryColors[post.category]}`}>
          {post.category}
        </span>
      </div>

      <p className="text-gray-700 mb-3">{post.description}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>By {post.author?.name} • {new Date(post.createdAt).toLocaleDateString()}</span>
        <div className="flex gap-4">
          <button
            onClick={() => onUpvote(post._id)}
            className="hover:text-blue-600"
          >
            👍 {post.upvotes?.length || 0}
          </button>
          <button
            onClick={() => onComment(post._id)}
            className="hover:text-blue-600"
          >
            💬 {post.comments?.length || 0}
          </button>
        </div>
      </div>
    </div>
  );
};
''',

    'src/components/NoteCard.jsx': '''export const NoteCard = ({ note, onUpvote, onBookmark, onDownload }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-bold mb-2">{note.title}</h3>
      
      <div className="text-sm text-gray-600 mb-3">
        <p>📚 {note.subject} • Unit {note.unit}</p>
        <p>👤 {note.uploadedBy?.name} • 📅 {new Date(note.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="flex gap-4 text-sm">
        <button
          onClick={() => onUpvote(note._id)}
          className="hover:text-blue-600 flex items-center gap-1"
        >
          👍 {note.upvotes?.length || 0}
        </button>
        <button
          onClick={() => onBookmark(note._id)}
          className="hover:text-orange-600 flex items-center gap-1"
        >
          🔖 {note.bookmarks?.length || 0}
        </button>
        <button
          onClick={() => onDownload(note._id)}
          className="hover:text-green-600 flex items-center gap-1"
        >
          ⬇️ {note.downloads || 0}
        </button>
      </div>
    </div>
  );
};
''',

    'src/pages/Login.jsx': '''import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600">
        Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
      </p>
    </div>
  );
};
''',

    'src/pages/Register.jsx': '''import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: 'CSE',
    year: 1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Branch</label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>CSE</option>
            <option>ECE</option>
            <option>ME</option>
            <option>CE</option>
            <option>EE</option>
            <option>BT</option>
            <option>OTHER</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Year</label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      </p>
    </div>
  );
};
''',

    'src/pages/Home.jsx': '''import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';

export const Home = () => {
  const { posts, loading, error, getPosts, upvotePost, addComment } = usePosts();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    getPosts(selectedCategory);
  }, [selectedCategory, getPosts]);

  const handleAddComment = async (postId) => {
    if (commentText[postId]) {
      await addComment(postId, commentText[postId]);
      setCommentText({ ...commentText, [postId]: '' });
    }
  };

  const urgentPosts = posts.filter(p => p.isPinned);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📰 Campus Feed</h1>
        <Link to="/posts/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          New Post
        </Link>
      </div>

      {urgentPosts.length > 0 && (
        <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-6 rounded">
          🚨 <strong>Urgent Alerts:</strong>
          {urgentPosts.map(post => (
            <p key={post._id} className="text-red-800">{post.title}</p>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        {['announcement', 'recruitment', 'discussion', 'lostfound'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8">Loading posts...</div>}
      {error && <div className="text-center py-8 text-red-600">{error}</div>}

      <div>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No posts found</div>
        ) : (
          posts.map(post => (
            <div key={post._id}>
              <PostCard post={post} onUpvote={upvotePost} onComment={() => {}} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
''',

    'src/pages/Notes.jsx': '''import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { NoteCard } from '../components/NoteCard';

export const Notes = () => {
  const { notes, loading, error, getNotes, upvoteNote, bookmarkNote } = useNotes();
  const [filters, setFilters] = useState({ branch: '', semester: '', subject: '' });

  useEffect(() => {
    getNotes(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
  }, [filters, getNotes]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📚 Notes Library</h1>
        <Link to="/notes/upload" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Upload Notes
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <select
          value={filters.branch}
          onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="ME">ME</option>
        </select>

        <select
          value={filters.semester}
          onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search subject..."
          value={filters.subject}
          onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && <div className="text-center py-8">Loading notes...</div>}
      {error && <div className="text-center py-8 text-red-600">{error}</div>}

      <div>
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No notes found</div>
        ) : (
          notes.map(note => (
            <NoteCard
              key={note._id}
              note={note}
              onUpvote={upvoteNote}
              onBookmark={bookmarkNote}
              onDownload={() => window.open(note.pdfLink)}
            />
          ))
        )}
      </div>
    </div>
  );
};
''',

    'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
`,

    '.env.example': '''VITE_API_URL=http://localhost:5000/api
''',
}

# Create all files
created = 0
for file_path, content in files_to_create.items():
    full_path = frontend_dir / file_path
    full_path.parent.mkdir(parents=True, exist_ok=True)

    if not full_path.exists():
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {file_path}")
        created += 1
    else:
        print(f"⚠ {file_path} (exists)")

print(f"\n✅ Frontend setup complete! Created {created} files")
