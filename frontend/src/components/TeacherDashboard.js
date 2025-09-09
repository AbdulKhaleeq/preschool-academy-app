import React, { useEffect, useState } from 'react';
import TeacherStudentsView from './TeacherStudentsView';
import api from '../api';
import TeacherExamsTab from './TeacherExamsTab';
import MessageComposer from './MessageComposer'; // New import

const TeacherDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState({ total: 0, presentToday: 0, messages: 0, tests: 0 });
  const [teacherContacts, setTeacherContacts] = useState([]); // New state for teacher contacts

  useEffect(() => {
    const loadOverviewAndContacts = async () => {
      try {
        const [studentsRes, msgsRes, contactsRes] = await Promise.all([
          api.get(`/students/teacher/${encodeURIComponent(user.name)}`),
          api.get(`/messages?otherUserId=${user.id}`), // Fetch messages relevant to the teacher
          api.get('/messages/teacher/contacts') // Fetch teacher contacts
        ]);
        const total = studentsRes.data?.students?.length || 0;
        const messages = msgsRes.data?.messages?.length || 0; // Assuming this count is for unread messages or total messages
        setOverview({ total, presentToday: 0, messages, tests: 0 });
        setTeacherContacts(contactsRes.data?.students || contactsRes.data?.contacts || []);
      } catch (e) {
        console.error("Error loading teacher dashboard data:", e);
      }
    };
    loadOverviewAndContacts();
  }, [user]);

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>👩‍🏫 Teacher Dashboard</h1>
        <p>Manage your classroom and students</p>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👶 My Students
        </button>
        <button 
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Messages
        </button>
        <button 
          className={`tab ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          🎨 Activities
        </button>
        <button 
          className={`tab ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          🧪 Tests & Exams
        </button>
      </div>

      <div className="dashboard-body">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="card-grid">
              <div className="dashboard-card">
                <h3>👶 My Students</h3>
                <div className="card-number">{overview.total}</div>
                <p>In my class</p>
              </div>
              <div className="dashboard-card">
                <h3>✅ Present Today</h3>
                <div className="card-number">{overview.presentToday}</div>
                <p>Students attended</p>
              </div>
              <div className="dashboard-card">
                <h3>💬 Messages</h3>
                <div className="card-number">{overview.messages}</div>
                <p>From parents</p>
              </div>
              <div className="dashboard-card">
                <h3>📋 Activities</h3>
                <div className="card-number">{overview.tests}</div>
                <p>Planned today</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <TeacherStudentsView 
            teacher={{ 
              name: user.name, 
              class_name: user.class_name || 'No class assigned',
              subject: user.subject || 'No subject assigned'
            }}
            onBack={() => setActiveTab('overview')}
            isAdmin={false}
          />
        )}

        {activeTab === 'messages' && (
          <div className="messages-section">
            <MessageComposer 
              user={user} 
              contacts={teacherContacts} 
              isTeacher={true} 
            />
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="activities-section">
            <div className="section-header">
              <h3>🎨 Today's Activities</h3>
              <button className="add-btn">+ Add Activity</button>
            </div>
            <div className="activities-list">
              <div className="activity-item">
                <h4>🎨 Art & Crafts</h4>
                <p>Time: 10:00 AM - 10:30 AM</p>
                <p>Making paper flowers with colored paper</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="exams-section">
            <div className="section-header">
              <h3>🧪 Tests & Exams</h3>
            </div>
            <TeacherExamsTab teacherName={user.name} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
