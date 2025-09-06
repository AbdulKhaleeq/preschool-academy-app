import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
// Calendar UI (optional): npm install react-calendar
let Calendar = null;
try {
  // eslint-disable-next-line global-require
  Calendar = require('react-calendar').default;
} catch {}

// Helpers to avoid timezone shifts: always work with local dates
const formatYMD = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const labelFromYMD = (ymd) => {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString();
};

const TeacherDailyReportModal = ({ isOpen, onClose, student, onSaved }) => {
  const [date, setDate] = useState(() => formatYMD(new Date()));
  const [notes, setNotes] = useState('');
  const [attendance, setAttendance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [markedDates, setMarkedDates] = useState([]); // dates with notes

  const dateHasNote = useMemo(() => markedDates.includes(date), [markedDates, date]);

  useEffect(() => {
    const loadExisting = async () => {
      try {
        // prefetch dates with notes markers
        const res = await api.get(`/daily-reports/${student.id}/dates-with-notes`);
        if (res.data?.success) {
          const d = (res.data.dates || []).map((iso) => formatYMD(new Date(iso)));
          setMarkedDates(d);
        }
      } catch {}
    };
    if (student && isOpen) {
      loadExisting();
    }
  }, [student, isOpen]);

  useEffect(() => {
    const fetchByDate = async () => {
      if (!student || !date) return;
      try {
        const { data } = await api.get(`/daily-reports/${student.id}/by-date/${date}`);
        if (data.success && data.report) {
          setNotes(data.report.notes || '');
          setAttendance(typeof data.report.attendance === 'boolean' ? data.report.attendance : true);
        } else {
          setNotes('');
          setAttendance(true);
        }
      } catch (e) {
        // Do not block UI on fetch error; allow new entry
        setNotes('');
        setAttendance(true);
      }
    };
    fetchByDate();
  }, [student, date]);

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
        // update markers if note provided
        if ((notes || '').trim()) {
          setMarkedDates(prev => Array.from(new Set([...prev, date])));
        }
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
            <div className="form-group" style={{ width: '100%' }}>
              <label>Date</label>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 10, background: '#fff' }}>
                {Calendar ? (
                  <Calendar
                    value={new Date(date.split('-')[0], Number(date.split('-')[1]) - 1, Number(date.split('-')[2]))}
                    onChange={(d) => setDate(formatYMD(new Date(d)))}
                    tileContent={({ date: d }) => {
                      const iso = formatYMD(new Date(d));
                      const has = markedDates.includes(iso);
                      return has ? <div style={{ width: 6, height: 6, borderRadius: 9999, background: '#3b82f6', margin: '2px auto 0' }} /> : null;
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    {dateHasNote && <span title="Existing note" style={{ width: 8, height: 8, borderRadius: 9999, background: '#3b82f6', display: 'inline-block' }} />}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 12, background: '#eef2ff', color: '#3730a3', padding: '6px 12px', borderRadius: 9999 }}>
                  Selected Date: {labelFromYMD(date)}
                </span>
              </div>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 10 }}>
            <label>Attendance</label>
            <select value={attendance ? 'present' : 'absent'} onChange={(e) => setAttendance(e.target.value === 'present')}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          <div className="form-group" style={{ marginTop: 10 }}>
            <label>Notes</label>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#fafafa' }}>
              <textarea rows="5" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Daily notes..." style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions" style={{ marginTop: 12 }}>
            <button className="cancel-btn" type="button" onClick={onClose}>Cancel</button>
            <button className="submit-btn" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherDailyReportModal;


