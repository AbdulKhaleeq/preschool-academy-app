import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Badge } from './ui';
import api from '../api';
import toast from 'react-hot-toast';

const StudentReportsModal = ({ isOpen, onClose, student, isTeacher = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [notesData, setNotesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState('present');
  const [selectedNote, setSelectedNote] = useState('');
  const [showAttendanceDropdown, setShowAttendanceDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    if (isOpen && student) {
      loadData();
    }
  }, [isOpen, student, currentDate]);

  const loadData = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      // Load all daily reports for the student
      const response = await api.get(`/daily-reports/${student.id}`);
      console.log('Reports API Response:', response.data); // Debug log
      
      if (response.data && response.data.success) {
        const reports = response.data.reports || [];
        console.log('Fetched reports:', reports); // Debug log
        
        // Process reports into attendance and notes data
        const attendanceMap = {};
        const notesMap = {};
        
        reports.forEach(report => {
          // Normalize date key - handle both date strings and datetime strings
          let dateKey;
          if (report.report_date) {
            // If it's already a date string like "2025-09-08", use it directly
            if (report.report_date.includes('T')) {
              // If it contains time, extract just the date part
              dateKey = report.report_date.split('T')[0];
            } else {
              dateKey = report.report_date;
            }
          } else {
            // Fallback to created_at
            dateKey = formatDate(new Date(report.created_at));
          }
          
          console.log('Processing report for date:', dateKey, 'attendance:', report.attendance, 'notes:', report.notes); // Debug
          
          // Handle attendance - it might be boolean or string
          if (typeof report.attendance === 'boolean') {
            attendanceMap[dateKey] = report.attendance;
          } else if (typeof report.attendance === 'string') {
            attendanceMap[dateKey] = report.attendance === 'true' || report.attendance === 'present';
          } else if (report.attendance === 1 || report.attendance === '1') {
            attendanceMap[dateKey] = true;
          } else if (report.attendance === 0 || report.attendance === '0') {
            attendanceMap[dateKey] = false;
          }
          
          if (report.notes && report.notes.trim()) {
            notesMap[dateKey] = report.notes;
          }
        });
        
        console.log('Processed attendance data:', attendanceMap); // Debug log
        console.log('Processed notes data:', notesMap); // Debug log
        
        setAttendanceData(attendanceMap);
        setNotesData(notesMap);
      } else {
        console.log('API returned no reports or error:', response.data);
      }
    } catch (error) {
      console.error('Error loading reports data:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (!selectedDate || !isTeacher) return;
    
    setSaving(true);
    try {
      const dateKey = formatDate(selectedDate);
      
      const reportData = {
        student_id: student.id,
        report_date: dateKey,
        attendance: selectedAttendance === 'present',
        notes: selectedNote.trim()
      };
      
      console.log('Saving report data:', reportData); // Debug log
      
      const response = await api.post('/daily-reports', reportData);
      
      console.log('Save response:', response.data); // Debug log
      
      if (response.data && response.data.success) {
        // Update local data
        setAttendanceData(prev => ({
          ...prev,
          [dateKey]: selectedAttendance === 'present'
        }));
        
        if (selectedNote.trim()) {
          setNotesData(prev => ({
            ...prev,
            [dateKey]: selectedNote.trim()
          }));
        } else {
          // Remove note if empty
          setNotesData(prev => {
            const newNotes = { ...prev };
            delete newNotes[dateKey];
            return newNotes;
          });
        }
        
        console.log('Updated attendance data:', attendanceData); // Debug log
        console.log('Updated notes data:', notesData); // Debug log
        
        toast.success('Report saved successfully');
      } else {
        console.error('Save failed - server response:', response.data);
        toast.error('Failed to save report - server error');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to save report - connection error');
    } finally {
      setSaving(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getDataForDate = (date) => {
    if (!date) return { attendance: null, hasNote: false, note: '' };
    const dateKey = formatDate(date);
    console.log('Getting data for date:', dateKey); // Debug
    console.log('Available attendance keys:', Object.keys(attendanceData)); // Debug
    console.log('Available notes keys:', Object.keys(notesData)); // Debug
    
    const data = {
      attendance: attendanceData[dateKey],
      hasNote: !!notesData[dateKey],
      note: notesData[dateKey] || ''
    };
    
    console.log('Retrieved data:', data); // Debug
    return data;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const data = getDataForDate(date);
    console.log('Selected date data:', data); // Debug log
    
    // Set attendance dropdown value
    if (data.attendance === true) {
      setSelectedAttendance('present');
    } else if (data.attendance === false) {
      setSelectedAttendance('absent');
    } else {
      setSelectedAttendance('present'); // Default to present if no data
    }
    
    setSelectedNote(data.note || '');
    setShowAttendanceDropdown(false);
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const days = getDaysInMonth(currentDate);

  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: "100%", scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: "100%", scale: 0.95 }}
          className="relative bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {isTeacher ? 'Student Reports' : 'Reports'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{student.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading reports...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar Section */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                      </h3>
                      <select
                        value={currentDate.getFullYear()}
                        onChange={(e) => {
                          const newDate = new Date(currentDate);
                          newDate.setFullYear(parseInt(e.target.value));
                          setCurrentDate(newDate);
                          setSelectedDate(null);
                        }}
                        className="text-base font-medium bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 cursor-pointer"
                      >
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() - 5 + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div
                        key={index}
                        className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((date, index) => {
                      if (!date) {
                        return <div key={index} className="aspect-square" />;
                      }

                      const { attendance, hasNote } = getDataForDate(date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                      
                      let bgColor = 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100';
                      if (attendance === true) {
                        bgColor = 'bg-blue-500 text-white';
                      } else if (attendance === false) {
                        bgColor = 'bg-red-500 text-white';
                      }
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(date)}
                          className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg border-2 transition-all duration-200 relative ${
                            isSelected
                              ? 'border-primary-500 ring-2 ring-primary-200'
                              : isToday
                              ? 'border-primary-300'
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          } ${bgColor}`}
                        >
                          <span className="font-medium">{date.getDate()}</span>
                          {hasNote && (
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center space-x-6 mt-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Present</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Absent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Has Notes</span>
                    </div>
                  </div>
                </Card>

                {/* Details Section */}
                <Card className="p-6">
                  {selectedDate ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {formatDisplayDate(selectedDate)}
                        </h4>
                      </div>

                      {/* Attendance Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Attendance
                        </label>
                        {isTeacher ? (
                          <div className="relative">
                            <button
                              onClick={() => setShowAttendanceDropdown(!showAttendanceDropdown)}
                              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <span className={`capitalize ${
                                selectedAttendance === 'present' ? 'text-blue-600' : 'text-red-600'
                              }`}>
                                {selectedAttendance}
                              </span>
                              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            </button>
                            
                            {showAttendanceDropdown && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                                <button
                                  onClick={() => {
                                    setSelectedAttendance('present');
                                    setShowAttendanceDropdown(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600"
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAttendance('absent');
                                    setShowAttendanceDropdown(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600"
                                >
                                  Absent
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`px-4 py-3 rounded-lg border ${
                            getDataForDate(selectedDate).attendance === true
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                              : getDataForDate(selectedDate).attendance === false
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                          }`}>
                            {getDataForDate(selectedDate).attendance === true ? 'Present' :
                             getDataForDate(selectedDate).attendance === false ? 'Absent' : 'Not marked'}
                          </div>
                        )}
                      </div>

                      {/* Notes Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        {isTeacher ? (
                          <textarea
                            value={selectedNote}
                            onChange={(e) => setSelectedNote(e.target.value)}
                            placeholder="Add notes..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[100px]">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {getDataForDate(selectedDate).note || 'No notes available'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Save Button for Teachers */}
                      {isTeacher && (
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => setSelectedDate(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveReport}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
                          >
                            {saving ? 'Saving...' : 'Save Report'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <CalendarDaysIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select a date to view or edit reports</p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentReportsModal;
