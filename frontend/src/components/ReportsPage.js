import React, { useState, useEffect } from 'react';
import api, { formatDateForAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Button } from './ui';
import toast from 'react-hot-toast';

const ReportsPage = ({ student, user, onBack }) => {
  const [attendanceData, setAttendanceData] = useState({});
  const [notesData, setNotesData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAttendance, setSelectedAttendance] = useState('present');
  const [selectedNote, setSelectedNote] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  
  const isTeacher = user?.role === 'teacher';

  // Date formatting functions
  const formatDate = (date) => {
    return formatDateForAPI(date);
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    loadData();
  }, [student]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      
      const response = await api.get(`/daily-reports/${student.id}`);
      
      if (response.data && response.data.success) {
        const reports = response.data.reports || [];
        
        // Process reports into attendance and notes data
        const attendanceMap = {};
        const notesMap = {};
        
        reports.forEach(report => {
          
          // Since backend now returns report_date as YYYY-MM-DD string, use it directly
          let dateKey;
          if (report.report_date) {
            dateKey = report.report_date; // Should now be a clean YYYY-MM-DD string
          } else {
            // Fallback to created_at
            dateKey = formatDate(new Date(report.created_at));
          }
          
          
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
        
        
        setAttendanceData(attendanceMap);
        setNotesData(notesMap);
      } else {
      }
    } catch (error) {
      console.error('Error loading reports:', error);
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
      
      
      const response = await api.post('/daily-reports', reportData);
      
      
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
    
    const data = {
      attendance: attendanceData[dateKey],
      hasNote: !!notesData[dateKey],
      note: notesData[dateKey] || ''
    };
    
    return data;
  };

  const handleDateSelect = (date) => {
    
    setSelectedDate(date);
    const data = getDataForDate(date);
    
    // Set attendance dropdown value
    if (data.attendance === true) {
      setSelectedAttendance('present');
    } else if (data.attendance === false) {
      setSelectedAttendance('absent');
    } else {
      setSelectedAttendance('present'); // Default to present if no data
    }
    
    setSelectedNote(data.note || '');
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();

  if (!student) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
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
                <CalendarDaysIcon className="w-8 h-8 text-green-300" />
                <div>
                  <h1 className="text-2xl font-bold">Reports</h1>
                  <p className="text-green-100">{student.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Calendar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Calendar Header - Always Visible */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isCalendarExpanded ? 'Click to collapse calendar' : 'Click to expand calendar'}
                  </p>
                </div>
                {isCalendarExpanded ? (
                  <ChevronUpIcon className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {/* Mini Calendar Preview when collapsed */}
              {!isCalendarExpanded && (
                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Has Notes</span>
                  </div>
                </div>
              )}
            </div>

            {/* Expandable Calendar */}
            <AnimatePresence>
              {isCalendarExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6">
                    {/* Calendar Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      
                      <select
                        value={currentMonth.getFullYear()}
                        onChange={(e) => {
                          const newMonth = new Date(currentMonth);
                          newMonth.setFullYear(parseInt(e.target.value));
                          setCurrentMonth(newMonth);
                        }}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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

                      <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {/* Day headers */}
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <div key={index} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar days */}
                      {days.map((day, index) => {
                        if (!day) {
                          return <div key={index} className="p-2"></div>;
                        }
                        
                        const data = getDataForDate(day);
                        const isToday = day.toDateString() === today.toDateString();
                        const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                        
                        let bgColor = 'bg-white dark:bg-gray-700';
                        if (data.attendance === true) {
                          bgColor = 'bg-blue-500 text-white';
                        } else if (data.attendance === false) {
                          bgColor = 'bg-red-500 text-white';
                        }
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleDateSelect(day)}
                            className={`
                              relative p-2 text-sm rounded-lg transition-all hover:scale-105
                              ${bgColor}
                              ${isSelected ? 'ring-2 ring-green-500' : ''}
                              ${isToday ? 'font-bold' : ''}
                            `}
                          >
                            {day.getDate()}
                            {data.hasNote && (
                              <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Present</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Absent</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Has Notes</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {formatDisplayDate(selectedDate)}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attendance
                  </label>
                  {isTeacher ? (
                    <select
                      value={selectedAttendance}
                      onChange={(e) => setSelectedAttendance(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  ) : (
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                      {selectedAttendance === 'present' ? 'Present' : selectedAttendance === 'absent' ? 'Absent' : 'Not marked'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  {isTeacher ? (
                    <textarea
                      value={selectedNote}
                      onChange={(e) => setSelectedNote(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                      placeholder="Enter notes for this day..."
                    />
                  ) : (
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 min-h-[80px]">
                      {selectedNote || 'No notes available'}
                    </div>
                  )}
                </div>

                {isTeacher && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={saveReport}
                      loading={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save Report
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedAttendance('present');
                        setSelectedNote('');
                      }}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Reset
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
