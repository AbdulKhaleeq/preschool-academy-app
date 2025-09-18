import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, LoadingSpinner, Badge, FloatingActionButton, LoadingCard } from './ui';
import { 
  UsersIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  MegaphoneIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

// Import existing modals (we'll modernize these later)
import AddTeacherModal from './AddTeacherModal';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import EditTeacherModal from './EditTeacherModal';
import TeacherStudentsView from './TeacherStudentsView';
import PerformancePage from './PerformancePage';
import ReportsPage from './ReportsPage';
import ConfirmModal from './ConfirmModal';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import AdminAnnouncements from './AdminAnnouncements';
import FinancialDashboard from './FinancialDashboard';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState('all'); // 'all', 'tuition', 'school'

  // View states
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'performance', 'reports'
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Modal states
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isEditTeacherModalOpen, setIsEditTeacherModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherStudentsView, setTeacherStudentsView] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  
  useEffect(() => {
    if (activeTab === 'students') fetchStudents();
    if (activeTab === 'teachers') fetchTeachers();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/students');
      if (data.success) setStudents(data.students);
    } catch (err) {
      setError('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/teachers');
      if (data.success) setTeachers(data.teachers);
    } catch (err) {
      setError('Error fetching teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      if (data.success) setUsers(data.users);
    } catch (err) {
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  // Load overview data immediately on mount
  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        setLoading(true);
        // Load data needed for overview: students, teachers, and users
        await Promise.all([
          fetchStudents(),
          fetchTeachers(), 
          fetchUsers()
        ]);
      } catch (error) {
        console.error('Error loading admin overview data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOverviewData();
  }, []); // Run once on mount

  // Event handlers
  const handleTeacherAdded = () => {
    fetchTeachers();
  };

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setIsEditTeacherModalOpen(true);
  };

  const handleDeleteTeacher = async (teacher) => {
    setConfirm({
      open: true,
      title: 'Delete Teacher',
      message: `Are you sure you want to delete teacher "${teacher.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const { data } = await api.delete(`/teachers/${teacher.id}`);
          if (data.success) {
            setTeachers(teachers.filter(t => t.id !== teacher.id));
          } else {
            alert(data.message || 'Error deleting teacher');
          }
        } catch (error) {
          console.error('Error deleting teacher:', error);
          alert('Error deleting teacher. Please try again.');
        } finally {
          setConfirm(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleViewTeacherStudents = (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherStudentsView(teacher);
  };

  const handleTeacherUpdated = (updatedTeacher) => {
    setTeachers(teachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
  };

  const handleBackToTeachers = () => {
    setTeacherStudentsView(null);
    setSelectedTeacher(null);
  };

  const handleStudentAdded = () => {
    fetchStudents();
  };

  const handleDeleteStudent = async (student) => {
    setConfirm({
      open: true,
      title: 'Delete Student',
      message: `Are you sure you want to delete ${student.name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const { data } = await api.delete(`/students/${student.id}`);
          if (data.success) {
            setStudents(students.filter(s => s.id !== student.id));
          } else {
            alert(data.message || 'Error deleting student');
          }
        } catch (error) {
          console.error('Error deleting student:', error);
          alert('Error deleting student. Please try again.');
        } finally {
          setConfirm(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleToggleUserActive = async (userObj) => {
    try {
      const { data } = await api.patch(`/users/${userObj.id}/active`, { is_active: !userObj.is_active });
      if (data.success) {
        setUsers(users.map(u => u.id === userObj.id ? data.user : u));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update status');
    }
  };

  const handleDeleteUser = async (userObj) => {
    setConfirm({
      open: true,
      title: 'Delete User',
      message: `Delete user with phone ${userObj.phone_number}?`,
      onConfirm: async () => {
        try {
          const { data } = await api.delete(`/users/${userObj.id}`);
          if (data.success) {
            setUsers(users.filter(u => u.id !== userObj.id));
          } else {
            alert(data.message || 'Error deleting user');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('Failed to delete user');
        } finally {
          setConfirm(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  // Filter data based on search and program
  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (student.parent_phone || '').includes(searchQuery);
    
    const matchesProgram = programFilter === 'all' || 
                          (student.program && student.program.toLowerCase() === programFilter);
    
    return matchesSearch && matchesProgram;
  });

  const filteredTeachers = teachers.filter(teacher => 
    (teacher.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.phone_number || '').includes(searchQuery)
  );

  const filteredUsers = users.filter(user => 
    (user.phone_number || '').includes(searchQuery) ||
    (user.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'students', label: 'Students', icon: AcademicCapIcon },
    { id: 'teachers', label: 'Teachers', icon: UserGroupIcon },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'financials', label: 'Financials', icon: CurrencyDollarIcon },
    { id: 'announcements', label: 'Announcements', icon: MegaphoneIcon },
  ];

  const getAddButtonConfig = () => {
    switch (activeTab) {
      case 'students':
        return { onClick: () => setIsAddStudentModalOpen(true), label: 'Add Student' };
      case 'teachers':
        return { onClick: () => setIsAddTeacherModalOpen(true), label: 'Add Teacher' };
      case 'users':
        return { onClick: () => setIsAddUserOpen(true), label: 'Add User' };
      default:
        return null;
    }
  };

  const addButtonConfig = getAddButtonConfig();

  // Conditional rendering for full-page views
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-3 h-3 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">
                Admin Panel
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="grid grid-cols-6 gap-0">
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
                  flex items-center justify-center px-1 py-3 border-b-2 transition-all duration-200
                  ${activeTab === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Admin Panel
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
                    ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600' 
                    : 'text-gray-700 hover:bg-gray-100'
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
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  Admin Panel
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
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
          {/* Content header for non-overview tabs */}
          {activeTab !== 'overview' && (
            <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {sidebarItems.find(item => item.id === activeTab)?.label}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Manage your school's {activeTab}
                  </p>
                </div>

                {(activeTab === 'students' || activeTab === 'teachers' || activeTab === 'users') && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    {/* Program Filter for Students */}
                    {activeTab === 'students' && (
                      <div className="relative flex-shrink-0">
                        <select
                          value={programFilter}
                          onChange={(e) => setProgramFilter(e.target.value)}
                          className="w-full sm:w-auto pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none cursor-pointer"
                        >
                          <option value="all">All Programs</option>
                          <option value="tuition">Tuition</option>
                          <option value="school">School</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content area */}
          <div className={`flex-1 overflow-y-auto ${activeTab === 'overview' ? 'p-4 lg:p-6' : 'p-6'}`}>
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
                                    {activeTab === 'overview' && <OverviewContent students={students} teachers={teachers} users={users} onNavigateToTab={setActiveTab} onAddStudent={() => setIsAddStudentModalOpen(true)} onAddTeacher={() => setIsAddTeacherModalOpen(true)} onAddUser={() => setIsAddUserOpen(true)} />}
                  {activeTab === 'students' && <StudentsContent students={filteredStudents} loading={loading} onDelete={handleDeleteStudent} onEdit={setEditStudent} onViewPerformance={(student) => {
                    setSelectedStudent(student);
                    setCurrentView('performance');
                  }} onViewReports={(student) => {
                    setSelectedStudent(student);
                    setCurrentView('reports');
                  }} />}
                  {activeTab === 'teachers' && !teacherStudentsView && <TeachersContent teachers={filteredTeachers} loading={loading} onEdit={handleEditTeacher} onDelete={handleDeleteTeacher} onViewStudents={handleViewTeacherStudents} />}
                  {activeTab === 'teachers' && teacherStudentsView && <TeacherStudentsView 
                    user={teacherStudentsView} 
                    onBack={handleBackToTeachers} 
                    isAdmin={true}
                    onPerformanceClick={(student) => {
                      setSelectedStudent(student);
                      setCurrentView('performance');
                    }}
                    onReportsClick={(student) => {
                      setSelectedStudent(student);
                      setCurrentView('reports');
                    }}
                  />}
                  {activeTab === 'users' && <UsersContent users={filteredUsers} loading={loading} onToggleActive={handleToggleUserActive} onDelete={handleDeleteUser} onEdit={setEditUser} />}
                  {activeTab === 'financials' && <FinancialDashboard />}
                  {activeTab === 'announcements' && <AdminAnnouncements />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Floating Action Button */}
          {addButtonConfig && (
            <FloatingActionButton onClick={addButtonConfig.onClick}>
              <PlusIcon className="h-6 w-6" />
            </FloatingActionButton>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddTeacherModal 
        isOpen={isAddTeacherModalOpen}
        onClose={() => setIsAddTeacherModalOpen(false)}
        onTeacherAdded={handleTeacherAdded}
      />
      
      <AddStudentModal 
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onStudentAdded={handleStudentAdded}
      />

      <EditTeacherModal 
        isOpen={isEditTeacherModalOpen}
        onClose={() => setIsEditTeacherModalOpen(false)}
        teacher={selectedTeacher}
        onTeacherUpdated={handleTeacherUpdated}
      />

      <EditStudentModal 
        isOpen={editStudent}
        onClose={() => setEditStudent(null)}
        student={editStudent}
        onStudentUpdated={fetchStudents}
      />

      <AddUserModal 
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserAdded={fetchUsers}
      />

      <EditUserModal 
        isOpen={editUser}
        onClose={() => setEditUser(null)}
        user={editUser}
        onUserUpdated={fetchUsers}
      />

      <ConfirmModal 
        isOpen={confirm.open}
        onClose={() => setConfirm(prev => ({ ...prev, open: false }))}
        onCancel={() => setConfirm(prev => ({ ...prev, open: false }))}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
      />
    </div>
  );
};

// Overview Content Component
const OverviewContent = ({ students, teachers, users, onNavigateToTab, onAddStudent, onAddTeacher, onAddUser }) => {
  const stats = [
    { title: 'Total Students', value: students.length, icon: AcademicCapIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Teachers', value: teachers.length, icon: UserGroupIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Total Users', value: users.length, icon: UsersIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h2>
        <p className="text-gray-600">
          Welcome back! Here's your school's overview and quick actions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                    <div className="text-xl md:text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500">
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Button 
            variant="secondary" 
            className="flex flex-col items-center justify-center p-4 h-20"
            onClick={onAddStudent}
          >
            <AcademicCapIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Add Student</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center justify-center p-4 h-20"
            onClick={onAddTeacher}
          >
            <UserGroupIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Add Teacher</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center justify-center p-4 h-20"
            onClick={onAddUser}
          >
            <UsersIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Add User</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center justify-center p-4 h-20"
            onClick={() => onNavigateToTab('financials')}
          >
            <CurrencyDollarIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Financials</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Students Content Component
const StudentsContent = ({ students, loading, onDelete, onEdit, onViewPerformance, onViewReports }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <LoadingCard key={i} />)}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new student.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {students.map((student, index) => (
        <motion.div
          key={student.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card hover className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {student.name}
              </h4>
              <Badge variant="primary">{student.age} years</Badge>
            </div>
            
            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <p><span className="font-medium">Parent:</span> {student.parent_phone}</p>
              <p><span className="font-medium">Class:</span> {student.class_name}</p>
              <p><span className="font-medium">Teacher:</span> {student.teacher_name}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(student)}>
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onViewPerformance(student)}>
                <ChartBarIcon className="h-4 w-4 mr-1" />
                Performance
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onViewReports(student)}>
                <EyeIcon className="h-4 w-4 mr-1" />
                Reports
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(student)} className="text-red-600 hover:text-red-700">
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Teachers Content Component
const TeachersContent = ({ teachers, loading, onEdit, onDelete, onViewStudents }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <LoadingCard key={i} />)}
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new teacher.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teachers.map((teacher, index) => (
        <motion.div
          key={teacher.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card hover className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {teacher.name}
              </h4>
              <Badge variant="success">{teacher.experience_years || 0} years exp.</Badge>
            </div>
            
            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <p><span className="font-medium">Phone:</span> {teacher.phone_number}</p>
              <p><span className="font-medium">Email:</span> {teacher.email || 'Not provided'}</p>
              <p><span className="font-medium">Class:</span> {teacher.class_name || 'Not assigned'}</p>
              <p><span className="font-medium">Subject:</span> {teacher.subject || 'Not specified'}</p>
              <p><span className="font-medium">Qualification:</span> {teacher.qualification || 'Not specified'}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(teacher)}>
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onViewStudents(teacher)}>
                <UsersIcon className="h-4 w-4 mr-1" />
                Students
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(teacher)} className="text-red-600 hover:text-red-700">
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Users Content Component
const UsersContent = ({ users, loading, onToggleActive, onDelete, onEdit }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  if (loading) {
    return <LoadingSpinner size="lg" className="mx-auto mt-8 text-primary-600" />;
  }

  const toggleDropdown = (userId) => {
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name || 'N/A'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone_number}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Badge variant={user.role === 'admin' ? 'error' : user.role === 'teacher' ? 'warning' : 'info'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Badge variant={user.is_active ? 'success' : 'error'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() => toggleDropdown(user.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                    </button>

                    {openDropdown === user.id && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdown(null)}
                        />
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                onToggleActive(user);
                                setOpenDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                onEdit(user);
                                setOpenDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onDelete(user);
                                setOpenDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AdminDashboard;
