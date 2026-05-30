import React, { useEffect, useState } from 'react';
import api from '../api';

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((cur) => cur.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="mt-2 text-zinc-400">Stay updated when someone interacts with your posts and notes.</p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">No notifications yet. Engage with the community to get updates.</div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification._id} className={`rounded-3xl border ${notification.isRead ? 'border-zinc-800 bg-zinc-900' : 'border-pink-500 bg-zinc-950'} p-5`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-pink-400">{notification.type.replace('_', ' ')}</p>
                    <p className="mt-3 text-lg font-semibold text-white">{notification.message}</p>
                  </div>
                  <div className="space-y-1 text-right text-sm text-zinc-400">
                    <p>{new Date(notification.createdAt).toLocaleString()}</p>
                    <button onClick={() => markRead(notification._id)} className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white hover:bg-zinc-700">
                      Mark read
                    </button>
                  </div>
                </div>
                {notification.link ? (
                  <a href={notification.link} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-pink-400 hover:text-white">
                    View related item
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
