import React from 'react';
import ParentDashboard from './ParentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = ({ user, onLogout }) => {
  const renderDashboard = () => {
    switch(user.role) {
      case 'parent':
        return <ParentDashboard user={user} />;
      case 'teacher':
        return <TeacherDashboard user={user} />;
      case 'admin':
        return <AdminDashboard user={user} />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>🎓 Preschool Academy</h2>
        </div>
        <div className="nav-user">
          <span>Welcome, {user.role}! 👋</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="dashboard-content">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Dashboard;
