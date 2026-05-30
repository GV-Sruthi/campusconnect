import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/useAuth';

export function Home() {
  const { user } = useAuth();
  const [recentNotes, setRecentNotes] = useState([]);
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [trendingNotes, setTrendingNotes] = useState([]);
  const [myNotesCount, setMyNotesCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [recentRes, recommendedRes, trendingRes, uploadedRes, bookmarkedRes] = await Promise.all([
          api.get('/notes?sort=createdAt'),
          api.get(`/notes?branch=${encodeURIComponent(user.branch)}&semester=${encodeURIComponent(user.year)}&sort=recommended`),
          api.get('/notes?sort=downloads'),
          api.get(`/notes?uploadedBy=${user.id}`),
          api.get(`/notes?bookmarkedBy=${user.id}`),
        ]);

        setRecentNotes(recentRes.data.notes || []);
        setRecommendedNotes(recommendedRes.data.notes || []);
        setTrendingNotes(trendingRes.data.notes || []);
        setMyNotesCount((uploadedRes.data.notes || []).length);
        setBookmarkCount((bookmarkedRes.data.notes || []).length);
        setDownloadCount((uploadedRes.data.notes || []).reduce((sum, note) => sum + (note.downloads || 0), 0));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-pink-400">Campus Dashboard</p>
              <h1 className="mt-3 text-4xl font-bold text-white">Welcome back, {user?.name || 'Student'}.</h1>
              <p className="mt-2 text-zinc-400 max-w-2xl">
                Quickly browse notes, discover trending resources, and stay connected with your campus community.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-zinc-800 p-4 text-center">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Your notes</p>
                <p className="mt-3 text-3xl font-semibold text-white">{myNotesCount}</p>
              </div>
              <div className="rounded-3xl bg-zinc-800 p-4 text-center">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Bookmarks</p>
                <p className="mt-3 text-3xl font-semibold text-white">{bookmarkCount}</p>
              </div>
              <div className="rounded-3xl bg-zinc-800 p-4 text-center">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Downloads</p>
                <p className="mt-3 text-3xl font-semibold text-white">{downloadCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Recently uploaded notes</h2>
                <p className="text-zinc-400">Latest resources shared by students across campus.</p>
              </div>
              <span className="rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white">{recentNotes.length} resources</span>
            </div>
            <div className="grid gap-4">
              {loading ? (
                <div className="text-zinc-400">Loading notes…</div>
              ) : recentNotes.slice(0, 4).map((note) => (
                <div key={note._id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-pink-400">{note.subject} · Semester {note.semester}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{note.title}</h3>
                    </div>
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">{note.branch}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{note.uploadedBy?.name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{note.downloads || 0} downloads</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <aside className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <div>
              <h2 className="text-2xl font-semibold text-white">Recommended for you</h2>
              <p className="text-zinc-400">Based on your branch and year.</p>
            </div>
            <div className="grid gap-4">
              {loading ? (
                <div className="text-zinc-400">Loading recommendations…</div>
              ) : recommendedNotes.slice(0, 3).map((note) => (
                <div key={note._id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                  <h3 className="text-lg font-semibold text-white">{note.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{note.description || 'No description available.'}</p>
                  <div className="mt-3 flex items-center justify-between text-sm text-zinc-400">
                    <span>{note.subject}</span>
                    <span>{note.downloads || 0} downloads</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Trending notes</h2>
              <p className="text-zinc-400">The most popular resources across campus.</p>
            </div>
            <span className="rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white">Top downloads</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="text-zinc-400">Loading trending notes…</div>
            ) : trendingNotes.slice(0, 4).map((note) => (
              <div key={note._id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{note.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{note.subject}</p>
                  </div>
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-zinc-400">{note.branch}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-zinc-400">
                  <span>{note.uploadedBy?.name || 'Unknown'}</span>
                  <span>{note.downloads || 0} downloads</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

