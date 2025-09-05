import React, { useState } from 'react';
import api from '../api';

const TeacherDailyReportModal = ({ isOpen, onClose, student, onSaved }) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [notes, setNotes] = useState('');
  const [attendance, setAttendance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/daily-reports', {
        student_id: student.id,
        report_date: date,
        notes,
        attendance
      });
      if (data.success) {
        onSaved?.(data.report);
        onClose();
      } else {
        setError(data.message || 'Failed to save');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Daily Report - {student.name}</h3>
          <button className="close-btn" type="button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="teacher-form">
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Attendance</label>
              <select value={attendance ? 'present' : 'absent'} onChange={(e) => setAttendance(e.target.value === 'present')}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows="4" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Daily notes..." />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button className="cancel-btn" type="button" onClick={onClose}>Cancel</button>
            <button className="submit-btn" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherDailyReportModal;


