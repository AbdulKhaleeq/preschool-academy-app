import React, { useEffect, useState } from 'react';
import TeacherStudentsView from './TeacherStudentsView';
import PerformancePage from './PerformancePage';
import ReportsPage from './ReportsPage';
import api, { formatDateForAPI } from '../api';
import TeacherExamsTab from './TeacherExamsTab';
import MessageComposer from './MessageComposer';
import AnnouncementsView from './AnnouncementsView';
import ConfirmModal from './ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, LoadingSpinner, Badge, LoadingCard } from './ui';
import toast from 'react-hot-toast';
import { 
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  PaintBrushIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  Bars3Icon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const TeacherDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState({ total: 0, messages: 0, activities: 0, announcements: 0 });
  const [teacherContacts, setTeacherContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'performance', 'reports'
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const loadOverviewAndContacts = async () => {
      try {
        setLoading(true);
        const [studentsRes, msgsRes, contactsRes, activitiesRes, announcementsRes] = await Promise.all([
          api.get(`/students/teacher/${encodeURIComponent(user.name)}`),
          api.get(`/messages?otherUserId=${user.id}`),
          api.get('/messages/teacher/contacts'),
          api.get('/activities'),
          api.get('/announcements')
        ]);
        const total = studentsRes.data?.students?.length || 0;
        const messages = msgsRes.data?.messages?.length || 0;
        const activities = activitiesRes.data?.activities?.length || 0;
        const announcements = announcementsRes.data?.announcements?.length || 0;
        setOverview({ total, messages, activities, announcements });
        setTeacherContacts(contactsRes.data?.students || contactsRes.data?.contacts || []);
      } catch (e) {
        console.error("Error loading teacher dashboard data:", e);
      } finally {
        setLoading(false);
      }
    };
    loadOverviewAndContacts();
  }, [user]);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'students', label: 'Students', icon: UserGroupIcon },
    { id: 'exams', label: 'Exams', icon: AcademicCapIcon },
    { id: 'activities', label: 'Activities', icon: PaintBrushIcon },
    { id: 'messages', label: 'Messages', icon: ChatBubbleLeftRightIcon },
    { id: 'announcements', label: 'Announcements', icon: MegaphoneIcon },
  ];

  const handleTabNavigation = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TeacherOverview overview={overview} loading={loading} onNavigateToTab={handleTabNavigation} />;
      case 'students':
        return (
          <TeacherStudentsView 
            user={user}
            onPerformanceClick={(student) => {
              setSelectedStudent(student);
              setCurrentView('performance');
            }}
            onReportsClick={(student) => {
              setSelectedStudent(student);
              setCurrentView('reports');
            }}
          />
        );
      case 'exams':
        return <TeacherExamsTab user={user} />;
      case 'activities':
        return <TeacherActivities user={user} />;
      case 'messages':
        return (
          <div className="h-full w-full">
            <MessageComposer
              user={user}
              contacts={teacherContacts}
              isTeacher={true}
            />
          </div>
        );
      case 'announcements':
        return <AnnouncementsView />;
      default:
        return <TeacherOverview overview={overview} loading={loading} onNavigateToTab={handleTabNavigation} />;
    }
  };

  // Conditional rendering for different views
  if (currentView === 'performance') {
    return (
      <PerformancePage
        student={selectedStudent}
        user={user}
        onBack={() => {
          setCurrentView('dashboard');
          setActiveTab('students');
        }}
      />
    );
  }

  if (currentView === 'reports') {
    return (
      <ReportsPage
        student={selectedStudent}
        user={user}
        onBack={() => {
          setCurrentView('dashboard');
          setActiveTab('students');
        }}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-3 h-3 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Teacher Portal
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto px-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200
                  ${activeTab === item.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Teacher Portal
            </h2>
          </div>
        </div>

        <nav className="mt-8 px-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 mb-2 text-left rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-r-4 border-primary-600' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Teacher Portal
                </h1>
              </div>
              
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200
                        ${activeTab === item.id
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className={`flex-1 overflow-y-auto ${activeTab === 'messages' ? '' : 'p-4 md:p-6'}`}>
            <div className={activeTab === 'messages' ? '' : 'max-w-7xl mx-auto'}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className={activeTab === 'messages' ? 'h-full w-full' : 'h-full'}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Teacher Overview Component
const TeacherOverview = ({ overview, loading, onNavigateToTab }) => {
  const stats = [
    { 
      title: 'My Students', 
      value: overview.total, 
      icon: UserGroupIcon, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100 dark:bg-blue-900/20'
    },
    { 
      title: 'Messages', 
      value: overview.messages, 
      icon: ChatBubbleLeftRightIcon, 
      color: 'text-green-600', 
      bg: 'bg-green-100 dark:bg-green-900/20'
    },
    { 
      title: 'Activities', 
      value: overview.activities, 
      icon: PaintBrushIcon, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100 dark:bg-purple-900/20'
    },
    { 
      title: 'Announcements', 
      value: overview.announcements, 
      icon: MegaphoneIcon, 
      color: 'text-orange-600', 
      bg: 'bg-orange-100 dark:bg-orange-900/20'
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Teacher Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening in your classroom today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className={`p-2 md:p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Button 
            variant="secondary" 
            className="flex flex-col items-center justify-center p-4 h-20"
            onClick={() => onNavigateToTab('activities')}
          >
            <CalendarIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Schedule Activity</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center justify-center p-4 h-20"
            onClick={() => onNavigateToTab('exams')}
          >
            <AcademicCapIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Create Exam</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center justify-center p-4 h-20"
            onClick={() => onNavigateToTab('messages')}
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Message Parents</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center justify-center p-4 h-20"
            onClick={() => onNavigateToTab('announcements')}
          >
            <MegaphoneIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">View Announcements</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Teacher Activities Component - Simplified and Fixed
const TeacherActivities = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    start_date: formatDateForAPI(new Date()),
    end_date: ''
  });

  useEffect(() => {
    fetchActivities();
    fetchTeacherStudents();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data } = await api.get('/activities');
      if (data && data.success) {
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherStudents = async () => {
    setFetchingStudents(true);
    try {      
      // Try the activities endpoint first
      const { data } = await api.get('/activities/teacher-students');
      
      if (data && data.success && data.students && data.students.length > 0) {
        setTeacherStudents(data.students);
      } else {
        // Fallback to students endpoint using teacher name
        const fallbackResponse = await api.get(`/students/teacher/${encodeURIComponent(user.name)}`);
        
        if (fallbackResponse.data && fallbackResponse.data.students) {
          setTeacherStudents(fallbackResponse.data.students);
        } else {
          setTeacherStudents([]);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setTeacherStudents([]);
    } finally {
      setFetchingStudents(false);
    }
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    
    try {
      const activityData = {
        ...newActivity,
        student_ids: selectedStudents
      };
      
      const { data } = await api.post('/activities', activityData);
      
      if (data && data.success) {
        setActivities([data.activity, ...activities]);
        setNewActivity({
          title: '',
          description: '',
          start_date: formatDateForAPI(new Date()),
          end_date: ''
        });
        setSelectedStudents([]);
        setShowCreateForm(false);
        toast.success('Activity created successfully!');
      }
    } catch (err) {
      console.error('Error creating activity:', err);
      toast.error('Error creating activity: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleStudentCompletion = async (activityId, studentId, currentStatus) => {
    try {
      const { data } = await api.patch(`/activities/${activityId}`, {
        student_id: studentId,
        is_completed: !currentStatus
      });
      if (data && data.success) {
        setActivities(activities.map(activity => 
          activity.id === activityId 
            ? {
                ...activity,
                students: activity.students.map(student =>
                  student.id === studentId
                    ? { ...student, is_completed: !currentStatus }
                    : student
                )
              }
            : activity
        ));
      }
    } catch (err) {
      console.error('Error updating student completion:', err);
    }
  };

  const deleteActivity = async (activityId, activityTitle) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Activity',
      message: `Are you sure you want to delete the activity "${activityTitle}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const { data } = await api.delete(`/activities/${activityId}`);
          if (data && data.success) {
            setActivities(activities.filter(activity => activity.id !== activityId));
            toast.success('Activity deleted successfully!');
          }
        } catch (err) {
          console.error('Error deleting activity:', err);
          toast.error('Error deleting activity: ' + (err.response?.data?.message || err.message));
        }
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            My Activities
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Plan and manage activities for your students
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Activity
        </Button>
      </div>

      {/* Create Activity Form */}
      {showCreateForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Activity</h3>
          <form onSubmit={handleCreateActivity} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Activity Title *</label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Morning Circle Time"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Date *</label>
                <input
                  type="date"
                  value={newActivity.start_date}
                  onChange={(e) => setNewActivity({...newActivity, start_date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  value={newActivity.end_date}
                  onChange={(e) => setNewActivity({...newActivity, end_date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={newActivity.start_date}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Describe the activity..."
              />
            </div>

            {/* Student Selection - SIMPLIFIED */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Students *</label>
              
              {fetchingStudents ? (
                <div className="border border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-gray-600">Loading students...</span>
                </div>
              ) : teacherStudents.length === 0 ? (
                <div className="border border-gray-300 rounded-lg p-4 text-center bg-red-50">
                  <p className="text-red-600">No students found. Contact admin to assign students.</p>
                  <button
                    type="button"
                    onClick={fetchTeacherStudents}
                    className="mt-2 text-sm text-blue-600 underline"
                  >
                    Retry Loading Students
                  </button>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg bg-white">
                  <div className="max-h-48 overflow-y-auto p-3">
                    <div className="space-y-2">
                      {teacherStudents.map(student => (
                        <div
                          key={student.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                            selectedStudents.includes(student.id)
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                          onClick={() => handleStudentToggle(student.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleStudentToggle(student.id)}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                {student.name}
                              </span>
                              {student.class_name && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {student.class_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Selection Summary and Actions */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {teacherStudents.length} students available
                      </span>
                      {selectedStudents.length > 0 && (
                        <span className="text-sm text-blue-600 font-medium">
                          {selectedStudents.length} selected
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStudents(teacherStudents.map(s => s.id))}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStudents([])}
                        className="text-xs text-gray-600 hover:text-gray-800 underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedStudents.length === 0 && teacherStudents.length > 0 && (
                <p className="mt-1 text-sm text-red-600">Please select at least one student</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={selectedStudents.length === 0}
                className={selectedStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Create Activity
              </Button>
              <Button type="button" variant="ghost" onClick={() => {
                setShowCreateForm(false);
                setSelectedStudents([]);
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Activities List */}
      {activities.length === 0 ? (
        <Card className="p-8 text-center">
          <PaintBrushIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No activities scheduled yet</p>
          <Button onClick={() => setShowCreateForm(true)}>Create Your First Activity</Button>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {activity.title}
                      </h3>
                      {activity.is_completed && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Completed
                        </span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {activity.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>📅 {new Date(activity.start_date).toLocaleDateString()}</span>
                      {activity.end_date && (
                        <span>→ {new Date(activity.end_date).toLocaleDateString()}</span>
                      )}
                    </div>

                    {/* Student Progress */}
                    {activity.students && activity.students.length > 0 && (
                      <div className="border-t pt-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Student Progress:
                        </h4>
                        <div className="space-y-2">
                          {activity.students.map(student => (
                            <div key={student.id} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {student.name}
                              </span>
                              <button
                                onClick={() => toggleStudentCompletion(activity.id, student.id, student.is_completed)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                  student.is_completed
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {student.is_completed ? (
                                  <>
                                    <CheckCircleIcon className="w-3 h-3" />
                                    Done
                                  </>
                                ) : (
                                  <>
                                    <ClockIcon className="w-3 h-3" />
                                    Pending
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteActivity(activity.id, activity.title)}
                    className="ml-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete Activity"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
      />
    </div>
  );
};

export default TeacherDashboard;