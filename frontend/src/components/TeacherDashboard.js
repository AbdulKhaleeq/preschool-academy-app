import React, { useEffect, useState } from 'react';
import TeacherStudentsView from './TeacherStudentsView';
import api from '../api';
import TeacherExamsTab from './TeacherExamsTab';

const TeacherDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState({ total: 0, presentToday: 0, messages: 0, tests: 0 });

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [studentsRes, msgsRes] = await Promise.all([
          api.get(`/students/teacher/${encodeURIComponent(user.name)}`),
          api.get(`/messages/teacher/${encodeURIComponent(user.name)}`)
        ]);
        const total = studentsRes.data?.students?.length || 0;
        const messages = msgsRes.data?.messages?.length || 0;
        setOverview({ total, presentToday: 0, messages, tests: 0 });
      } catch (e) {}
    };
    loadOverview();
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
          💬 Parent Messages
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
            <div className="section-header">
              <h3>💬 Parent Communications</h3>
              <button className="add-btn">+ New Message</button>
            </div>
            <div className="messages-list">
              <div className="message-item urgent">
                <div className="message-header">
                  <strong>Johnson Family</strong>
                  <span className="message-time">1 hour ago</span>
                  <span className="priority">🔴 Urgent</span>
                </div>
                <p>Emma seems to have a slight fever. Should I pick her up early?</p>
                <button className="reply-btn">Reply</button>
              </div>
            </div>
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
