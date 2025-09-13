import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { Card, Button, LoadingCard, Badge } from './ui';
import { 
  ChartBarIcon,
  EyeIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const TeacherStudentsView = ({ user, onPerformanceClick, onReportsClick, onBack, isAdmin = false }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all students and filter by teacher name
      const response = await api.get('/students');
      if (response.data && response.data.success) {
        const allStudents = response.data.students || [];
        // Filter students assigned to this specific teacher
        const teacherStudents = allStudents.filter(student => 
          student.teacher_name === user.name
        );
        setStudents(teacherStudents);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProgress = (student) => {
    if (onPerformanceClick) {
      onPerformanceClick(student);
    }
  };

  const handleViewReports = (student) => {
    if (onReportsClick) {
      onReportsClick(student);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - only show in admin mode */}
      {isAdmin && (
        <div className="flex items-center space-x-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Students - {user?.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage students assigned to this teacher
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <div className="text-red-500 dark:text-red-400 font-medium">{error}</div>
        </div>
      )}

      {/* Students content */}
      {!loading && !error && (
        <div className="space-y-4">
          {students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {student.name}
                      </h4>
                      <Badge variant="primary">{student.age} years</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <p><span className="font-medium">Parent:</span> {student.parent_phone}</p>
                      <p><span className="font-medium">Class:</span> {student.class_name}</p>
                      <p><span className="font-medium">Program:</span> {student.program}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewProgress(student)}>
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        Performance
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleViewReports(student)}>
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Reports
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No students assigned
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {isAdmin 
                  ? `No students have been assigned to ${user?.name} yet.`
                  : "No students have been assigned to you yet. Contact your administrator for assistance."
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherStudentsView;