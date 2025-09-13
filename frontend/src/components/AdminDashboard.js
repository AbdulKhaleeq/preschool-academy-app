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
  Bars3Icon
} from '@heroicons/react/24/outline';

// Import existing modals (we'll modernize these later)
import AddTeacherModal from './AddTeacherModal';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import EditTeacherModal from './EditTeacherModal';
import TeacherStudentsView from './TeacherStudentsView';
import StudentPerformanceModal from './StudentPerformanceModal';
import ParentDailyReportsModal from './ParentDailyReportsModal';
import ConfirmModal from './ConfirmModal';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import AdminAnnouncements from './AdminAnnouncements';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isEditTeacherModalOpen, setIsEditTeacherModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherStudentsView, setTeacherStudentsView] = useState(null);
  const [studentPerf, setStudentPerf] = useState(null);
  const [studentReports, setStudentReports] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [programReport, setProgramReport] = useState([]);

  useEffect(() => {
    if (activeTab === 'students') fetchStudents();
    if (activeTab === 'teachers') fetchTeachers();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'reports') fetchReports();
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

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reports/students-by-program');
      if (data.success) setProgramReport(data.data || []);
    } catch (e) {
      setError('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

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

  // Filter data based on search
  const filteredStudents = students.filter(student => 
    (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.parent_phone || '').includes(searchQuery)
  );

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
    { id: 'reports', label: 'Reports', icon: ChartBarIcon },
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Admin Panel
          </h2>
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
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {sidebarItems.find(item => item.id === activeTab)?.label}
          </h1>
        </div>

        {/* Content header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your school's {activeTab}
              </p>
            </div>

            {(activeTab === 'students' || activeTab === 'teachers' || activeTab === 'users') && (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && <OverviewContent students={students} teachers={teachers} users={users} />}
              {activeTab === 'students' && <StudentsContent students={filteredStudents} loading={loading} onDelete={handleDeleteStudent} onEdit={setEditStudent} onViewPerformance={setStudentPerf} onViewReports={setStudentReports} />}
              {activeTab === 'teachers' && !teacherStudentsView && <TeachersContent teachers={filteredTeachers} loading={loading} onEdit={handleEditTeacher} onDelete={handleDeleteTeacher} onViewStudents={handleViewTeacherStudents} />}
              {activeTab === 'teachers' && teacherStudentsView && <TeacherStudentsView teacher={teacherStudentsView} onBack={handleBackToTeachers} isAdmin={true} />}
              {activeTab === 'users' && <UsersContent users={filteredUsers} loading={loading} onToggleActive={handleToggleUserActive} onDelete={handleDeleteUser} onEdit={setEditUser} />}
              {activeTab === 'reports' && <ReportsContent programReport={programReport} loading={loading} />}
              {activeTab === 'announcements' && <AdminAnnouncements />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Action Button */}
        {addButtonConfig && (
          <FloatingActionButton onClick={addButtonConfig.onClick}>
            <PlusIcon className="h-6 w-6" />
          </FloatingActionButton>
        )}
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
        isOpen={!!editStudent}
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
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        user={editUser}
        onUserUpdated={fetchUsers}
      />

      <StudentPerformanceModal 
        isOpen={!!studentPerf}
        onClose={() => setStudentPerf(null)}
        student={studentPerf}
      />

      <ParentDailyReportsModal 
        isOpen={!!studentReports}
        onClose={() => setStudentReports(null)}
        student={studentReports}
      />

      <ConfirmModal 
        isOpen={confirm.open}
        onClose={() => setConfirm(prev => ({ ...prev, open: false }))}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
      />
    </div>
  );
};

// Overview Content Component
const OverviewContent = ({ students, teachers, users }) => {
  const stats = [
    { title: 'Total Students', value: students.length, icon: AcademicCapIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Teachers', value: teachers.length, icon: UserGroupIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Total Users', value: users.length, icon: UsersIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Active Classes', value: 5, icon: ChartBarIcon, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
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
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No students</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new student.</p>
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
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {student.name}
              </h4>
              <Badge variant="primary">{student.age} years</Badge>
            </div>
            
            <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
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
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No teachers</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new teacher.</p>
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
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {teacher.name}
              </h4>
              <Badge variant="success">{teacher.experience_years || 0} years exp.</Badge>
            </div>
            
            <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
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
  if (loading) {
    return <LoadingSpinner size="lg" className="mx-auto mt-8 text-primary-600" />;
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.phone_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <Badge variant={user.role === 'admin' ? 'error' : user.role === 'teacher' ? 'warning' : 'info'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <Badge variant={user.is_active ? 'success' : 'error'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleActive(user)}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(user)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
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

// Reports Content Component
const ReportsContent = ({ programReport, loading }) => {
  if (loading) {
    return <LoadingCard className="max-w-2xl mx-auto" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Students by Program
        </h3>
        {programReport.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No program data available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programReport.map((program, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {program.program_name || 'Unknown Program'}
                </h4>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {program.student_count}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">students enrolled</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
