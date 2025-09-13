import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  TrophyIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge } from './ui';
import toast from 'react-hot-toast';

const PerformancePage = ({ student, onBack }) => {
  const [results, setResults] = useState([]);
  const [feedbackByType, setFeedbackByType] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedExams, setExpandedExams] = useState(new Set()); // None expanded by default

  useEffect(() => {
    const loadPerformanceData = async () => {
      if (!student) return;
      
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
  }, [student]);

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

  const groupedResults = groupResultsByExamType();

  if (!student) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </Button>
              <div className="flex items-center space-x-3">
                <TrophyIcon className="w-8 h-8 text-yellow-300" />
                <div>
                  <h1 className="text-2xl font-bold">Performance Report</h1>
                  <p className="text-blue-100">{student.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading performance data...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
            <Button onClick={() => window.location.reload()} variant="secondary">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Exam Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className={`w-full p-6 text-left transition-colors ${
                        isExpanded 
                          ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                              {examType}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              {examType}
                            </h3>
                            {hasResults && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {examResults.length} subject{examResults.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {hasResults ? (
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {totalMarks} / {totalPossible}
                              </div>
                              <div className="text-sm text-blue-600 font-semibold">
                                {percentage}%
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              No results
                            </div>
                          )}
                          {isExpanded ? (
                            <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                          ) : (
                            <ChevronRightIcon className="w-6 h-6 text-gray-400" />
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
                          <div className="p-6 space-y-4">
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
        )}
      </div>
    </div>
  );
};

export default PerformancePage;
