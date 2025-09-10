// TeacherDashboard.js - Modernized with Tailwind CSS
import React, { useEffect, useState } from 'react';
import { Card, Tabs, Badge, FloatingActionButton, Modal } from './ui';
import TeacherStudentsView from './TeacherStudentsView';
import api from '../api';
import TeacherExamsTab from './TeacherExamsTab';
import MessageComposer from './MessageComposer';
import AnnouncementsView from './AnnouncementsView';

// Demo data for development
const DEMO_DATA = {
  students: [
    { id: 1, name: 'Emma Johnson', age: 4, class: 'Pre-K A', attendance: 95, lastActivity: 'Art & Craft', avatar: '👧' },
    { id: 2, name: 'Liam Johnson', age: 3, class: 'Pre-K A', attendance: 92, lastActivity: 'Story Time', avatar: '👦' },
    { id: 3, name: 'Sophia Davis', age: 4, class: 'Pre-K A', attendance: 98, lastActivity: 'Music Class', avatar: '👧' },
    { id: 4, name: 'Noah Wilson', age: 3, class: 'Pre-K A', attendance: 89, lastActivity: 'Math Games', avatar: '👦' }
  ],
  messages: [
    { id: 1, from: 'Mrs. Johnson', message: 'How is Emma doing in art class?', time: '1 hour ago', unread: true },
    { id: 2, from: 'Mr. Davis', message: 'Thank you for the update on Sophia', time: '3 hours ago', unread: false }
  ],
  activities: [
    { id: 1, title: 'Art & Craft Time', time: '10:00 AM', status: 'active', participants: 15 },
    { id: 2, title: 'Story Reading', time: '11:30 AM', status: 'upcoming', participants: 12 },
    { id: 3, title: 'Music Class', time: '2:00 PM', status: 'upcoming', participants: 18 }
  ],
  contacts: [
    { studentId: 1, studentName: 'Emma Johnson', parentName: 'Mrs. Johnson', phone: '+919876543210' },
    { studentId: 2, studentName: 'Liam Johnson', parentName: 'Mrs. Johnson', phone: '+919876543210' },
    { studentId: 3, studentName: 'Sophia Davis', parentName: 'Mr. Davis', phone: '+919876543211' }
  ]
};

