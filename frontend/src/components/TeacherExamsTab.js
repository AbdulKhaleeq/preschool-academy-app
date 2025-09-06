import React, { useEffect, useState } from 'react';
import api from '../api';

const examTypes = ['FA-1','SA-1','FA-2','SA-2'];

const CommentsBox = ({ studentId, examType }) => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/exams/feedback/${studentId}/${encodeURIComponent(examType)}`);
        if (data.success && data.feedback) {
          const v = data.feedback.comments || '';
          setValue(v);
          setEditing(!(v && v.trim()));
        } else {
          setEditing(true);
        }
      } catch {
        setEditing(true);
      }
    };
    load();
  }, [studentId, examType]);

  const save = async () => {
    if (!value || !value.trim()) {
      alert('Please enter a comment before saving');
      return;
    }
    setLoading(true);
    try {
      await api.put('/exams/feedback', { student_id: studentId, exam_type: examType, comments: value.trim() });
      setEditing(false);
    } finally { setLoading(false); }
  };

  if (!editing && (value && value.trim())) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#374151' }}>
          <strong>Comment:</strong> {value}
        </div>
        <button className="action-btn" onClick={() => setEditing(true)}>Edit</button>
      </div>
    );
  }

  return (
    <div>
      <textarea rows="3" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Comments/feedback" style={{ width: '100%', border: '1px solid #ddd', borderRadius: 8, padding: 8 }} />
      <div style={{ textAlign: 'right', marginTop: 6, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        {!(!value || !value.trim()) && (
          <button className="cancel-btn" type="button" onClick={() => setEditing(false)}>Cancel</button>
        )}
        <button className="submit-btn" disabled={loading} onClick={save}>{loading ? 'Saving...' : 'Save Comments'}</button>
      </div>
    </div>
  );
};

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

  const [modalState, setModalState] = useState({ open: false, studentId: null, examType: '', editId: null, subject: '', marks: '', total: '' });

  const openAddModal = (studentId, examType) => {
    setModalState({ open: true, studentId, examType, editId: null, subject: '', marks: '', total: '' });
  };

  const openEditModal = (row) => {
    setModalState({ open: true, studentId: row.student_id, examType: row.exam_type, editId: row.id, subject: row.subject || '', marks: row.marks || '', total: row.total || '' });
  };

  const closeModal = () => setModalState(prev => ({ ...prev, open: false }));

  const allValid = () => {
    const { subject, marks, total } = modalState;
    return !!(subject && subject.trim() && marks !== '' && total !== '');
  };

  const saveModal = async () => {
    const { studentId, examType, editId, subject, marks, total } = modalState;
    if (!allValid()) return;
    if (editId) {
      await api.put(`/exams/${editId}`, { subject: subject.trim(), marks: Number(marks), total: Number(total) });
    } else {
      await api.post('/exams', { student_id: studentId, exam_type: examType, subject: subject.trim(), marks: Number(marks), total: Number(total) });
    }
    const r = await api.get(`/exams/${studentId}`);
    setExistingByStudent(prev => ({ ...prev, [studentId]: r.data.results || [] }));
    closeModal();
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
          <div style={{ marginTop: 8 }}>
            {examTypes.map(type => (
              <details key={type} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <summary style={{ cursor: 'pointer' }}>
                  <div className="section-header" style={{ marginBottom: 0 }}>
                    <h4 style={{ margin: 0 }}>{type}</h4>
                    <div>
                      <button className="add-btn" onClick={(e) => { e.preventDefault(); openAddModal(s.id, type); }}>+ Subject</button>
                    </div>
                  </div>
                </summary>
                <div style={{ marginTop: 10 }}>
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
                            <td style={{ padding: 6 }}>{e.subject}</td>
                            <td style={{ padding: 6, textAlign: 'right' }}>{e.marks ?? '-'}</td>
                            <td style={{ padding: 6, textAlign: 'right' }}>{e.total ?? '-'}</td>
                            <td style={{ padding: 6, textAlign: 'right' }}>
                              <button className="action-btn" onClick={() => openEditModal(e)} style={{ marginRight: 6 }}>Edit</button>
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

                  {(() => {
                    const rows = (existingByStudent[s.id] || []).filter(e => e.exam_type === type);
                    const sumMarks = rows.reduce((acc, r) => acc + (Number(r.marks) || 0), 0);
                    const sumTotal = rows.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
                    const percentage = sumTotal > 0 ? Math.round((sumMarks / sumTotal) * 1000) / 10 : 0;
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <div style={{ color: '#374151' }}>
                          <strong>Total:</strong> {sumMarks} / {sumTotal} {sumTotal > 0 ? `(${percentage}%)` : ''}
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ marginTop: 10 }}>
                    <label style={{ display: 'block', fontSize: 14, color: '#374151', marginBottom: 6 }}>Teacher Comments</label>
                    <CommentsBox studentId={s.id} examType={type} />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </details>
      ))}

      {modalState.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalState.editId ? 'Edit Subject' : 'Add Subject'}</h3>
              <button className="close-btn" type="button" onClick={closeModal}>×</button>
            </div>
            <div className="teacher-form">
              <div className="form-row">
                <div className="form-group"><label>Subject</label><input value={modalState.subject} onChange={(e) => setModalState(prev => ({ ...prev, subject: e.target.value }))} placeholder="Subject name" /></div>
                <div className="form-group"><label>Marks</label><input type="number" value={modalState.marks} onChange={(e) => setModalState(prev => ({ ...prev, marks: e.target.value }))} placeholder="Marks scored" /></div>
                <div className="form-group"><label>Total</label><input type="number" value={modalState.total} onChange={(e) => setModalState(prev => ({ ...prev, total: e.target.value }))} placeholder="Total marks" /></div>
              </div>
              {!allValid() && (
                <div className="error-message" style={{ marginTop: 8 }}>Please fill all fields before saving.</div>
              )}
              <div className="modal-actions">
                <button className="cancel-btn" type="button" onClick={closeModal}>Cancel</button>
                <button className="submit-btn" type="button" onClick={saveModal} disabled={!allValid()}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherExamsTab;


