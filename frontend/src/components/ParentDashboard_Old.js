// ParentDashboard.js - Modernized with Tailwind CSS
import React, { useState, useEffect, useRef } from 'react';
import { Card, Tabs, Badge, FloatingActionButton, Modal } from './ui';
import api from '../api';
import ParentExamResultsModal from './ParentExamResultsModal';
import ParentDailyReportsModal from './ParentDailyReportsModal';
import MessageComposer from './MessageComposer';
import AnnouncementsView from './AnnouncementsView';

// Demo data for development
const DEMO_DATA = {
  children: [
    { 
      id: 1, 
      name: 'Emma Johnson', 
      age: 4, 
      class: 'Pre-K A', 
      teacher: 'Ms. Sarah', 
      attendance: 95,
      lastActivity: 'Art & Craft - Drawing Animals',
      avatar: '👧'
    },
    { 
      id: 2, 
      name: 'Liam Johnson', 
      age: 3, 
      class: 'Nursery B', 
      teacher: 'Mr. David', 
      attendance: 92,
      lastActivity: 'Story Time - Three Little Pigs',
      avatar: '👦'
    }
  ],
  recentMessages: [
    { id: 1, from: 'Ms. Sarah', message: 'Emma did great in art class today!', time: '2 hours ago', unread: true },
    { id: 2, from: 'Mr. David', message: 'Reminder: Parent-teacher meeting on Friday', time: '1 day ago', unread: false }
  ],
  upcomingEvents: [
    { id: 1, title: 'Parent-Teacher Conference', date: '2024-01-15', time: '2:00 PM' },
    { id: 2, title: 'School Picnic', date: '2024-01-20', time: '10:00 AM' },
    { id: 3, title: 'Art Exhibition', date: '2024-01-25', time: '3:00 PM' }
  ]
};

