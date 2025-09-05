import React from 'react';

const ParentExamResultsModal = ({ isOpen, onClose, student, results = [] }) => {
  if (!isOpen || !student) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Exam Results - {student.name}</h3>
          <button className="close-btn" type="button" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Exam</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Subject</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 8 }}>Marks</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 8 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: 8 }}>{r.exam_type}</td>
                  <td style={{ padding: 8 }}>{r.subject}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{r.marks ?? '-'}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{r.total ?? '-'}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 8 }}>No results yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentExamResultsModal;


