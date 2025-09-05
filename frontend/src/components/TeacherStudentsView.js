import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import TeacherDailyReportModal from './TeacherDailyReportModal';
import StudentPerformanceModal from './StudentPerformanceModal';
import './TeacherStudentsView.css';

const TeacherStudentsView = ({ teacher, onBack, isAdmin = false }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportStudent, setReportStudent] = useState(null);
  const [perfStudent, setPerfStudent] = useState(null);

  const fetchTeacherStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use teacher name to fetch students
      const { data } = await api.get(`/students/teacher/${encodeURIComponent(teacher.name)}`);
      
      if (data.success) {
        setStudents(data.students);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching teacher students:', err);
    } finally {
      setLoading(false);
    }
  }, [teacher.name]);

  useEffect(() => {
    if (teacher) {
      fetchTeacherStudents();
    }
  }, [teacher, fetchTeacherStudents]);

  const handleAddNote = (student) => {
    setReportStudent(student);
  };

  const handleViewProgress = (student) => {
    setPerfStudent(student);
  };

  const handleEditStudent = (student) => {
    // Placeholder for edit student functionality (for admin)
    alert(`Edit ${student.name} - Feature coming soon!`);
  };

  return (
    <>
    <div className="teacher-students-view">
      <div className="view-header">
        <button className="back-button" onClick={onBack}>
          ← Back to {isAdmin ? 'Teachers' : 'Overview'}
        </button>
        <div className="teacher-info">
          <h2>👶 Students of {teacher.name}</h2>
          <p>Class: {teacher.class_name} | Subject: {teacher.subject}</p>
        </div>
      </div>

      <div className="students-section">
        <div className="section-header">
          <h3>📚 Class Students ({students.length})</h3>
          {isAdmin && (
            <span className="admin-badge">Admin View</span>
          )}
        </div>

        {loading && <p>Loading students...</p>}
        
        {error && (
          <div className="error-message">
            <p style={{color: 'red'}}>Error: {error}</p>
            <button onClick={fetchTeacherStudents} className="retry-button">
              Retry
            </button>
          </div>
        )}

        <div className="students-grid">
          {students.length > 0 ? (
            students.map(student => (
              <div key={student.id} className="student-card">
                <div className="student-info">
                  <h4>{student.name}</h4>
                  <p><strong>Age:</strong> {student.age} years</p>
                  <p><strong>Parent:</strong> {student.parent_phone}</p>
                  <p><strong>Class:</strong> {student.class_name}</p>
                  <p><strong>DOB:</strong> {new Date(student.date_of_birth).toLocaleDateString()}</p>
                  <p><strong>Emergency:</strong> {student.emergency_contact}</p>
                  {student.medical_notes && (
                    <p><strong>Medical Notes:</strong> {student.medical_notes}</p>
                  )}
                </div>
                <div className="student-actions">
                  <button className="action-btn note-btn" onClick={() => handleAddNote(student)}>📄 Reports</button>
                  <button className="action-btn progress-btn" onClick={() => handleViewProgress(student)}>📊 Performance</button>
                </div>
              </div>
            ))
          ) : (
            !loading && !error && (
              <div className="no-students">
                <p>No students assigned to this teacher yet.</p>
                {isAdmin && (
                  <p>You can assign students to this teacher when adding new students.</p>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
    <TeacherDailyReportModal
      isOpen={!!reportStudent}
      student={reportStudent}
      onClose={() => setReportStudent(null)}
      onSaved={() => setReportStudent(null)}
    />
    <StudentPerformanceModal
      isOpen={!!perfStudent}
      student={perfStudent}
      onClose={() => setPerfStudent(null)}
    />
    </>
  );
};

export default TeacherStudentsView;
