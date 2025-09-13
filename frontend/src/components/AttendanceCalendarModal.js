import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge } from './ui';
import api from '../api';
import toast from 'react-hot-toast';

const AttendanceCalendarModal = ({ isOpen, onClose, student, isTeacher = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({});
  const [notesData, setNotesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteDate, setNoteDate] = useState('');

  useEffect(() => {
    if (isOpen && student) {
      loadData();
    }
  }, [isOpen, student, currentDate]);

  const loadData = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      // Load attendance data
      const attendanceRes = await api.get(`/students/${student.id}/attendance`, {
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        },
      });
      
      if (attendanceRes.data && attendanceRes.data.success) {
        setAttendanceData(attendanceRes.data.attendance || {});
      }

      // Load notes data
      const notesRes = await api.get(`/students/${student.id}/notes`, {
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        },
      });
      
      if (notesRes.data && notesRes.data.success) {
        const notesMap = {};
        (notesRes.data.notes || []).forEach(note => {
          const dateKey = note.date || note.created_at?.split('T')[0];
          if (dateKey) {
            notesMap[dateKey] = note.content || note.note;
          }
        });
        setNotesData(notesMap);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (date) => {
    if (!isTeacher) return;
    
    const dateKey = date.toISOString().split('T')[0];
    const currentStatus = attendanceData[dateKey];
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    
    try {
      const response = await api.post(`/students/${student.id}/attendance`, {
        date: dateKey,
        status: newStatus,
      });
      
      if (response.data && response.data.success) {
        setAttendanceData(prev => ({
          ...prev,
          [dateKey]: newStatus,
        }));
        toast.success(`Marked as ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
    }
  };

  const handleAddNote = (date) => {
    if (!isTeacher) return;
    
    const dateKey = date.toISOString().split('T')[0];
    setNoteDate(dateKey);
    setNoteContent(notesData[dateKey] || '');
    setShowNoteModal(true);
  };

  const saveNote = async () => {
    if (!noteContent.trim()) return;
    
    try {
      const response = await api.post(`/students/${student.id}/notes`, {
        date: noteDate,
        content: noteContent,
      });
      
      if (response.data && response.data.success) {
        setNotesData(prev => ({
          ...prev,
          [noteDate]: noteContent,
        }));
        setShowNoteModal(false);
        setNoteContent('');
        toast.success('Note saved successfully');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
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
    if (!date) return { attendance: null, hasNote: false };
    const dateKey = date.toISOString().split('T')[0];
    return {
      attendance: attendanceData[dateKey],
      hasNote: !!notesData[dateKey],
      note: notesData[dateKey]
    };
  };

  const getAttendanceStats = () => {
    const dates = Object.keys(attendanceData);
    const present = dates.filter(date => attendanceData[date] === 'present').length;
    const absent = dates.filter(date => attendanceData[date] === 'absent').length;
    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent, total, percentage };
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth(currentDate);
  const stats = getAttendanceStats();

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
          className="relative bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Reports & Attendance</h3>
                <p className="text-primary-100 text-sm">{student.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-200 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Stats Summary */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {stats.present}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Present
                  </div>
                </Card>
                
                <Card className="p-3 text-center bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">
                    {stats.absent}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Absent
                  </div>
                </Card>
                
                <Card className="p-3 text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {stats.percentage}%
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Rate
                  </div>
                </Card>
              </div>
            </div>

            {/* Calendar */}
            <div className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="secondary"
                  onClick={() => navigateMonth(-1)}
                  className="flex items-center space-x-1 px-3 py-2"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span className="text-sm">Prev</span>
                </Button>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatMonth(currentDate)}
                </h3>
                
                <Button
                  variant="secondary"
                  onClick={() => navigateMonth(1)}
                  className="flex items-center space-x-1 px-3 py-2"
                >
                  <span className="text-sm">Next</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
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
                  const isPast = date < new Date().setHours(0, 0, 0, 0);
                  
                  return (
                    <div
                      key={index}
                      className={`aspect-square flex flex-col items-center justify-center text-sm relative rounded-lg border-2 transition-all duration-200 ${
                        isToday
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      } ${
                        attendance === 'present'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : attendance === 'absent'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <span className={`font-medium ${
                        isPast ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {date.getDate()}
                      </span>
                      
                      {/* Data indicators */}
                      <div className="flex space-x-1 mt-1">
                        {attendance && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" title={`Attendance: ${attendance}`} />
                        )}
                        {hasNote && (
                          <div className="w-2 h-2 rounded-full bg-yellow-500" title="Has note" />
                        )}
                      </div>

                      {/* Action buttons for teachers */}
                      {isTeacher && (
                        <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-black bg-opacity-10 rounded-lg flex items-center justify-center space-x-1 transition-opacity">
                          <button
                            onClick={() => toggleAttendance(date)}
                            className="w-6 h-6 bg-white dark:bg-gray-800 rounded shadow-sm flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Toggle attendance"
                          >
                            {attendance === 'present' ? (
                              <CheckCircleIcon className="w-3 h-3 text-green-600" />
                            ) : attendance === 'absent' ? (
                              <XCircleIcon className="w-3 h-3 text-red-600" />
                            ) : (
                              <ClockIcon className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleAddNote(date)}
                            className="w-6 h-6 bg-white dark:bg-gray-800 rounded shadow-sm flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Add/edit note"
                          >
                            {hasNote ? (
                              <DocumentTextIcon className="w-3 h-3 text-yellow-600" />
                            ) : (
                              <PlusIcon className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {loading && (
                <div className="flex justify-center mt-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Attendance marked</span>
                </div>
                <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300 mt-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Has notes/comments</span>
                </div>
                {isTeacher && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    Hover over dates to mark attendance or add notes
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <Button
              onClick={onClose}
              variant="primary"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </motion.div>

        {/* Note Modal */}
        <AnimatePresence>
          {showNoteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 flex items-center justify-center p-4"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowNoteModal(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
              >
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Add Note for {new Date(noteDate).toLocaleDateString()}
                  </h4>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter your note here..."
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  />
                  <div className="flex justify-end space-x-3 mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => setShowNoteModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={saveNote}
                      disabled={!noteContent.trim()}
                    >
                      Save Note
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default AttendanceCalendarModal;
