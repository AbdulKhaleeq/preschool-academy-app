// AdminAnnouncements.js
import React, { useEffect, useState } from 'react';
import api from '../api';
import './AdminAnnouncements.css';

const AdminAnnouncements = () => {
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all'); // all | parents | teachers
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/announcements');
      // server might return { announcements: [...] } or array directly
      const payload = Array.isArray(res.data) ? res.data : (res.data?.announcements || res.data || []);
      setAnnouncements(payload);
    } catch (err) {
      console.error(err);
      setError('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!message.trim()) {
      setError('Please enter an announcement.');
      return;
    }
    setSending(true);
    try {
      await api.post('/announcements', { message: message.trim(), audience });
      setSuccess('Announcement sent');
      setMessage('');
      fetchAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  // Format timestamp similar to your old UI
  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="admin-announcements-page">
      <div className="compose-wrap">
        <h2>Send Announcement</h2>
        <form className="compose-card" onSubmit={handleSend}>
          <textarea
            className="compose-textarea"
            placeholder="Write an announcement..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            aria-label="Announcement text"
          />

          <div className="compose-controls">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="audience-select"
              aria-label="Target audience"
            >
              <option value="all">All</option>
              <option value="parents">Parents</option>
              <option value="teachers">Teachers</option>
            </select>

            <button
              type="submit"
              className="send-pill"
              disabled={sending || !message.trim()}
              aria-disabled={sending || !message.trim()}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div className="compose-feedback">
            {error && <div className="error-text">{error}</div>}
            {success && <div className="success-text">{success}</div>}
          </div>
        </form>
      </div>

      <div className="previous-wrap">
        <h3>Previous Announcements</h3>

        <div className="announcements-list">
          {loading && <div className="list-loading">Loading…</div>}
          {!loading && announcements.length === 0 && <div className="empty-list">No announcements yet.</div>}

          {announcements.map((a) => (
            <div key={a.id || a._id || Math.random()} className="announcement-item">
              <div className="left-col">
                <div className="admin-avatar">Admin</div>
              </div>

              <div className="right-col">
                <div className="item-header">
                  <div className="sender">Admin</div>
                  <div className="meta-right">
                    <div className="announce-date">{formatDate(a.created_at || a.createdAt || a.date || a.timestamp)}</div>
                    <div className={`audience-badge ${String(a.audience || a.target || 'all').toLowerCase()}`}>
                      {String(a.audience || a.target || 'all')}
                    </div>
                  </div>
                </div>

                <div className="announce-message">
                  {a.message || a.content || a.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
