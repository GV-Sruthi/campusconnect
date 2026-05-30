import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/useAuth';

const categories = [
  { value: 'announcement', label: 'Announcements' },
  { value: 'lostfound', label: 'Missing Info' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'urgent', label: 'Urgent Alerts' },
];

export function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'discussion', tags: '' });
  const [audience, setAudience] = useState('all');
  const [targetBranch, setTargetBranch] = useState(user?.branch || 'CSE');
  const [targetYear, setTargetYear] = useState(user?.year || 1);
  const [targetSemester, setTargetSemester] = useState(user?.semester || 1);
  const [targetSection, setTargetSection] = useState(user?.section || 'A');
  const [submitError, setSubmitError] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts${category ? `?category=${category}` : ''}`);
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/posts${category ? `?category=${category}` : ''}`);
        setPosts(res.data.posts || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [category]);

  useEffect(() => {
    if (!user) return;
    const updateDefaults = () => {
      setTargetBranch(user.branch || 'CSE');
      setTargetYear(user.year || 1);
      setTargetSemester(user.semester || 1);
      setTargetSection(user.section || 'A');
    };
    updateDefaults();
  }, [user]);

  const createPost = async (event) => {
    event.preventDefault();
    setSubmitError('');
    try {
      await api.post('/posts', {
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        audience,
        targetBranch: audience === 'branch' ? targetBranch : undefined,
        targetYear: audience === 'year' ? targetYear : undefined,
        targetSemester: audience !== 'all' ? targetSemester : undefined,
        targetSection: audience === 'section' ? targetSection : undefined,
      });
      setForm({ title: '', description: '', category: 'discussion', tags: '' });
      setAudience('all');
      await loadPosts();
    } catch (error) {
      setSubmitError(error?.response?.data?.message || error.message || 'Failed to create post');
    }
  };

  const addComment = async (postId, text) => {
    if (!text) return;
    try {
      await api.post(`/posts/${postId}/comment`, { text });
      await loadPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleUpvote = async (postId) => {
    try {
      await api.post(`/posts/${postId}/upvote`);
      await loadPosts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Campus Community</h1>
              <p className="mt-2 text-zinc-400">Post study requests, share campus alerts, and connect with classmates.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(category === cat.value ? '' : cat.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${category === cat.value ? 'bg-pink-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-white">Create a post</h2>
          <p className="mt-2 text-zinc-400">Ask for notes, announce campus updates, or report missing info to your peers.</p>
          <form onSubmit={createPost} className="mt-6 grid gap-4">
            <input
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Post title"
              className="rounded-3xl bg-zinc-800 p-3 text-white outline-none"
            />
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Tell your campus what you need or want to share"
              rows={4}
              className="rounded-3xl bg-zinc-800 p-3 text-white outline-none"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="rounded-3xl bg-zinc-800 p-3 text-white outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="Tags (comma-separated)"
                className="rounded-3xl bg-zinc-800 p-3 text-white outline-none"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="rounded-3xl bg-zinc-800 p-3 text-white outline-none"
              >
                <option value="all">Everyone on campus</option>
                <option value="year">Same year</option>
                <option value="branch">Same branch</option>
                <option value="section">Section only</option>
              </select>
              {audience !== 'all' ? (
                audience === 'year' ? (
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(Number(e.target.value))}
                    className="rounded-3xl bg-zinc-800 p-3 text-white outline-none"
                  >
                    {[1, 2, 3, 4].map((yearOption) => (
                      <option key={yearOption} value={yearOption}>Year {yearOption}</option>
                    ))}
                  </select>
                ) : audience === 'branch' ? (
                  <input
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    placeholder="Target branch"
                    className="rounded-3xl bg-zinc-800 p-3 text-white outline-none"
                  />
                ) : (
                  <input
                    value={targetSection}
                    onChange={(e) => setTargetSection(e.target.value)}
                    placeholder="Target section"
                    className="rounded-3xl bg-zinc-800 p-3 text-white outline-none"
                  />
                )
              ) : (
                <div className="flex items-center rounded-3xl bg-zinc-800 p-3 text-zinc-400">Visible to everyone on campus</div>
              )}
            </div>
            {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}
            <button type="submit" className="w-full rounded-3xl bg-pink-500 px-6 py-3 font-semibold text-white hover:bg-pink-600">
              Post to Community
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">Loading posts…</div>
          ) : posts.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">No posts found. Create one!</div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-pink-400">
                      <span>{post.category === 'lostfound' ? 'Missing Info' : post.category === 'urgent' ? 'Urgent Alert' : post.category?.charAt(0).toUpperCase() + post.category.slice(1)}</span>
                      {post.tags?.length ? <span>• {post.tags.join(', ')}</span> : null}
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold text-white">{post.title}</h3>
                    <p className="mt-3 text-zinc-400">{post.description}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.24em] text-zinc-500">
                      {post.audience === 'all' ? 'Campus wide' : post.audience === 'year' ? `Year ${post.targetYear || 'same'}` : post.audience === 'branch' ? `Branch ${post.targetBranch || 'same'}` : `Section ${post.targetSection || 'same'}`}
                    </p>
                  </div>
                  <div className="space-y-2 text-right text-sm text-zinc-400">
                    <p>{post.author?.name || user.name}</p>
                    <p>{new Date(post.createdAt).toLocaleString()}</p>
                    <p>{post.upvotes?.length || 0} likes</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button onClick={() => toggleUpvote(post._id)} className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600">
                    Like
                  </button>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const value = e.target.elements.comment.value.trim();
                      addComment(post._id, value);
                      e.target.reset();
                    }}
                    className="flex-1"
                  >
                    <div className="flex gap-2">
                      <input name="comment" placeholder="Add a comment" className="flex-1 rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
                      <button type="submit" className="rounded-3xl bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700">Comment</button>
                    </div>
                  </form>
                </div>
                {post.comments?.length ? (
                  <div className="mt-5 space-y-3 rounded-3xl bg-zinc-950 p-4">
                    {post.comments.slice(-3).map((comment) => (
                      <div key={comment._id || `${comment.author?._id}-${comment.createdAt}`} className="rounded-3xl bg-zinc-900 p-3">
                        <p className="text-sm font-semibold text-white">{comment.author?.name || 'Student'}:</p>
                        <p className="mt-1 text-sm text-zinc-400">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
