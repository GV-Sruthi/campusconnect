import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/useAuth';

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [uploadedNotes, setUploadedNotes] = useState([]);
  const [bookmarkedNotes, setBookmarkedNotes] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', profileImage: '', skills: '', interests: '', rollNumber: '', section: '', semester: '' });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const [profileRes, uploadedRes, bookmarkedRes] = await Promise.all([
          api.get(`/users/${user.id}`),
          api.get(`/notes?uploadedBy=${user.id}`),
          api.get(`/notes?bookmarkedBy=${user.id}`),
        ]);
        setProfile(profileRes.data.user);
        setUploadedNotes(uploadedRes.data.notes || []);
        setBookmarkedNotes(bookmarkedRes.data.notes || []);
        setForm({
          name: profileRes.data.user.name || '',
          profileImage: profileRes.data.user.profileImage || '',
          skills: (profileRes.data.user.skills || []).join(', '),
          interests: (profileRes.data.user.interests || []).join(', '),
          rollNumber: profileRes.data.user.rollNumber || '',
          section: profileRes.data.user.section || '',
          semester: profileRes.data.user.semester || '',
        });
      } catch (error) {
        console.error(error);
      }
    };
    loadProfile();
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch('/users/profile', {
        name: form.name,
        profileImage: form.profileImage,
        skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        interests: form.interests.split(',').map((interest) => interest.trim()).filter(Boolean),
        rollNumber: form.rollNumber,
        section: form.section,
        semester: form.semester,
      });
      setProfile(res.data.user);
      setEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              <p className="mt-2 text-zinc-400">Manage your academic profile and view your contributions.</p>
            </div>
            {profile ? (
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500 text-2xl font-semibold text-white">
                  {profile.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="text-right text-sm text-zinc-400">
                  <p>{profile.branch} • Year {profile.year}</p>
                  <p>{profile.email}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {profile ? (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
              <div className="flex items-center gap-4">
                <img src={profile.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'} alt="Profile avatar" className="h-20 w-20 rounded-full object-cover" />
                <div>
                  <h2 className="text-2xl font-semibold text-white">{profile.name}</h2>
                  <p className="text-zinc-400">{profile.branch} • Year {profile.year} • Semester {profile.semester} • Section {profile.section}</p>
                  <p className="text-zinc-400">Roll: {profile.rollNumber}</p>
                </div>
                <div>
                  <p className="text-zinc-200">Skills</p>
                  <p>{(profile.skills || []).join(', ') || 'No skills added yet.'}</p>
                </div>
                <div>
                  <p className="text-zinc-200">Interests</p>
                  <p>{(profile.interests || []).join(', ') || 'No interests added yet.'}</p>
                </div>
              </div>

              <button onClick={() => setEditing((prev) => !prev)} className="mt-6 rounded-3xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-600">
                {editing ? 'Cancel' : 'Edit profile'}
              </button>

              {editing ? (
                <form onSubmit={saveProfile} className="mt-6 space-y-4">
                  <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Full name" className="w-full rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
                  <input value={form.rollNumber} onChange={(e) => setForm((prev) => ({ ...prev, rollNumber: e.target.value }))} placeholder="Roll number" className="w-full rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
                  <div className="grid gap-4 md:grid-cols-3">
                    <input value={form.section} onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))} placeholder="Section" className="w-full rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
                    <input value={form.semester} type="number" min="1" max="8" onChange={(e) => setForm((prev) => ({ ...prev, semester: Number(e.target.value) }))} placeholder="Semester" className="w-full rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
                    <input value={form.profileImage} onChange={(e) => setForm((prev) => ({ ...prev, profileImage: e.target.value }))} placeholder="Profile photo URL" className="w-full rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
                  </div>
                  <input value={form.skills} onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))} placeholder="Skills (comma-separated)" className="w-full rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
                  <input value={form.interests} onChange={(e) => setForm((prev) => ({ ...prev, interests: e.target.value }))} placeholder="Interests (comma-separated)" className="w-full rounded-3xl bg-zinc-800 p-3 text-white outline-none" />
                  <button type="submit" className="rounded-3xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-600">Save profile</button>
                </form>
              ) : null}
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
                <h2 className="text-2xl font-semibold text-white">Uploaded notes</h2>
                <p className="mt-2 text-zinc-400">Your shared study material.</p>
                <div className="mt-6 space-y-4">
                  {uploadedNotes.length === 0 ? (
                    <p className="text-zinc-400">You have not uploaded any notes yet.</p>
                  ) : (
                    uploadedNotes.map((note) => (
                      <div key={note._id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{note.title}</h3>
                            <p className="text-sm text-zinc-400">{note.subject} • Semester {note.semester}</p>
                          </div>
                          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-zinc-400">{note.downloads || 0} downloads</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
                <h2 className="text-2xl font-semibold text-white">Bookmarked notes</h2>
                <p className="mt-2 text-zinc-400">Saved resources for later.</p>
                <div className="mt-6 space-y-4">
                  {bookmarkedNotes.length === 0 ? (
                    <p className="text-zinc-400">No bookmarks yet. Save notes from the library.</p>
                  ) : (
                    bookmarkedNotes.map((note) => (
                      <div key={note._id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                        <h3 className="text-lg font-semibold text-white">{note.title}</h3>
                        <p className="mt-1 text-sm text-zinc-400">{note.subject} • {note.branch}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl text-zinc-400">Loading profile…</div>
        )}
      </div>
    </div>
  );
}