const TeacherDashboard = ({ user, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState({ total: 4, presentToday: 3, messages: 2, tests: 1 });
  const [teacherContacts, setTeacherContacts] = useState(DEMO_DATA.contacts);
  const [students, setStudents] = useState(DEMO_DATA.students);
  const [messages, setMessages] = useState(DEMO_DATA.messages);
  const [activities, setActivities] = useState(DEMO_DATA.activities);
  const [loading, setLoading] = useState(false);
  const [showQuickMessage, setShowQuickMessage] = useState(false);

  useEffect(() => {
    const loadOverviewAndContacts = async () => {
      try {
        setLoading(true);
        // Use demo data since backend isn't available
        setTimeout(() => {
          setOverview({ total: 4, presentToday: 3, messages: 2, tests: 1 });
          setTeacherContacts(DEMO_DATA.contacts);
          setStudents(DEMO_DATA.students);
          setMessages(DEMO_DATA.messages);
          setActivities(DEMO_DATA.activities);
          setLoading(false);
        }, 500);
      } catch (e) {
        console.error("Error loading teacher dashboard data:", e);
        setLoading(false);
      }
    };
    loadOverviewAndContacts();
  }, [user]);

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: ({ className }) => <span className={className}>📊</span> },
    { id: 'students', label: 'My Students', icon: ({ className }) => <span className={className}>👶</span>, count: students.length },
    { id: 'messages', label: 'Messages', icon: ({ className }) => <span className={className}>💬</span>, count: messages.filter(m => m.unread).length },
    { id: 'activities', label: 'Activities', icon: ({ className }) => <span className={className}>🎨</span> },
    { id: 'exams', label: 'Tests & Exams', icon: ({ className }) => <span className={className}>🧪</span> },
    { id: 'announcements', label: 'Announcements', icon: ({ className }) => <span className={className}>📢</span> }
  ];

  // Statistics for overview
  const stats = [
    {
      title: '👶 My Students',
      value: overview.total,
      description: 'In my class',
      color: 'bg-primary-500',
      trend: '+2 this week'
    },
    {
      title: '✅ Present Today',
      value: overview.presentToday,
      description: 'Students attended',
      color: 'bg-success-500',
      trend: '85% attendance'
    },
    {
      title: '💬 Messages',
      value: overview.messages,
      description: 'From parents',
      color: 'bg-warning-500',
      trend: '1 unread'
    },
    {
      title: '📋 Activities',
      value: activities.length,
      description: 'Planned today',
      color: 'bg-secondary-500',
      trend: '3 scheduled'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold font-display text-neutral-900 dark:text-neutral-100 mb-2">
            👩‍🏫 Teacher Dashboard
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Manage your classroom and students
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pills"
          className="flex justify-center"
        />

        {/* Tab Content */}
        <div className="animate-fade-in">
          {/* Overview Tab */}
          <Tabs.Panel tabId="overview" activeTab={activeTab}>
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} hover className="text-center">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {stat.title}
                      </h3>
                      <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {stat.value}
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-500">
                        {stat.description}
                      </p>
                      <div className="text-xs text-neutral-400 dark:text-neutral-500">
                        {stat.trend}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Today's Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Today's Activities */}
                <Card>
                  <Card.Header>
                    <Card.Title>Today's Schedule</Card.Title>
                    <Card.Description>Classroom activities and lessons</Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
                            <span className="text-xl">🎨</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{activity.title}</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{activity.time} • {activity.participants} students</p>
                          </div>
                          <Badge variant={activity.status === 'active' ? 'success' : 'secondary'} size="sm">
                            {activity.status === 'active' ? 'Now' : 'Upcoming'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                {/* Recent Messages */}
                <Card>
                  <Card.Header>
                    <Card.Title>Recent Messages</Card.Title>
                    <Card.Description>Latest communication from parents</Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {messages.slice(0, 3).map((message) => (
                        <div key={message.id} className="flex items-start space-x-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                          <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center">
                            <span className="text-sm">👨‍👩‍👧‍👦</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium text-neutral-900 dark:text-neutral-100">{message.from}</h5>
                              {message.unread && <Badge variant="primary" size="sm">New</Badge>}
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{message.message}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">{message.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Tabs.Panel>

          {/* Students Tab */}
          <Tabs.Panel tabId="students" activeTab={activeTab}>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Students</h2>
                  <p className="text-neutral-600 dark:text-neutral-400">Manage your classroom students</p>
                </div>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                  Add Student
                </button>
              </div>

              {loading ? (
                <Card className="text-center py-12">
                  <div className="animate-pulse">
                    <div className="w-8 h-8 bg-primary-200 rounded mx-auto mb-4"></div>
                    <p className="text-neutral-600 dark:text-neutral-400">Loading students...</p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student) => (
                    <Card key={student.id} hover>
                      <Card.Header>
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{student.avatar}</div>
                          <div>
                            <Card.Title className="text-lg">{student.name}</Card.Title>
                            <Card.Description>Age {student.age} • {student.class}</Card.Description>
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Attendance:</span>
                            <Badge variant={student.attendance >= 95 ? 'success' : student.attendance >= 90 ? 'warning' : 'danger'}>
                              {student.attendance}%
                            </Badge>
                          </div>
                          <div className="pt-2">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Last Activity:</p>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{student.lastActivity}</p>
                          </div>
                        </div>
                      </Card.Body>
                      <Card.Footer>
                        <div className="flex space-x-2">
                          <button className="flex-1 px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-800/30">
                            View Profile
                          </button>
                          <button className="flex-1 px-3 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors dark:bg-secondary-900/30 dark:text-secondary-300 dark:hover:bg-secondary-800/30">
                            Add Note
                          </button>
                        </div>
                      </Card.Footer>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Tabs.Panel>

          {/* Messages Tab */}
          <Tabs.Panel tabId="messages" activeTab={activeTab}>
            <Card>
              <Card.Header>
                <Card.Title>Messages</Card.Title>
                <Card.Description>Chat with parents and colleagues</Card.Description>
              </Card.Header>
              <Card.Body padding="none">
                <MessageComposer
                  user={user}
                  contacts={teacherContacts}
                  isTeacher={true}
                />
              </Card.Body>
            </Card>
          </Tabs.Panel>

          {/* Activities Tab */}
          <Tabs.Panel tabId="activities" activeTab={activeTab}>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Classroom Activities</h2>
                  <p className="text-neutral-600 dark:text-neutral-400">Manage daily activities and lessons</p>
                </div>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                  Add Activity
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activities.map((activity) => (
                  <Card key={activity.id} hover>
                    <Card.Header>
                      <div className="flex items-center justify-between">
                        <Card.Title>{activity.title}</Card.Title>
                        <Badge variant={activity.status === 'active' ? 'success' : 'secondary'}>
                          {activity.status}
                        </Badge>
                      </div>
                      <Card.Description>Scheduled for {activity.time}</Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
                          <span className="text-xl">🎨</span>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Participants</p>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{activity.participants} students</p>
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-800/30">
                          View Details
                        </button>
                        <button className="flex-1 px-3 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors dark:bg-secondary-900/30 dark:text-secondary-300 dark:hover:bg-secondary-800/30">
                          Edit
                        </button>
                      </div>
                    </Card.Footer>
                  </Card>
                ))}
              </div>
            </div>
          </Tabs.Panel>

          {/* Exams Tab */}
          <Tabs.Panel tabId="exams" activeTab={activeTab}>
            <Card>
              <Card.Header>
                <Card.Title>Tests & Exams</Card.Title>
                <Card.Description>Manage student assessments and results</Card.Description>
              </Card.Header>
              <Card.Body padding="none">
                <TeacherExamsTab teacherName={user.name} />
              </Card.Body>
            </Card>
          </Tabs.Panel>

          {/* Announcements Tab */}
          <Tabs.Panel tabId="announcements" activeTab={activeTab}>
            <Card>
              <Card.Header>
                <Card.Title>School Announcements</Card.Title>
                <Card.Description>View and manage school announcements</Card.Description>
              </Card.Header>
              <Card.Body padding="none">
                <AnnouncementsView userRole="teacher" />
              </Card.Body>
            </Card>
          </Tabs.Panel>
        </div>
      </div>

      {/* Floating Action Button for Quick Actions */}
      <FloatingActionButton
        onClick={() => setShowQuickMessage(true)}
        variant="primary"
        position="bottom-right"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </FloatingActionButton>

      {/* Quick Action Modal */}
      <Modal
        isOpen={showQuickMessage}
        onClose={() => setShowQuickMessage(false)}
        title="Quick Actions"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            What would you like to do?
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              className="p-4 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-colors dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-800/30"
              onClick={() => setShowQuickMessage(false)}
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="text-sm font-medium">Add Note</div>
            </button>
            <button 
              className="p-4 bg-success-50 text-success-700 rounded-xl hover:bg-success-100 transition-colors dark:bg-success-900/30 dark:text-success-300 dark:hover:bg-success-800/30"
              onClick={() => setShowQuickMessage(false)}
            >
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-medium">Take Attendance</div>
            </button>
            <button 
              className="p-4 bg-secondary-50 text-secondary-700 rounded-xl hover:bg-secondary-100 transition-colors dark:bg-secondary-900/30 dark:text-secondary-300 dark:hover:bg-secondary-800/30"
              onClick={() => setShowQuickMessage(false)}
            >
              <div className="text-2xl mb-2">💬</div>
              <div className="text-sm font-medium">Send Message</div>
            </button>
            <button 
              className="p-4 bg-warning-50 text-warning-700 rounded-xl hover:bg-warning-100 transition-colors dark:bg-warning-900/30 dark:text-warning-300 dark:hover:bg-warning-800/30"
              onClick={() => setShowQuickMessage(false)}
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium">Add Activity</div>
            </button>
          </div>
        </div>
        <Modal.Footer>
          <button 
            onClick={() => setShowQuickMessage(false)}
            className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;