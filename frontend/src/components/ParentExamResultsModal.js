import React, { useEffect, useState } from 'react';
import api from '../api';

const ParentExamResultsModal = ({ isOpen, onClose, student, results = [] }) => {
  const [localResults, setLocalResults] = useState(results || []);
  const [feedbackByType, setFeedbackByType] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!student || !isOpen) return;
      try {
        setLoading(true);
        setError('');
        // Always fetch fresh in case parent view was opened before teacher saved
        const { data } = await api.get(`/exams/${student.id}`);
        if (data.success) {
          setLocalResults(data.results || []);
          const types = ['FA-1','SA-1','FA-2','SA-2'];
          const fbEntries = await Promise.all(
            types.map(async (t) => {
              try {
                const res = await api.get(`/exams/feedback/${student.id}/${encodeURIComponent(t)}`);
                return [t, res.data?.feedback?.comments || ''];
              } catch { return [t, '']; }
            })
          );
          setFeedbackByType(Object.fromEntries(fbEntries));
        } else {
          setError('Failed to load results');
        }
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
          <h3>Exam Results - {student.name}</h3>
          <button className="close-btn" type="button" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: 16, overflowX: 'auto' }}>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && (
            <div>
              {['FA-1','SA-1','FA-2','SA-2'].map(type => {
                const rows = localResults.filter(r => r.exam_type === type);
                const sumMarks = rows.reduce((a, r) => a + (Number(r.marks) || 0), 0);
                const sumTotal = rows.reduce((a, r) => a + (Number(r.total) || 0), 0);
                const percentage = sumTotal > 0 ? Math.round((sumMarks / sumTotal) * 1000) / 10 : 0;
                return (
                  <details key={type} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                    <summary style={{ cursor: 'pointer' }}>
                      <div className="section-header" style={{ marginBottom: 0 }}>
                        <h4 style={{ margin: 0 }}>{type}</h4>
                        <div style={{ color: '#374151' }}>
                          <strong>Total:</strong> {sumMarks} / {sumTotal} {sumTotal > 0 ? `(${percentage}%)` : ''}
                        </div>
                      </div>
                    </summary>
                    <div style={{ marginTop: 10 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 6 }}>Subject</th>
                            <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 6 }}>Marks</th>
                            <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 6 }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(r => (
                            <tr key={r.id}>
                              <td style={{ padding: 6 }}>{r.subject}</td>
                              <td style={{ padding: 6, textAlign: 'right' }}>{r.marks ?? '-'}</td>
                              <td style={{ padding: 6, textAlign: 'right' }}>{r.total ?? '-'}</td>
                            </tr>
                          ))}
                          {rows.length === 0 && (
                            <tr><td colSpan={3} style={{ padding: 6 }}>No subjects yet</td></tr>
                          )}
                        </tbody>
                      </table>
                      {feedbackByType[type] && (
                        <div style={{ marginTop: 10, color: '#374151' }}>
                          <strong>Comment:</strong> {feedbackByType[type]}
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentExamResultsModal;


