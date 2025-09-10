import React from 'react';
import ParentDashboard from './ParentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = ({ user, onLogout, isDarkMode, toggleDarkMode }) => {
  const renderDashboard = () => {
    switch(user.role) {
      case 'parent':
        return <ParentDashboard user={user} isDarkMode={isDarkMode} />;
      case 'teacher':
        return <TeacherDashboard user={user} isDarkMode={isDarkMode} />;
      case 'admin':
        return <AdminDashboard user={user} isDarkMode={isDarkMode} />;
      default:
        return <div className="flex items-center justify-center min-h-screen text-neutral-600 dark:text-neutral-400">Invalid user role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
      {/* Modern Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-b border-neutral-200/60 dark:border-neutral-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🎓</span>
              </div>
              <h2 className="text-xl font-semibold font-display bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Preschool Academy
              </h2>
            </div>

            {/* Right Side - User info and actions */}
            <div className="flex items-center space-x-4">
              {/* User Welcome */}
              <div className="hidden sm:block text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Welcome, </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                  {user.role}
                </span>
                <span className="text-neutral-600 dark:text-neutral-400"> 👋</span>
              </div>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* Logout Button */}
              <button 
                onClick={onLogout} 
                className="inline-flex items-center px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 transition-all duration-200 active:scale-95"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Dashboard;