const ParentDashboard = ({ user, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState(DEMO_DATA.children);
  const [messages, setMessages] = useState(DEMO_DATA.recentMessages); // Used for message count in future features
  const [announcements, setAnnouncements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [examResults, setExamResults] = useState({});
  const [examModal, setExamModal] = useState({ open: false, student: null });
  const [dailyModal, setDailyModal] = useState({ open: false, student: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuickMessage, setShowQuickMessage] = useState(false);

  // parentContacts structure: array of children, each child:
  // { studentId, studentName, teachers: [{ teacherId, teacherName, studentId, studentName }] }
  const [parentContacts, setParentContacts] = useState([]);

  // optional: store an initial contact to let MessageComposer open conversation immediately
  const initialContactRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'children') {
      fetchMyChildren();
    }
    if (activeTab === 'messages') {
      fetchMyMessages();
      fetchParentContacts();
    }
    if (activeTab === 'schedule') {
      fetchAnnouncementsAndActivities();
    }
    if (activeTab === 'announcements') {
      // No need to fetch announcements here, AnnouncementsView component will do it
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const fetchMyChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use demo data for now since backend isn't available
      // In real implementation:
      // const { data } = await api.get(`/students/parent/${encodeURIComponent(user.phone)}`);
      
      setTimeout(() => {
        setStudents(DEMO_DATA.children);
        setLoading(false);
      }, 500);
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
      // Use demo data for now
      setTimeout(() => {
        setMessages(DEMO_DATA.recentMessages);
        setLoading(false);
      }, 300);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentContacts = async () => {
    try {
      // Demo implementation
      const contacts = DEMO_DATA.children.map(child => ({
        studentId: child.id,
        studentName: child.name,
        teachers: [
          { teacherId: 1, teacherName: child.teacher, studentId: child.id, studentName: child.name }
        ]
      }));
      setParentContacts(contacts);
    } catch (error) {
      console.error('Error fetching parent contacts:', error);
    }
  };

  const fetchAnnouncementsAndActivities = async () => {
    try {
      setLoading(true);
      // Demo data
      setTimeout(() => {
        setActivities(DEMO_DATA.upcomingEvents);
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: ({ className }) => <span className={className}>📊</span> },
    { id: 'children', label: 'My Children', icon: ({ className }) => <span className={className}>👶</span> },
    { id: 'messages', label: 'Messages', icon: ({ className }) => <span className={className}>💬</span>, count: messages.filter(m => m.unread).length },
    { id: 'schedule', label: 'Schedule', icon: ({ className }) => <span className={className}>📅</span> },
    { id: 'announcements', label: 'Announcements', icon: ({ className }) => <span className={className}>📢</span> }
  ];

  // Statistics for overview
  const stats = [
    {
      title: '👶 My Children',
      value: students.length,
      description: 'Enrolled',
      color: 'bg-primary-500'
    },
    {
      title: '✅ Present Today',
      value: students.filter(child => child.attendance > 90).length,
      description: 'Attended today',
      color: 'bg-success-500'
    },
    {
      title: '💬 New Messages',
      value: messages.filter(m => m.unread).length,
      description: 'From teachers',
      color: 'bg-warning-500'
    },
    {
      title: '📋 This Week',
      value: activities.length,
      description: 'Activities planned',
      color: 'bg-secondary-500'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold font-display text-neutral-900 dark:text-neutral-100 mb-2">
            Parent Dashboard
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Stay connected with your child's learning journey
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
                    </div>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Children Quick View */}
                <Card>
                  <Card.Header>
                    <Card.Title>Your Children</Card.Title>
                    <Card.Description>Quick overview of your children's progress</Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {students.map((child) => (
                        <div key={child.id} className="flex items-center space-x-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                          <div className="text-2xl">{child.avatar}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{child.name}</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{child.class} • {child.teacher}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-500">{child.lastActivity}</p>
                          </div>
                          <Badge variant="success" size="sm">
                            {child.attendance}%
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
                    <Card.Description>Latest communication from teachers</Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {messages.slice(0, 3).map((message) => (
                        <div key={message.id} className="flex items-start space-x-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-sm">👩‍🏫</span>
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

          {/* Children Tab */}
          <Tabs.Panel tabId="children" activeTab={activeTab}>
            <div className="space-y-6">
              {loading ? (
                <Card className="text-center py-12">
                  <div className="animate-pulse">
                    <div className="w-8 h-8 bg-primary-200 rounded mx-auto mb-4"></div>
                    <p className="text-neutral-600 dark:text-neutral-400">Loading children...</p>
                  </div>
                </Card>
              ) : error ? (
                <Card className="text-center py-12">
                  <div className="text-error-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Error Loading Data</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">{error}</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((child) => (
                    <Card key={child.id} hover>
                      <Card.Header>
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{child.avatar}</div>
                          <div>
                            <Card.Title className="text-lg">{child.name}</Card.Title>
                            <Card.Description>Age {child.age} • {child.class}</Card.Description>
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Teacher:</span>
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{child.teacher}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Attendance:</span>
                            <Badge variant={child.attendance >= 95 ? 'success' : child.attendance >= 90 ? 'warning' : 'danger'}>
                              {child.attendance}%
                            </Badge>
                          </div>
                          <div className="pt-2">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Last Activity:</p>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{child.lastActivity}</p>
                          </div>
                        </div>
                      </Card.Body>
                      <Card.Footer>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setExamModal({ open: true, student: child })}
                            className="flex-1 px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-800/30"
                          >
                            View Results
                          </button>
                          <button 
                            onClick={() => setDailyModal({ open: true, student: child })}
                            className="flex-1 px-3 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors dark:bg-secondary-900/30 dark:text-secondary-300 dark:hover:bg-secondary-800/30"
                          >
                            Daily Reports
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
                <Card.Description>Communicate with your child's teachers</Card.Description>
              </Card.Header>
              <Card.Body padding="none">
                <MessageComposer
                  user={user}
                  contacts={parentContacts}
                  isTeacher={false}
                  initialContact={initialContactRef.current}
                />
              </Card.Body>
            </Card>
          </Tabs.Panel>

          {/* Schedule Tab */}
          <Tabs.Panel tabId="schedule" activeTab={activeTab}>
            <div className="space-y-6">
              <Card>
                <Card.Header>
                  <Card.Title>Upcoming Events</Card.Title>
                  <Card.Description>Stay updated with school activities</Card.Description>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-4">
                    {activities.map((event) => (
                      <div key={event.id} className="flex items-center space-x-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
                          <span className="text-xl">📅</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{event.title}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{event.date} at {event.time}</p>
                        </div>
                        <Badge variant="outline" size="sm">Upcoming</Badge>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Tabs.Panel>

          {/* Announcements Tab */}
          <Tabs.Panel tabId="announcements" activeTab={activeTab}>
            <Card>
              <Card.Header>
                <Card.Title>School Announcements</Card.Title>
                <Card.Description>Important updates from the school</Card.Description>
              </Card.Header>
              <Card.Body padding="none">
                <AnnouncementsView userRole="parent" />
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </FloatingActionButton>

      {/* Modals */}
      {examModal.open && (
        <ParentExamResultsModal
          student={examModal.student}
          isOpen={examModal.open}
          onClose={() => setExamModal({ open: false, student: null })}
        />
      )}

      {dailyModal.open && (
        <ParentDailyReportsModal
          student={dailyModal.student}
          isOpen={dailyModal.open}
          onClose={() => setDailyModal({ open: false, student: null })}
        />
      )}

      {/* Quick Message Modal */}
      <Modal
        isOpen={showQuickMessage}
        onClose={() => setShowQuickMessage(false)}
        title="Quick Message"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Send a quick message to your child's teacher
          </p>
          <div className="space-y-3">
            <select className="w-full px-3 py-2 border border-neutral-300 rounded-xl dark:border-neutral-600 dark:bg-neutral-800">
              <option>Select a teacher...</option>
              {students.map(child => (
                <option key={child.id} value={child.teacher}>{child.teacher} ({child.name})</option>
              ))}
            </select>
            <textarea 
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl h-24 resize-none dark:border-neutral-600 dark:bg-neutral-800" 
              placeholder="Type your message here..."
            />
          </div>
        </div>
        <Modal.Footer>
          <button 
            onClick={() => setShowQuickMessage(false)}
            className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => setShowQuickMessage(false)}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Send Message
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ParentDashboard;

      if (data && data.success) {
        setStudents(data.students || []);
        // fetch exams per child
        const results = {};
        for (const s of data.students || []) {
          try {
            const r = await api.get(`/exams/${s.id}`);
            results[s.id] = r.data.results || [];
          } catch (err) {
            // ignore single child exam fetch errors
            results[s.id] = results[s.id] || [];
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
      // Use the new common messages API endpoint
      const { data } = await api.get(`/messages?otherUserId=${user.id}`);
      if (data && data.status === 'success') setMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch parent contacts and normalize shape to match MessageComposer expectations.
   *
   * Expectation for MessageComposer when user is a parent:
   *  contacts = [
   *    {
   *      studentId,
   *      studentName,
   *      teachers: [
   *        { teacherId, teacherName, studentId, studentName }
   *      ]
   *    }, ...
   *  ]
   *
   * This function is defensive: it handles different possible shapes from the backend.
   */
  const fetchParentContacts = async () => {
    try {
      const { data } = await api.get('/messages/parent/contacts');
      if (data && data.status === 'success') {
        const rawChildren = data.children || data.students || [];

        const normalized = (rawChildren || []).map(child => {
          const studentId = child.id ?? child.studentId ?? child.student_id;
          const studentName = child.name ?? child.studentName ?? child.student_name ?? child.student_name_display;
          // Teachers array could be named `teachers` or `mapped_teachers` etc.
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
      console.error('Error fetching schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to open Message tab and optionally instruct MessageComposer to pre-select a contact
  // Note: MessageComposer needs to accept an initialContact prop to auto-select (see comment).
  const openMessageFor = (teacher, student) => {
    // Save the initial contact to a ref so we can pass it into MessageComposer.
    // Format is what our MessageComposer expects for a parent: child objects with teacher entries
    initialContactRef.current = {
      studentId: student.studentId || student.id,
      studentName: student.studentName || student.name,
      teacherId: teacher.teacherId || teacher.id,
      teacherName: teacher.teacherName || teacher.name
    };

    // Switch to messages tab
    setActiveTab('messages');
  };

  return (
    <div className="parent-dashboard">
      <div className="dashboard-header">
        <h1>Parent Dashboard</h1>
        <p>Stay connected with your child's learning journey</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'children' ? 'active' : ''}`}
          onClick={() => setActiveTab('children')}
        >
          👶 My Children
        </button>
        <button 
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Messages {messages.length > 0 && `(${messages.length})`}
        </button>
        <button 
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Schedule
        </button>
        <button 
          className={`tab ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          📢 Announcements
        </button>
      </div>

      <div className="dashboard-body">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="card-grid">
              <div className="dashboard-card">
                <h3>👶 My Children</h3>
                <div className="card-number">{students.length}</div>
                <p>Enrolled</p>
              </div>
              <div className="dashboard-card">
                <h3>✅ Present Today</h3>
                <div className="card-number">{students.length}</div>
                <p>Attended today</p>
              </div>
              <div className="dashboard-card">
                <h3>💬 New Messages</h3>
                <div className="card-number">2</div>
                <p>From teachers</p>
              </div>
              <div className="dashboard-card">
                <h3>📋 This Week</h3>
                <div className="card-number">5</div>
                <p>Activities planned</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'children' && (
          <div className="children-section">
            <div className="section-header">
              <h3>My Children</h3>
              <span className="info-text">Phone: {user.phone}</span>
            </div>

            {loading && <p>Loading children data...</p>}
            {error && (
              <div>
                <p style={{color: 'red'}}>Error: {error}</p>
                <button onClick={fetchMyChildren}>Retry</button>
              </div>
            )}

            <div className="students-grid">
              {students.length > 0 ? (
                students.map(student => (
                  <div key={student.id} className="student-card">
                    <h4>{student.name}</h4>
                    <p><strong>Age:</strong> {student.age} years</p>
                    <p><strong>Class:</strong> {student.class_name}</p>
                    <p><strong>Teacher:</strong> {student.teacher_name}</p>
                    {student.date_of_birth && (
                      <p><strong>DOB:</strong> {new Date(student.date_of_birth).toLocaleDateString()}</p>
                    )}
                    {student.emergency_contact && (
                      <p><strong>Emergency Contact:</strong> {student.emergency_contact}</p>
                    )}
                    <div className="student-actions">
                      <button className="action-btn" onClick={() => setExamModal({ open: true, student })}>📊 Performance</button>
                      <button className="action-btn" onClick={() => setDailyModal({ open: true, student })}>📄 Reports</button>

                      {/* Message Teacher - if teachers are included in student object, we let parent pick one.
                          On click we open Messages tab and optionally pre-select the teacher and student.
                          The actual auto-select behavior requires MessageComposer to accept an initialContact prop.
                          If you don't want auto-select, keep this button simple by removing openMessageFor call. */}
                      <button
                        className="action-btn"
                        onClick={() => {
                          // prepare to open messages and pre-select the first teacher if there is one
                          const teacher = (student.teachers && student.teachers[0]) || { teacherId: student.teacher_id || student.teacherId, teacherName: student.teacher_name || student.teacherName };
                          openMessageFor(teacher, { studentId: student.id, studentName: student.name });
                        }}
                      >
                        💬 Message Teacher
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                !loading && !error && (
                  <div className="no-children">
                    <p>No children found for phone number: {user.phone}</p>
                    <p>Please contact the school if this seems incorrect.</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-section">
            {/* Pass parentContacts in normalized shape */}
            <MessageComposer
              user={user}
              contacts={parentContacts}
              isTeacher={false}
              // Optional: pass initialContact if you want MessageComposer to pre-select a conversation
              initialContact={initialContactRef.current}
            />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-section">
            <div className="section-header">
              <h3>This Week's Schedule</h3>
            </div>
            <div className="schedule-list">
              <div className="schedule-item">
                <div className="schedule-day">Announcements</div>
                <div className="schedule-activities">
                  {announcements.map(a => (
                    <p key={a.id}>📣 {a.title} - {a.content}</p>
                  ))}
                </div>
              </div>
              <div className="schedule-item">
                <div className="schedule-day">Activities</div>
                <div className="schedule-activities">
                  {activities.map(act => (
                    <p key={act.id}>🗓️ {act.title} - {act.scheduled_at ? new Date(act.scheduled_at).toLocaleString() : 'TBD'}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'announcements' && <AnnouncementsView />}
      </div>

      <ParentExamResultsModal
        isOpen={examModal.open}
        onClose={() => setExamModal({ open: false, student: null })}
        student={examModal.student}
        results={examModal.student ? (examResults[examModal.student.id] || []) : []}
      />
      <ParentDailyReportsModal
        isOpen={dailyModal.open}
        onClose={() => setDailyModal({ open: false, student: null })}
        student={dailyModal.student}
      />
    </div>
  );
};

export default ParentDashboard;
