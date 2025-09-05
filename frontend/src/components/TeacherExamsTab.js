import React, { useEffect, useState } from 'react';
import api from '../api';

const examTypes = ['FA-1','SA-1','FA-2','SA-2'];

const TeacherExamsTab = ({ teacherName }) => {
  const [students, setStudents] = useState([]);
  const [subjectsByStudent, setSubjectsByStudent] = useState({});
  const [existingByStudent, setExistingByStudent] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/students/teacher/${encodeURIComponent(teacherName)}`);
        if (data.success) setStudents(data.students || []);
        // fetch existing results per student
        const existing = {};
        for (const s of (data.students || [])) {
          try {
            const r = await api.get(`/exams/${s.id}`);
            existing[s.id] = r.data.results || [];
          } catch {}
        }
        setExistingByStudent(existing);
      } finally { setLoading(false); }
    };
    load();
  }, [teacherName]);

  const addSubjectRow = (studentId, examType) => {
    setSubjectsByStudent(prev => {
      const key = `${studentId}:${examType}`;
      const rows = prev[key] || [{ subject: '', marks: '', total: '' }];
      return { ...prev, [key]: [...rows, { subject: '', marks: '', total: '' }] };
    });
  };

  const updateRow = (studentId, examType, idx, field, value) => {
    setSubjectsByStudent(prev => {
      const key = `${studentId}:${examType}`;
      const rows = [...(prev[key] || [{ subject: '', marks: '', total: '' }])];
      rows[idx] = { ...rows[idx], [field]: value };
      return { ...prev, [key]: rows };
    });
  };

  const saveRows = async (studentId, examType) => {
    const key = `${studentId}:${examType}`;
    const rows = subjectsByStudent[key] || [];
    for (const r of rows) {
      if (!r.subject) continue;
      await api.post('/exams', { student_id: studentId, exam_type: examType, subject: r.subject, marks: Number(r.marks) || null, total: Number(r.total) || null });
    }
    // refresh existing results
    const r = await api.get(`/exams/${studentId}`);
    setExistingByStudent(prev => ({ ...prev, [studentId]: r.data.results || [] }));
  };

  const handleUpdate = async (id, patch) => {
    await api.put(`/exams/${id}`, patch);
  };

  const handleDelete = async (id, studentId) => {
    await api.delete(`/exams/${id}`);
    const r = await api.get(`/exams/${studentId}`);
    setExistingByStudent(prev => ({ ...prev, [studentId]: r.data.results || [] }));
  };

  return (
    <div>
      {loading && <p>Loading students...</p>}
      {students.map(s => (
        <details key={s.id} className="student-card admin-card" style={{ marginBottom: 16 }}>
          <summary><strong>{s.name}</strong></summary>
          {examTypes.map(type => (
            <div key={type} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10 }}>
              <div className="section-header">
                <h4>{type}</h4>
                <div>
                  <button className="add-btn" onClick={() => addSubjectRow(s.id, type)}>+ Subject</button>
                  <button className="action-btn" style={{ marginLeft: 8 }} onClick={() => saveRows(s.id, type)}>Save</button>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                {(subjectsByStudent[`${s.id}:${type}`] || [{ subject: '', marks: '', total: '' }]).map((row, idx) => (
                  <div key={idx} className="form-row">
                    <div className="form-group"><label>Subject</label><input value={row.subject} onChange={(e) => updateRow(s.id, type, idx, 'subject', e.target.value)} /></div>
                    <div className="form-group"><label>Marks</label><input type="number" value={row.marks} onChange={(e) => updateRow(s.id, type, idx, 'marks', e.target.value)} /></div>
                    <div className="form-group"><label>Total</label><input type="number" value={row.total} onChange={(e) => updateRow(s.id, type, idx, 'total', e.target.value)} /></div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 6 }}>Subject</th>
                      <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 6 }}>Marks</th>
                      <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 6 }}>Total</th>
                      <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 6 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(existingByStudent[s.id] || []).filter(e => e.exam_type === type).map(e => (
                      <tr key={e.id}>
                        <td style={{ padding: 6 }}>
                          <input defaultValue={e.subject} onBlur={(ev) => handleUpdate(e.id, { subject: ev.target.value })} />
                        </td>
                        <td style={{ padding: 6, textAlign: 'right' }}>
                          <input type="number" defaultValue={e.marks || ''} onBlur={(ev) => handleUpdate(e.id, { marks: Number(ev.target.value) || null })} />
                        </td>
                        <td style={{ padding: 6, textAlign: 'right' }}>
                          <input type="number" defaultValue={e.total || ''} onBlur={(ev) => handleUpdate(e.id, { total: Number(ev.target.value) || null })} />
                        </td>
                        <td style={{ padding: 6, textAlign: 'right' }}>
                          <button className="action-btn delete-btn" onClick={() => handleDelete(e.id, s.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {((existingByStudent[s.id] || []).filter(e => e.exam_type === type).length === 0) && (
                      <tr><td colSpan={4} style={{ padding: 6 }}>No subjects yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </details>
      ))}
    </div>
  );
};

export default TeacherExamsTab;


