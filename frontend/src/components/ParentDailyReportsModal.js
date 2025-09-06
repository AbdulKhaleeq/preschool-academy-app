import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
// Calendar UI: remember to install dependency in frontend: npm install react-calendar
// Fallback: if Calendar fails to load, component will still render other parts
let Calendar = null;
try {
  // eslint-disable-next-line global-require
  Calendar = require('react-calendar').default;
} catch {}

const ParentDailyReportsModal = ({ isOpen, onClose, student }) => {
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
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => formatYMD(new Date()));
  const [selectedReport, setSelectedReport] = useState(null);
  const [markedDates, setMarkedDates] = useState([]);

  const dateHasNote = useMemo(() => markedDates.includes(selectedDate), [markedDates, selectedDate]);

  useEffect(() => {
    const load = async () => {
      if (!student || !isOpen) return;
      try {
        setLoading(true);
        setError('');
        const [allRes, datesRes] = await Promise.all([
          api.get(`/daily-reports/${student.id}`),
          api.get(`/daily-reports/${student.id}/dates-with-notes`)
        ]);
        if (allRes.data?.success) setReports(allRes.data.reports || []);
        else setError('Failed to load reports');
        if (datesRes.data?.success) {
          const d = (datesRes.data.dates || []).map(iso => formatYMD(new Date(iso)));
          setMarkedDates(d);
        }
      } catch (e) {
        setError('Server error');
      } finally { setLoading(false); }
    };
    load();
  }, [student, isOpen]);

  useEffect(() => {
    const fetchByDate = async () => {
      if (!student || !selectedDate) { setSelectedReport(null); return; }
      try {
        const { data } = await api.get(`/daily-reports/${student.id}/by-date/${selectedDate}`);
        if (data.success) setSelectedReport(data.report || null);
      } catch {
        setSelectedReport(null);
      }
    };
    fetchByDate();
  }, [student, selectedDate]);

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
            <>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fff' }}>
                  {Calendar ? (
                    <Calendar
                      value={new Date(selectedDate.split('-')[0], Number(selectedDate.split('-')[1]) - 1, Number(selectedDate.split('-')[2]))}
                      onChange={(d) => setSelectedDate(formatYMD(new Date(d)))}
                      tileContent={({ date }) => {
                        const iso = formatYMD(new Date(date));
                        const has = markedDates.includes(iso);
                        return has ? <div style={{ width: 6, height: 6, borderRadius: 9999, background: '#3b82f6', margin: '2px auto 0' }} /> : null;
                      }}
                    />
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Select date</label>
                      <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: 12, background: '#eef2ff', color: '#3730a3', padding: '6px 12px', borderRadius: 9999 }}>
                    Selected Date: {labelFromYMD(selectedDate)}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fafafa' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Attendance</div>
                    <div>{selectedReport ? (selectedReport.attendance ? 'Present' : 'Absent') : 'No data'}</div>
                  </div>

                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fafafa' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Notes</div>
                    <div style={{ lineHeight: 1.6 }}>{selectedReport && selectedReport.notes ? selectedReport.notes : 'No notes added yet.'}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDailyReportsModal;


