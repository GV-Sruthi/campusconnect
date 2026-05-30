import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/useAuth';

const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'BT', 'OTHER'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [subject, setSubject] = useState('');
  const [branch, setBranch] = useState(user?.branch || '');
  const [semester, setSemester] = useState(user?.semester || '');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', subject: '', branch: user?.branch || 'CSE', semester: 1, tags: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!user) return;
    const updateDefaults = () => {
      setBranch(user.branch || '');
      setSemester(user.semester || '');
      setForm((prev) => ({
        ...prev,
        branch: user.branch || prev.branch,
        semester: user.semester || prev.semester,
      }));
    };
    updateDefaults();
  }, [user]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (subject) params.append('subject', subject);
    if (branch) params.append('branch', branch);
    if (semester) params.append('semester', semester);
    if (tags) params.append('tags', tags);
    params.append('sort', 'downloads');
    return params.toString();
  }, [keyword, subject, branch, semester, tags]);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/notes?${queryString}`);
        setNotes(res.data.notes || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [queryString]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('subject', form.subject);
      formData.append('branch', form.branch);
      formData.append('semester', form.semester);
      formData.append('tags', form.tags);
      formData.append('pdf', file);

      await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm({ title: '', description: '', subject: '', branch: user?.branch || 'CSE', semester: 1, tags: '' });
      setFile(null);
      setUploadError('');
      const refreshed = await api.get(`/notes?${queryString}`);
      setNotes(refreshed.data.notes || []);
    } catch (error) {
      setUploadError(error?.response?.data?.message || error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleBookmark = async (note) => {
    try {
      await api.post(`/notes/${note._id}/bookmark`);
      setNotes((current) => current.map((item) => (item._id === note._id ? { ...item, bookmarks: item.bookmarks.includes(user?.id) ? item.bookmarks.filter((id) => id !== user?.id) : [...item.bookmarks, user?.id] } : item)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = async (note) => {
    try {
      const res = await api.get(`/notes/${note._id}/download`);
      if (res.data.success && res.data.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Notes Library</h1>
              <p className="mt-2 text-zinc-400">Browse, filter, and upload campus study material.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => window.location.assign('/community')} className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600">
                Visit Community Feed
              </button>
            </div>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-3">
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search keyword..." className="rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="rounded-3xl bg-zinc-800 p-3 text-white outline-none">
              <option value="">All branches</option>
              {branches.map((branchOption) => (
                <option key={branchOption} value={branchOption}>{branchOption}</option>
              ))}
            </select>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} className="rounded-3xl bg-zinc-800 p-3 text-white outline-none md:col-span-2">
              <option value="">All semesters</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags comma-separated" className="rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
          </form>
        </div>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-white">Upload a note</h2>
          <p className="mt-2 text-zinc-400">Share PDF, DOC or image files with your classmates.</p>
          <form onSubmit={handleUpload} className="mt-6 grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <input required value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" className="rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
              <input required value={form.subject} onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))} placeholder="Subject" className="rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
            </div>
            <textarea required value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={3} className="rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
            <div className="grid gap-4 md:grid-cols-3">
              <select required value={form.branch} onChange={(e) => setForm((prev) => ({ ...prev, branch: e.target.value }))} className="rounded-3xl bg-zinc-800 p-3 text-white outline-none">
                {branches.map((branchOption) => (
                  <option key={branchOption} value={branchOption}>{branchOption}</option>
                ))}
              </select>
              <select required value={form.semester} onChange={(e) => setForm((prev) => ({ ...prev, semester: Number(e.target.value) }))} className="rounded-3xl bg-zinc-800 p-3 text-white outline-none">
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
              <input value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="Tags (comma-separated)" className="rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-3xl border border-dashed border-zinc-700 bg-zinc-800 px-4 py-4 text-sm text-zinc-300 hover:border-pink-500">
              <span>{file ? file.name : 'Choose a PDF, DOC, or image file'}</span>
              <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
            </label>
            {uploadError ? <p className="text-sm text-red-400">{uploadError}</p> : null}
            <button type="submit" disabled={uploading} className="w-full rounded-3xl bg-pink-500 px-6 py-3 font-semibold text-white hover:bg-pink-600 disabled:opacity-70">
              {uploading ? 'Uploading...' : 'Upload Note'}
            </button>
          </form>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {loading ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">Loading notes…</div>
          ) : notes.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">No notes match your filters.</div>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-pink-400">{note.subject}</p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{note.title}</h3>
                  </div>
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-zinc-400">{note.branch}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-400">{note.description || 'No description added.'}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
                  <span>Semester {note.semester}</span>
                  <span>•</span>
                  <span>{note.uploadedBy?.name || 'Unknown uploader'}</span>
                  <span>•</span>
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                  <span>{note.downloads || 0} downloads</span>
                  <span>{note.bookmarks?.length || 0} bookmarks</span>
                  <span>{note.upvotes?.length || 0} likes</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => handleDownload(note)} className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600">
                    Preview / Download
                  </button>
                  <button onClick={() => toggleBookmark(note)} className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700">
                    {note.bookmarks?.includes(user?.id) ? 'Remove Bookmark' : 'Bookmark'}
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
