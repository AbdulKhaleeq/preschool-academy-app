import React, { useEffect, useState } from 'react';
import api from '../api';

const ParentDailyReportsModal = ({ isOpen, onClose, student }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!student || !isOpen) return;
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/daily-reports/${student.id}`);
        if (data.success) setReports(data.reports || []);
        else setError('Failed to load reports');
      } catch (e) {
        setError('Server error');
      } finally { setLoading(false); }
    };
    load();
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Daily Reports - {student.name}</h3>
          <button className="close-btn" type="button" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: 16, overflowX: 'auto' }}>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Date</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Notes</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td style={{ padding: 8 }}>{new Date(r.report_date).toLocaleDateString()}</td>
                    <td style={{ padding: 8 }}>{r.notes || '-'}</td>
                    <td style={{ padding: 8 }}>{r.attendance ? 'Present' : 'Absent'}</td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr><td colSpan={3} style={{ padding: 8 }}>No reports yet</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDailyReportsModal;


