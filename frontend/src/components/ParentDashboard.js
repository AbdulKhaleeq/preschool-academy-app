import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import PerformancePage from './PerformancePage';
import ReportsPage from './ReportsPage';
import MessageComposer from './MessageComposer';
import AnnouncementsView from './AnnouncementsView';
import PendingDues from './PendingDues';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, LoadingSpinner, Badge, LoadingCard } from './ui';
import { 
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  MegaphoneIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TrophyIcon,
  Bars3Icon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ParentDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [announcements, setAnnouncements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [examResults, setExamResults] = useState({});
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'performance', 'reports'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parentContacts, setParentContacts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalPendingDues, setTotalPendingDues] = useState(0);
  const initialContactRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchTotalPendingDues();
    }
    if (activeTab === 'children') {
      fetchMyChildren();
    }
    if (activeTab === 'messages') {
      fetchMyMessages();
      fetchParentContacts();
    }
    if (activeTab === 'activities') {
      fetchAnnouncementsAndActivities();
    }
  }, [activeTab, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTotalPendingDues = async () => {
    try {
      const response = await api.get(`/fees/parent/${user.id}/dues`);
      if (response.data.success) {
        setTotalPendingDues(response.data.totalPending || 0);
      }
    } catch (error) {
      console.error('Error fetching pending dues:', error);
      setTotalPendingDues(0);
    }
  };

  const fetchMyChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get(`/students/parent/${encodeURIComponent(user.phone)}`);

      if (data && data.success) {
        setStudents(data.students || []);
        const results = {};
        for (const s of data.students || []) {
          try {
            const r = await api.get(`/exams/${s.id}`);
            results[s.id] = r.data.results || [];
          } catch (err) {
            results[s.id] = [];
          }
        }
        setExamResults(results);
      } else {
        setError('Failed to fetch children data');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/messages?otherUserId=${user.id}`);
      if (data && data.status === 'success') setMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentContacts = async () => {
    try {
      const { data } = await api.get('/messages/parent/contacts');
      if (data && data.status === 'success') {
        const rawChildren = data.children || data.students || [];

        const normalized = (rawChildren || []).map(child => {
          const studentId = child.id ?? child.studentId ?? child.student_id;
          const studentName = child.name ?? child.studentName ?? child.student_name ?? child.student_name_display;
          const rawTeachers = child.teachers || child.mappedTeachers || child.mapped_teachers || child.teacher_list || [];

          const teachers = (rawTeachers || []).map(t => {
            const teacherId = t.teacherId ?? t.id ?? t.teacher_id ?? t.userId;
            const teacherName = t.teacherName ?? t.name ?? t.full_name ?? t.teacher_name;
            return {
              teacherId,
              teacherName,
              studentId,
              studentName
            };
          });

          return {
            studentId,
            studentName,
            teachers
          };
        });

        setParentContacts(normalized);
      } else {
        setParentContacts([]);
      }
    } catch (err) {
      console.error('Error fetching parent contacts:', err);
      setParentContacts([]);
    }
  };

  const fetchAnnouncementsAndActivities = async () => {
    try {
      setLoading(true);
      const [ann, act] = await Promise.all([
        api.get('/announcements'),
        api.get('/activities')
      ]);
      if (ann.data && ann.data.success) setAnnouncements(ann.data.announcements || []);
      if (act.data && act.data.success) setActivities(act.data.activities || []);
    } catch (err) {
      console.error('Error fetching activities and announcements data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openMessageFor = (teacher, student) => {
    initialContactRef.current = {
      studentId: student.studentId || student.id,
      studentName: student.studentName || student.name,
      teacherId: teacher.teacherId || teacher.id,
      teacherName: teacher.teacherName || teacher.name
    };
    setActiveTab('messages');
    setSidebarOpen(false);
  };

  // Load overview data immediately on mount
  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        setLoading(true);
        // Load data needed for overview: students, messages, activities, announcements, and pending dues
        await Promise.all([
          fetchMyChildren(),
          fetchMyMessages(),
          fetchAnnouncementsAndActivities(),
          fetchTotalPendingDues()
        ]);
      } catch (error) {
        console.error('Error loading overview data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOverviewData();
  }, [user]); // Only run when user changes

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'children', label: 'My Children', icon: UserGroupIcon },
    { id: 'messages', label: 'Messages', icon: ChatBubbleLeftRightIcon },
    { id: 'dues', label: 'Pending Dues', icon: CurrencyDollarIcon },
    { id: 'activities', label: 'Activities', icon: CalendarIcon },
    { id: 'announcements', label: 'Announcements', icon: MegaphoneIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewContent 
          students={students} 
          messages={messages} 
          activities={activities}
          announcements={announcements}
          totalPendingDues={totalPendingDues} 
        />;
      case 'children':
        return (
          <ChildrenContent
            students={students}
            loading={loading}
            error={error}
            examResults={examResults}
            onPerformanceClick={(student) => {
              setSelectedStudent(student);
              setCurrentView('performance');
            }}
            onReportsClick={(student) => {
              setSelectedStudent(student);
              setCurrentView('reports');
            }}
            openMessageFor={openMessageFor}
          />
        );
      case 'messages':
        return (
          <div className="h-full w-full">
            <MessageComposer
              user={user}
              contacts={parentContacts}
              isTeacher={false}
              initialContact={initialContactRef.current}
            />
          </div>
        );
      case 'dues':
        return <PendingDues user={user} />;
      case 'activities':
        return <ActivitiesContent activities={activities} loading={loading} />;
      case 'announcements':
        return <AnnouncementsView />;
      default:
        return <OverviewContent students={students} messages={messages} totalPendingDues={totalPendingDues} />;
    }
  };

  // Conditional rendering for different views
  if (currentView === 'performance') {
    return (
      <PerformancePage
        student={selectedStudent}
        user={user}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'reports') {
    return (
      <ReportsPage
        student={selectedStudent}
        user={user}
        onBack={() => setCurrentView('dashboard')}
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
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-3 h-3 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Parent Portal
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
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
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
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Parent Portal
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
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Parent Portal
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
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
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

// Overview Content Component
const OverviewContent = ({ students, messages, activities, announcements, totalPendingDues }) => {
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString()}`;
  };

  const stats = [
    { title: 'My Children', value: students.length, icon: UserGroupIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Messages', value: messages.length, icon: ChatBubbleLeftRightIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Activities', value: activities.length, icon: CalendarIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Announcements', value: announcements.length, icon: MegaphoneIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Pending Fees', value: formatCurrency(totalPendingDues), icon: CurrencyDollarIcon, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Stay connected with your child's learning journey
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
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
    </div>
  );
};

// Children Content Component
const ChildrenContent = ({ students, loading, error, examResults, onPerformanceClick, onReportsClick, openMessageFor }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="secondary">
          Try Again
        </Button>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="p-8 text-center">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No children found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My Children
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your children's progress and activities
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {students.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm md:text-base">
                      {student.name?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {student.name}
                    </h3>
                  </div>
                </div>
                <Badge variant="success" className="text-xs">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Class</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {student.class_name || 'Not assigned'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Teacher</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {student.teacher_name || 'Not assigned'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => onPerformanceClick(student)}
                  size="sm"
                  className="flex-1 text-sm bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                >
                  <TrophyIcon className="w-4 h-4 mr-2" />
                  Performance
                </Button>
                <Button
                  onClick={() => onReportsClick(student)}
                  size="sm"
                  className="flex-1 text-sm bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Activities Content Component
const ActivitiesContent = ({ activities, loading }) => {
  if (loading) {
    return <div className="text-center py-8"><LoadingSpinner size="lg" /></div>;
  }

  // Group activities by date using start_date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.start_date).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedActivities).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Activities
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your children's daily activities and lessons
        </p>
      </div>
      
      {activities.length === 0 ? (
        <Card className="p-8 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No activities scheduled</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateString, dateIndex) => {
            const date = new Date(dateString);
            const isToday = date.toDateString() === new Date().toDateString();
            const isPast = date < new Date().setHours(0, 0, 0, 0);
            
            return (
              <div key={dateString} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className={`text-lg font-semibold ${
                    isToday ? 'text-blue-600 dark:text-blue-400' : 
                    isPast ? 'text-gray-500 dark:text-gray-400' : 
                    'text-gray-900 dark:text-gray-100'
                  }`}>
                    {isToday ? 'Today' : date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </h3>
                  {isToday && (
                    <Badge variant="info" className="text-xs">Current</Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  {groupedActivities[dateString]
                    .map((activity, index) => (
                    <motion.div
                      key={activity.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (dateIndex * 0.1) + (index * 0.05) }}
                    >
                      <Card className={`p-4 ${activity.is_completed ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {activity.title}
                              </h4>
                              {activity.is_completed && (
                                <Badge variant="success" className="text-xs">
                                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                            {activity.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {activity.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <span>📅 {new Date(activity.start_date).toLocaleDateString()}</span>
                              {activity.end_date && (
                                <span>→ {new Date(activity.end_date).toLocaleDateString()}</span>
                              )}
                              {activity.teacher_name && (
                                <span>�‍🏫 {activity.teacher_name}</span>
                              )}
                            </div>
                            
                            {/* Student Progress for Parent View */}
                            {activity.students && activity.students.length > 0 && (
                              <div className="border-t pt-2 mt-2">
                                <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Your Children:
                                </h5>
                                <div className="space-y-1">
                                  {activity.students.map(student => (
                                    <div key={student.id} className="flex items-center justify-between text-sm">
                                      <span className="text-gray-700 dark:text-gray-300">
                                        {student.name}
                                      </span>
                                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                        student.is_completed
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
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
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
