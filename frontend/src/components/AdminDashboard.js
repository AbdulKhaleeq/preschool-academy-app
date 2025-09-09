import React, { useState, useEffect } from 'react';
import api from '../api';
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
import SearchInput from './SearchInput';
import AdminAnnouncements from './AdminAnnouncements';


const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  const [userPage, setUserPage] = useState(1);
  const pageSize = 10;
  const [phoneQuery, setPhoneQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editStudent, setEditStudent] = useState(null);

  useEffect(() => {
    // Only fetch when tab is active → overview shows zeros until visited
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

  const [programReport, setProgramReport] = useState([]);
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

  const handleTeacherAdded = () => {
    fetchTeachers(); // Refresh teachers list
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
  // Update the teacher in the list
  setTeachers(teachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
};

const handleBackToTeachers = () => {
  setTeacherStudentsView(null);
  setSelectedTeacher(null);
};

  const handleStudentAdded = (newStudent) => {
  // Refresh students list or add to existing list
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

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Complete school management system</p>
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
          👶 All Students
        </button>
        <button 
          className={`tab ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => setActiveTab('teachers')}
        >
          👨‍🏫 All Teachers
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📋 Reports
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
                <h3>👶 Total Students</h3>
                <div className="card-number">{students.length}</div>
                <p>Enrolled</p>
              </div>
              <div className="dashboard-card">
                <h3>👨‍🏫 Total Teachers</h3>
                <div className="card-number">{teachers.length}</div>
                <p>Active</p>
              </div>
              <div className="dashboard-card">
                <h3>👥 Total Users</h3>
                <div className="card-number">{users.length}</div>
                <p>Registered</p>
              </div>
              <div className="dashboard-card">
                <h3>📚 Classes</h3>
                <div className="card-number">5</div>
                <p>Active</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="students-section">
            <div className="section-header">
              <h3>👶 Student Management</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <SearchInput placeholder="Search students" onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  if (!q) { fetchStudents(); return; }
                  setStudents(prev => prev.filter(s => (s.name || '').toLowerCase().includes(q)));
                }} />
                <button className="add-btn" onClick={() => setIsAddStudentModalOpen(true)}>+ Add Student</button>
              </div>
            </div>
            
            {loading && <p>Loading students...</p>}
            {error && activeTab === 'students' && <p style={{color: 'red'}}>{error}</p>}
            
            <div className="students-grid">
              {students.map(student => (
                <div key={student.id} className="student-card admin-card">
                  <h4>{student.name}</h4>
                  <p><strong>Age:</strong> {student.age} years</p>
                  <p><strong>Parent:</strong> {student.parent_phone}</p>
                  <p><strong>Class:</strong> {student.class_name}</p>
                  <p><strong>Teacher:</strong> {student.teacher_name}</p>
                  <div className="admin-actions">
                    <button className="action-btn edit-btn" onClick={() => setEditStudent(student)}>✏️ Edit</button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteStudent(student)}>🗑️ Delete</button>
                    <button className="action-btn" onClick={() => setStudentPerf(student)}>📊 Performance</button>
                    <button className="action-btn" onClick={() => setStudentReports(student)}>📄 Reports</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'teachers' && !teacherStudentsView && (
        <div className="teachers-section">
            <div className="section-header">
              <h3>👨‍🏫 Teacher Management</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <SearchInput placeholder="Search teachers" onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  if (!q) { fetchTeachers(); return; }
                  setTeachers(prev => prev.filter(t => (t.name || '').toLowerCase().includes(q)));
                }} />
                <button className="add-btn" onClick={() => setIsAddTeacherModalOpen(true)}>+ Add Teacher</button>
              </div>
            </div>
    
    {loading && activeTab === 'teachers' && <p>Loading teachers...</p>}
    {error && activeTab === 'teachers' && <p style={{color: 'red'}}>{error}</p>}
    
    <div className="teachers-grid">
      {teachers.length > 0 ? (
        teachers.map(teacher => (
          <div key={teacher.id} className="teacher-card">
            <h4>{teacher.name}</h4>
            <p><strong>Phone:</strong> {teacher.phone_number}</p>
            <p><strong>Email:</strong> {teacher.email || 'Not provided'}</p>
            <p><strong>Class:</strong> {teacher.class_name || 'Not assigned'}</p>
            <p><strong>Subject:</strong> {teacher.subject || 'Not specified'}</p>
            <p><strong>Experience:</strong> {teacher.experience_years || 0} years</p>
            <p><strong>Qualification:</strong> {teacher.qualification || 'Not specified'}</p>
            <div className="admin-actions">
              <button 
                className="action-btn edit-btn"
                onClick={() => handleEditTeacher(teacher)}
              >
                ✏️ Edit
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => handleDeleteTeacher(teacher)}
              >
                🗑️ Delete
              </button>
              <button 
                className="action-btn view-students-btn"
                onClick={() => handleViewTeacherStudents(teacher)}
              >
                👥 Students
              </button>
              {/* Removed teacher performance per requirements */}
            </div>
          </div>
        ))
      ) : (
            <div className="no-data">
            <p>No teachers found. Add your first teacher!</p>
            <small>Click "Add Teacher" to get started</small>
            </div>
        )}
        </div>
    </div>
    )}


        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h3>👥 User Management</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <SearchInput placeholder="Search phone" onChange={(e) => { setPhoneQuery(e.target.value.trim()); setUserPage(1); }} />
                <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setUserPage(1); }} style={{ padding: '10px 12px', borderRadius: 9999, border: '2px solid #e0e0e0' }}>
                  <option value="">All Roles</option>
                  <option value="parent">Parent</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setUserPage(1); }} style={{ padding: '10px 12px', borderRadius: 9999, border: '2px solid #e0e0e0' }}>
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
                <button className="add-btn" onClick={() => setIsAddUserOpen(true)}>+ Add User</button>
              </div>
            </div>

            {(() => {
              const filtered = users.filter(u => {
                if (phoneQuery && !(u.phone_number || '').includes(phoneQuery)) return false;
                if (roleFilter && u.role !== roleFilter) return false;
                if (statusFilter) {
                  const isActive = statusFilter === 'active';
                  if (!!u.is_active !== isActive) return false;
                }
                return true;
              });
              const start = (userPage - 1) * pageSize;
              const page = filtered.slice(start, start + pageSize);
              const canNext = start + pageSize < filtered.length;
              const canPrev = userPage > 1;
              return (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #eee' }}>Name</th>
                          <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #eee' }}>Phone</th>
                          <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #eee' }}>Role</th>
                          <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #eee' }}>Status</th>
                          <th style={{ textAlign: 'right', padding: 12, borderBottom: '1px solid #eee' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {page.map(user => (
                          <tr key={user.id} style={{ background: '#fff' }}>
                            <td style={{ padding: 12 }}>{user.name || '-'}</td>
                            <td style={{ padding: 12 }}>{user.phone_number}</td>
                            <td style={{ padding: 12 }}>{user.role}</td>
                            <td style={{ padding: 12 }}>{user.is_active ? '🟢 Active' : '🔴 Blocked'}</td>
                            <td style={{ padding: 12, textAlign: 'right' }}>
                              <button className="action-btn edit-btn" onClick={() => setEditUser(user)} style={{ marginRight: 6 }}>✏️ Edit</button>
                              <button className="action-btn" onClick={() => handleToggleUserActive(user)} style={{ marginRight: 6 }}>
                                {user.is_active ? '🚫 Block' : '✅ Unblock'}
                              </button>
                              <button className="action-btn delete-btn" onClick={() => handleDeleteUser(user)}>🗑️ Delete</button>
                            </td>
                          </tr>
                        ))}
                        {page.length === 0 && (
                          <tr><td colSpan={5} style={{ padding: 12 }}>No users found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                    <button className="action-btn" disabled={!canPrev} onClick={() => setUserPage(p => Math.max(1, p-1))}>Prev</button>
                    <button className="action-btn" disabled={!canNext} onClick={() => setUserPage(p => p+1)}>Next</button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-section">
            <div className="section-header">
              <h3>📋 School Reports</h3>
              <button className="add-btn">📄 Generate Report</button>
            </div>
            
            <div className="reports-grid">
              <div className="report-card" style={{ overflowX: 'auto' }}>
                <h4>📊 Students by Program</h4>
                <p>Distribution of School vs Tuition</p>
                {loading && <p>Loading...</p>}
                {!loading && (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px' }}>Program</th>
                        <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: '8px' }}>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programReport.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{row.program}</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5', textAlign: 'right' }}>{row.count}</td>
                        </tr>
                      ))}
                      {programReport.length === 0 && (
                        <tr>
                          <td colSpan={2} style={{ padding: '8px' }}>No data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'announcements' && <AdminAnnouncements />}
      </div>

      {/* Add Teacher Modal */}
      <AddTeacherModal
        isOpen={isAddTeacherModalOpen}
        onClose={() => setIsAddTeacherModalOpen(false)}
        onTeacherAdded={handleTeacherAdded}
      />

    {isAddStudentModalOpen && (
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onStudentAdded={handleStudentAdded}
      />
    )}

    {activeTab === 'teachers' && teacherStudentsView && (
      <TeacherStudentsView 
        teacher={teacherStudentsView}
        onBack={handleBackToTeachers}
        isAdmin={true}
      />
    )}

    {studentPerf && (
      <StudentPerformanceModal
        isOpen={!!studentPerf}
        onClose={() => setStudentPerf(null)}
        student={studentPerf}
      />
    )}

    {studentReports && (
      <ParentDailyReportsModal
        isOpen={!!studentReports}
        onClose={() => setStudentReports(null)}
        student={studentReports}
      />
    )}

    {isEditTeacherModalOpen && (
      <EditTeacherModal
        isOpen={isEditTeacherModalOpen}
        onClose={() => setIsEditTeacherModalOpen(false)}
        onTeacherUpdated={handleTeacherUpdated}
        teacher={selectedTeacher}
     />
    )}

    {isAddUserOpen && (
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onCreated={() => { setIsAddUserOpen(false); fetchUsers(); }}
      />
    )}

    {editUser && (
      <EditUserModal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        user={editUser}
        onUpdated={() => { setEditUser(null); fetchUsers(); }}
      />
    )}

    {editStudent && (
      <EditStudentModal
        isOpen={!!editStudent}
        student={editStudent}
        onClose={() => setEditStudent(null)}
        onSaved={() => { setEditStudent(null); fetchStudents(); }}
      />
    )}

    <ConfirmModal
      isOpen={confirm.open}
      title={confirm.title}
      message={confirm.message}
      onCancel={() => setConfirm(prev => ({ ...prev, open: false }))}
      onConfirm={confirm.onConfirm}
    />
    </div>
  );
};

export default AdminDashboard;
