import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AcademicCapIcon, 
  TrophyIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge } from './ui';
import toast from 'react-hot-toast';

const StudentPerformanceModal = ({ isOpen, onClose, student }) => {
  const [results, setResults] = useState([]);
  const [feedbackByType, setFeedbackByType] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedExams, setExpandedExams] = useState(new Set(['FA-1'])); // Auto-expand FA-1

  useEffect(() => {
    const loadPerformanceData = async () => {
      if (!student || !isOpen) return;
      
      setLoading(true);
      setError('');
      
      try {
        const { data } = await api.get(`/exams/${student.id}`);
        
        if (data.success) {
          // Convert field names to match expected format
          const normalizedResults = (data.results || []).map(result => ({
            ...result,
            marks_obtained: result.marks_obtained || result.marks,
            total_marks: result.total_marks || result.total,
            subject: result.subject || 'Unknown Subject',
            exam_type: result.exam_type || 'Other',
            comments: result.comments || result.teacher_comments || result.feedback || ''
          }));
          setResults(normalizedResults);
          
          // Fetch comments for each exam type
          const examTypes = ['FA-1', 'SA-1', 'FA-2', 'SA-2'];
          const feedbackPromises = examTypes.map(async (type) => {
            try {
              const res = await api.get(
                `/exams/feedback/${student.id}/${encodeURIComponent(type)}`
              );
              return [type, res.data?.feedback?.comments || ''];
            } catch {
              return [type, ''];
            }
          });
          
          const feedbackEntries = await Promise.all(feedbackPromises);
          setFeedbackByType(Object.fromEntries(feedbackEntries));
        } else {
          setError('Failed to load performance data');
        }
      } catch (err) {
        console.error('Error loading performance:', err);
        setError('Server error. Please try again.');
        toast.error('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceData();
  }, [student, isOpen]);

  const toggleExamType = (examType) => {
    const newExpanded = new Set(expandedExams);
    if (newExpanded.has(examType)) {
      newExpanded.delete(examType);
    } else {
      newExpanded.add(examType);
    }
    setExpandedExams(newExpanded);
  };

  const getGradeColor = (marks, total) => {
    if (!total) return 'gray';
    const percentage = (marks / total) * 100;
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    if (percentage >= 60) return 'secondary';
    return 'error';
  };

  const calculateOverallPerformance = () => {
    if (results.length === 0) return null;
    
    const totalMarks = results.reduce((sum, result) => sum + (result.marks_obtained || 0), 0);
    const totalPossible = results.reduce((sum, result) => sum + (result.total_marks || 0), 0);
    
    if (totalPossible === 0) return null;
    
    return {
      percentage: ((totalMarks / totalPossible) * 100).toFixed(1),
      totalMarks,
      totalPossible,
      averageScore: (totalMarks / results.length).toFixed(1)
    };
  };

  const groupResultsByExamType = () => {
    const examTypes = ['FA-1', 'SA-1', 'FA-2', 'SA-2'];
    const grouped = {};
    
    // Initialize all exam types
    examTypes.forEach(type => {
      grouped[type] = [];
    });
    
    // Group results by exam type
    results.forEach(result => {
      const type = result.exam_type || 'Other';
      if (grouped[type]) {
        grouped[type].push(result);
      }
    });
    
    return grouped;
  };

  const overall = calculateOverallPerformance();
  const groupedResults = groupResultsByExamType();

  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
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
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center space-x-3">
              <TrophyIcon className="w-8 h-8 text-yellow-300" />
              <div>
                <h3 className="text-xl font-semibold">Performance Report</h3>
                <p className="text-blue-100">{student.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-300 bg-red-500 hover:bg-red-600 rounded-full p-2 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading performance data...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="secondary">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Exam Results by Type - Parent Dashboard Style */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="h-5 w-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Exam Results
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(groupedResults).map(([examType, examResults]) => {
                      const isExpanded = expandedExams.has(examType);
                      const hasResults = examResults.length > 0;
                      const totalMarks = examResults.reduce((sum, r) => sum + (parseInt(r.marks_obtained) || 0), 0);
                      const totalPossible = examResults.reduce((sum, r) => sum + (parseInt(r.total_marks) || 0), 0);
                      const percentage = totalPossible > 0 ? Math.round((totalMarks / totalPossible) * 100) : 0;
                      
                      return (
                        <Card key={examType} className="overflow-hidden">
                          {/* Exam Type Header */}
                          <button
                            onClick={() => toggleExamType(examType)}
                            className={`w-full p-4 text-left transition-colors ${
                              isExpanded 
                                ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                  <span className="text-primary-600 dark:text-primary-400 font-semibold text-xs">
                                    {examType}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {examType}
                                  </h4>
                                  {hasResults && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {examResults.length} subject{examResults.length !== 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                {hasResults ? (
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      Total: {totalMarks} / {totalPossible} ({percentage}%)
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Total: 0 / 0
                                  </div>
                                )}
                                {isExpanded ? (
                                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </button>

                          {/* Exam Details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-200 dark:border-gray-700"
                              >
                                <div className="p-4 space-y-4">
                                  {hasResults ? (
                                    <>
                                      {/* Subject Results */}
                                      <div className="space-y-3">
                                        {examResults.map((result, idx) => (
                                          <div
                                            key={`${result.id}-${idx}`}
                                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2"
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex-1">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                  {result.subject || 'Subject'}
                                                </div>
                                                {result.exam_date && (
                                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(result.exam_date).toLocaleDateString()}
                                                  </div>
                                                )}
                                              </div>
                                              
                                              <div className="text-right">
                                                <div className="flex items-center space-x-2">
                                                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {parseInt(result.marks_obtained) || 0}/{parseInt(result.total_marks) || 0}
                                                  </span>
                                                  <Badge
                                                    variant={getGradeColor(result.marks_obtained, result.total_marks)}
                                                    className="text-xs"
                                                  >
                                                    {result.total_marks 
                                                      ? `${Math.round(((parseInt(result.marks_obtained) || 0) / (parseInt(result.total_marks) || 1)) * 100)}%`
                                                      : 'N/A'
                                                    }
                                                  </Badge>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Individual Subject Comment */}
                                            {result.comments && result.comments.trim() && (
                                              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 border-l-4 border-blue-400">
                                                <div className="flex items-start space-x-2">
                                                  <DocumentTextIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                  <div>
                                                    <div className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                                                      Teacher's Comment
                                                    </div>
                                                    <p className="text-sm text-blue-700 dark:text-blue-200">
                                                      {result.comments}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-center py-6">
                                      <BookOpenIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No results available for {examType}
                                      </p>
                                    </div>
                                  )}

                                  {/* Teacher Feedback */}
                                  {feedbackByType[examType] && (
                                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                                          <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                            Teacher Feedback
                                          </span>
                                        </div>
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                          {feedbackByType[examType]}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentPerformanceModal;
