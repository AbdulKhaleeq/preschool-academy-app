import React, { useState, useEffect } from 'react';
import api from '../api';
import ParentExamResultsModal from './ParentExamResultsModal';
import ParentDailyReportsModal from './ParentDailyReportsModal';
import MessageComposer from './MessageComposer'; // New import

const ParentDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [examResults, setExamResults] = useState({});
  const [examModal, setExamModal] = useState({ open: false, student: null });
  const [dailyModal, setDailyModal] = useState({ open: false, student: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parentContacts, setParentContacts] = useState([]); // New state for parent contacts

  useEffect(() => {
    if (activeTab === 'children') {
      fetchMyChildren();
    }
    if (activeTab === 'messages') {
      fetchMyMessages();
      fetchParentContacts(); // Fetch parent contacts when message tab is active
    }
    if (activeTab === 'schedule') {
      fetchAnnouncementsAndActivities();
    }
  }, [activeTab, user]);

  const fetchMyChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the parent's phone number to get their children
      const { data } = await api.get(`/students/parent/${encodeURIComponent(user.phone)}`);
      
      if (data.success) {
        setStudents(data.students);
        // fetch exams per child
        const results = {};
        for (const s of data.students) {
          try {
            const r = await api.get(`/exams/${s.id}`);
            results[s.id] = r.data.results || [];
          } catch {}
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
      if (data.status === 'success') setMessages(data.messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentContacts = async () => {
    try {
      const { data } = await api.get('/messages/parent/contacts');
      if (data.status === 'success') {
        setParentContacts(data.children || []);
      }
    } catch (err) {
      console.error('Error fetching parent contacts:', err);
    }
  };

  const fetchAnnouncementsAndActivities = async () => {
    try {
      setLoading(true);
      const [ann, act] = await Promise.all([
        api.get('/announcements'),
        api.get('/activities')
      ]);
      if (ann.data.success) setAnnouncements(ann.data.announcements);
      if (act.data.success) setActivities(act.data.activities);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
    } finally {
      setLoading(false);
    }
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
          💬 Messages
        </button>
        <button 
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Schedule
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
                      <button className="action-btn">💬 Message Teacher</button>
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
            <MessageComposer 
              user={user} 
              contacts={parentContacts} 
              isTeacher={false} 
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
