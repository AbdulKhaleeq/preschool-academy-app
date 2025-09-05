import React, { useEffect, useState } from 'react';
import api from '../api';

const EditStudentModal = ({ isOpen, onClose, student, onSaved }) => {
  const [form, setForm] = useState({ ...student });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({ ...student });
      api.get('/teachers').then(r => setTeachers(r.data.teachers || [])).catch(() => {});
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        age: form.age,
        parent_phone: form.parent_phone,
        father_phone: form.father_phone,
        teacher_name: form.teacher_name,
        class_name: form.class_name,
        date_of_birth: form.date_of_birth,
        emergency_contact: form.emergency_contact,
        medical_notes: form.medical_notes,
        program: form.program,
        notes: form.notes
      };
      const { data } = await api.put(`/students-update/${student.id}`, payload);
      if (data.success) onSaved?.(data.student);
      else setError(data.message || 'Failed to update');
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
          <h3>Edit Student</h3>
          <button className="close-btn" type="button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="teacher-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Class</label>
              <input name="class_name" value={form.class_name || ''} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Teacher</label>
              <select name="teacher_name" value={form.teacher_name || ''} onChange={handleChange} required>
                <option value="">Select</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Program</label>
              <select name="program" value={form.program || ''} onChange={handleChange}>
                <option value="">Select</option>
                <option value="School">School</option>
                <option value="Tuition">Tuition</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mother Phone</label>
              <input name="parent_phone" value={form.parent_phone || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Father Phone</label>
              <input name="father_phone" value={form.father_phone || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>DOB</label>
              <input type="date" name="date_of_birth" value={form.date_of_birth ? String(form.date_of_birth).slice(0,10) : ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Emergency</label>
              <input name="emergency_contact" value={form.emergency_contact || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Medical Notes</label>
            <textarea name="medical_notes" value={form.medical_notes || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={form.notes || ''} onChange={handleChange} />
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

export default EditStudentModal;


