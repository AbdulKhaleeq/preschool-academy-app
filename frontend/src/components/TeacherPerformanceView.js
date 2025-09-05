import React, { useEffect, useState } from 'react';
import api from '../api';

const TeacherPerformanceView = ({ teacher, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/performance/teacher/${teacher.id}`);
        if (data.success) setData(data.data);
        else setError('Failed to load performance');
      } catch (e) {
        setError('Server error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacher]);

  return (
    <div>
      <div className="section-header">
        <button className="add-btn" onClick={onBack}>← Back</button>
        <h3>📊 Performance - {teacher.name}</h3>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      {data && (
        <div>
          <div className="card-grid">
            <div className="dashboard-card">
              <h3>👶 Students</h3>
              <div className="card-number">{data.totalStudents}</div>
              <p>Assigned</p>
            </div>
            <div className="dashboard-card">
              <h3>✅ Avg Attendance</h3>
              <div className="card-number">{Math.round((data.avgAttendance || 0) * 100)}%</div>
              <p>Across reports</p>
            </div>
          </div>

          <div className="reports-grid" style={{ marginTop: 20 }}>
            <div className="report-card" style={{ overflowX: 'auto' }}>
              <h4>🎓 Exam Performance</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px' }}>Exam</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: '8px' }}>Avg Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.examsSummary || []).map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{r.exam_type}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5', textAlign: 'right' }}>{Math.round(r.avg_marks || 0)}</td>
                    </tr>
                  ))}
                  {(!data.examsSummary || data.examsSummary.length === 0) && (
                    <tr><td colSpan={2} style={{ padding: '8px' }}>No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPerformanceView;


