import React, { useState, useEffect } from 'react';
import api from '../api';
import './AnnouncementsView.css'; // We will create this CSS file later

const AnnouncementsView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/announcements');
      setAnnouncements(response.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="announcements-view">
      <h2>Announcements</h2>
      {loading && <p>Loading announcements...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && announcements.length === 0 && (
        <p>No announcements available at this time.</p>
      )}
      <div className="announcements-list">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="announcement-item">
            <div className="announcement-header">
              <span className="announcement-sender">Admin</span>
              <span className="announcement-date">{formatDate(announcement.created_at)}</span>
            </div>
            <p className="announcement-message">{announcement.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsView;
