import React, { useEffect, useState } from 'react';
import TeacherStudentsView from './TeacherStudentsView';
import api from '../api';
import TeacherExamsTab from './TeacherExamsTab';
import MessageComposer from './MessageComposer';
import AnnouncementsView from './AnnouncementsView';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, LoadingSpinner, Badge, LoadingCard } from './ui';
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
  Bars3Icon
} from '@heroicons/react/24/outline';

const TeacherDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState({ total: 0, presentToday: 0, messages: 0, tests: 0 });
  const [teacherContacts, setTeacherContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadOverviewAndContacts = async () => {
      try {
        setLoading(true);
        const [studentsRes, msgsRes, contactsRes] = await Promise.all([
          api.get(`/students/teacher/${encodeURIComponent(user.name)}`),
          api.get(`/messages?otherUserId=${user.id}`),
          api.get('/messages/teacher/contacts')
        ]);
        const total = studentsRes.data?.students?.length || 0;
        const messages = msgsRes.data?.messages?.length || 0;
        setOverview({ total, presentToday: 0, messages, tests: 0 });
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TeacherOverview overview={overview} loading={loading} />;
      case 'students':
        return <TeacherStudentsView teacher={user} />;
      case 'exams':
        return <TeacherExamsTab user={user} />;
      case 'activities':
        return <TeacherActivities user={user} />;
      case 'messages':
        return (
          <div className="h-full">
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
        return <TeacherOverview overview={overview} loading={loading} />;
    }
  };

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
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
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
const TeacherOverview = ({ overview, loading }) => {
  const stats = [
    { 
      title: 'My Students', 
      value: overview.total, 
      icon: UserGroupIcon, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      desc: 'Total students in your classes'
    },
    { 
      title: 'Messages', 
      value: overview.messages, 
      icon: ChatBubbleLeftRightIcon, 
      color: 'text-green-600', 
      bg: 'bg-green-100 dark:bg-green-900/20',
      desc: 'Unread messages from parents'
    },
    { 
      title: 'Present Today', 
      value: overview.presentToday, 
      icon: CheckCircleIcon, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      desc: 'Students present today'
    },
    { 
      title: 'Scheduled Tests', 
      value: overview.tests, 
      icon: AcademicCapIcon, 
      color: 'text-orange-600', 
      bg: 'bg-orange-100 dark:bg-orange-900/20',
      desc: 'Upcoming assessments'
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
              <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 md:p-3 rounded-lg ${stat.bg}`}>
                        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {stat.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.desc}
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
            className="flex flex-col items-center p-4 h-auto"
            size="sm"
          >
            <CalendarIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Schedule Activity</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center p-4 h-auto"
            size="sm"
          >
            <AcademicCapIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Create Exam</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center p-4 h-auto"
            size="sm"
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Message Parents</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center p-4 h-auto"
            size="sm"
          >
            <ClockIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Mark Attendance</span>
          </Button>
        </div>
      </Card>

      {/* Today's Schedule */}
      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Today's Schedule
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Morning Circle Time</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Group activity and songs</div>
            </div>
            <Badge variant="success" className="text-xs">
              9:00 AM
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Art & Crafts</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Creative expression time</div>
            </div>
            <Badge variant="warning" className="text-xs">
              10:30 AM
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Outdoor Play</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Physical activity and games</div>
            </div>
            <Badge variant="info" className="text-xs">
              2:00 PM
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Teacher Activities Component
const TeacherActivities = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Activities & Lessons
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Plan and manage your classroom activities
        </p>
      </div>

      {activities.length === 0 ? (
        <Card className="p-8 text-center">
          <PaintBrushIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No activities scheduled yet</p>
          <Button>Schedule New Activity</Button>
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
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {activity.activity_name || activity.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>📅 {activity.date}</span>
                      <span>🕐 {activity.time}</span>
                      <span>👥 {activity.class_name || 'All Classes'}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Badge variant="info" className="text-xs">
                      {activity.status || 'Planned'}
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
