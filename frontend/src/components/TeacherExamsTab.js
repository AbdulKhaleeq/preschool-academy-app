import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  UserIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge } from './ui';
import toast from 'react-hot-toast';

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
      toast.error('Please enter a comment before saving');
      return;
    }
    setLoading(true);
    try {
      await api.put('/exams/feedback', { student_id: studentId, exam_type: examType, comments: value.trim() });
      setEditing(false);
      toast.success('Comment saved successfully');
    } catch (error) {
      toast.error('Failed to save comment');
    } finally { 
      setLoading(false); 
    }
  };

  if (!editing && (value && value.trim())) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300 block mb-1">
              Teacher Comment:
            </span>
            <p className="text-sm text-blue-800 dark:text-blue-200">{value}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="shrink-0"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea 
        rows="3" 
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
        placeholder="Add comments or feedback for this exam..."
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
      />
      <div className="flex justify-end gap-2">
        {value && value.trim() && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          disabled={loading || !value?.trim()}
          onClick={save}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

const ModernModal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const TeacherExamsTab = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [existingByStudent, setExistingByStudent] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedStudents, setExpandedStudents] = useState(new Set());
  const [expandedExams, setExpandedExams] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/students/teacher/${encodeURIComponent(user.name || user.username)}`);
        if (data.success) {
          setStudents(data.students || []);
        }
        
        // fetch existing results per student
        const existing = {};
        for (const s of (data.students || [])) {
          try {
            const r = await api.get(`/exams/${s.id}`);
            existing[s.id] = r.data.results || [];
          } catch {}
        }
        setExistingByStudent(existing);
      } catch (error) {
        toast.error('Failed to load students');
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, [user]);

  const [modalState, setModalState] = useState({ 
    open: false, 
    studentId: null, 
    examType: '', 
    editId: null, 
    subject: '', 
    marks: '', 
    total: '' 
  });

  const toggleStudent = (studentId) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const toggleExam = (examKey) => {
    const newExpanded = new Set(expandedExams);
    if (newExpanded.has(examKey)) {
      newExpanded.delete(examKey);
    } else {
      newExpanded.add(examKey);
    }
    setExpandedExams(newExpanded);
  };

  const openAddModal = (studentId, examType) => {
    setModalState({ 
      open: true, 
      studentId, 
      examType, 
      editId: null, 
      subject: '', 
      marks: '', 
      total: '' 
    });
  };

  const openEditModal = (row) => {
    setModalState({ 
      open: true, 
      studentId: row.student_id, 
      examType: row.exam_type, 
      editId: row.id, 
      subject: row.subject || '', 
      marks: row.marks || '', 
      total: row.total || '' 
    });
  };

  const closeModal = () => setModalState(prev => ({ ...prev, open: false }));

  const allValid = () => {
    const { subject, marks, total } = modalState;
    return !!(subject && subject.trim() && marks !== '' && total !== '');
  };

  const saveModal = async () => {
    const { studentId, examType, editId, subject, marks, total } = modalState;
    if (!allValid()) return;
    
    try {
      if (editId) {
        await api.put(`/exams/${editId}`, { 
          subject: subject.trim(), 
          marks: Number(marks), 
          total: Number(total) 
        });
        toast.success('Subject updated successfully');
      } else {
        await api.post('/exams', { 
          student_id: studentId, 
          exam_type: examType, 
          subject: subject.trim(), 
          marks: Number(marks), 
          total: Number(total) 
        });
        toast.success('Subject added successfully');
      }
      
      const r = await api.get(`/exams/${studentId}`);
      setExistingByStudent(prev => ({ ...prev, [studentId]: r.data.results || [] }));
      closeModal();
    } catch (error) {
      toast.error('Failed to save subject');
    }
  };

  const handleDelete = async (id, studentId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await api.delete(`/exams/${id}`);
      const r = await api.get(`/exams/${studentId}`);
      setExistingByStudent(prev => ({ ...prev, [studentId]: r.data.results || [] }));
      toast.success('Subject deleted successfully');
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading students...</span>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No students found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No students are assigned to your classes yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Student Exams
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage exam results and feedback for your students
          </p>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {students.map(student => {
          const isStudentExpanded = expandedStudents.has(student.id);
          const totalResults = existingByStudent[student.id]?.length || 0;
          
          return (
            <Card key={student.id} className="overflow-hidden">
              {/* Student Header */}
              <button
                onClick={() => toggleStudent(student.id)}
                className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {student.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {totalResults > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {totalResults} subjects
                      </span>
                    )}
                    {isStudentExpanded ? (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Student Exams */}
              <AnimatePresence>
                {isStudentExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-4 space-y-3">
                      {examTypes.map(examType => {
                        const examKey = `${student.id}-${examType}`;
                        const isExamExpanded = expandedExams.has(examKey);
                        const examResults = (existingByStudent[student.id] || []).filter(e => e.exam_type === examType);
                        
                        return (
                          <div key={examType} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                            {/* Exam Type Header */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Badge variant="outline" className="text-xs">{examType}</Badge>
                                  {examResults.length > 0 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {examResults.length} subjects
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => openAddModal(student.id, examType)}
                                    className="text-xs"
                                  >
                                    <PlusIcon className="w-3 h-3 mr-1" />
                                    Add
                                  </Button>
                                  <button
                                    onClick={() => toggleExam(examKey)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                  >
                                    {isExamExpanded ? (
                                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                    ) : (
                                      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Exam Results */}
                            <AnimatePresence>
                              {isExamExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                >
                                  <div className="p-3 space-y-3">
                                    {examResults.length > 0 ? (
                                      <>
                                        {/* Mobile-Friendly Subject Cards */}
                                        <div className="space-y-2">
                                          {examResults.map(result => {
                                            const percentage = result.total > 0 ? Math.round((result.marks / result.total) * 100) : 0;
                                            return (
                                              <div
                                                key={result.id}
                                                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3"
                                              >
                                                <div className="flex items-center justify-between mb-2">
                                                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                                    {result.subject}
                                                  </h4>
                                                  <Badge
                                                    variant={percentage >= 60 ? 'success' : percentage >= 40 ? 'warning' : 'error'}
                                                    className="text-xs"
                                                  >
                                                    {percentage}%
                                                  </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">{result.marks || 0}</span> / {result.total || 0}
                                                  </div>
                                                  <div className="flex space-x-1">
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => openEditModal(result)}
                                                      className="p-1"
                                                    >
                                                      <PencilIcon className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      className="text-red-600 hover:text-red-700 p-1"
                                                      onClick={() => handleDelete(result.id, student.id)}
                                                    >
                                                      <TrashIcon className="w-3 h-3" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Overall Summary */}
                                        {(() => {
                                          const sumMarks = examResults.reduce((acc, r) => acc + (Number(r.marks) || 0), 0);
                                          const sumTotal = examResults.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
                                          const overallPercentage = sumTotal > 0 ? Math.round((sumMarks / sumTotal) * 100) : 0;
                                          
                                          return (
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                  Overall Result:
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {sumMarks} / {sumTotal}
                                                  </span>
                                                  <Badge
                                                    variant={overallPercentage >= 60 ? 'success' : overallPercentage >= 40 ? 'warning' : 'error'}
                                                    className="text-xs"
                                                  >
                                                    {overallPercentage}%
                                                  </Badge>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })()}
                                      </>
                                    ) : (
                                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                        <BookOpenIcon className="mx-auto h-6 w-6 mb-2" />
                                        <p className="text-sm">No subjects added yet</p>
                                        <Button
                                          size="sm"
                                          onClick={() => openAddModal(student.id, examType)}
                                          className="mt-2 text-xs"
                                        >
                                          Add First Subject
                                        </Button>
                                      </div>
                                    )}

                                    {/* Comments Section */}
                                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                                      <CommentsBox studentId={student.id} examType={examType} />
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Subject Modal */}
      <ModernModal
        isOpen={modalState.open}
        onClose={closeModal}
        title={modalState.editId ? 'Edit Subject' : `Add Subject - ${modalState.examType}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Name
            </label>
            <input
              type="text"
              value={modalState.subject}
              onChange={(e) => setModalState(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter subject name"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marks Obtained
              </label>
              <input
                type="number"
                value={modalState.marks}
                onChange={(e) => setModalState(prev => ({ ...prev, marks: e.target.value }))}
                placeholder="0"
                min="0"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Marks
              </label>
              <input
                type="number"
                value={modalState.total}
                onChange={(e) => setModalState(prev => ({ ...prev, total: e.target.value }))}
                placeholder="100"
                min="1"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {!allValid() && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                Please fill in all fields to continue.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={saveModal} disabled={!allValid()}>
              {modalState.editId ? 'Update' : 'Add'} Subject
            </Button>
          </div>
        </div>
      </ModernModal>
    </div>
  );
};

export default TeacherExamsTab;
