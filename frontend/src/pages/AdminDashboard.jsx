import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, BookOpen, Eye } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      const [overviewRes, usersRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users')
      ]);
      setOverview(overviewRes.data.overview);
      setUsersList(usersRes.data.users);
    } catch (err) {
      setError('Failed to fetch admin data. Ensure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    
    // Prevent admin from accidentally demoting themselves
    if (userId === user.id && newRole === 'student') {
      alert("You cannot remove your own admin privileges here.");
      return;
    }

    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      // Refresh the user list after successful change
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Admin Panel...</div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red', marginTop: '50px' }}>{error}</div>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header" style={{ color: '#e74c3c' }}>Administrator Control Panel</h2>
      
      {/* Overview Statistics */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTopColor: '#e74c3c' }}>
          <h3><Users size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Total Users</h3>
          <p>{overview.totalUsers}</p>
        </div>
        <div className="stat-card" style={{ borderTopColor: '#e74c3c' }}>
          <h3><BookOpen size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Total Articles</h3>
          <p>{overview.totalArticles}</p>
        </div>
        <div className="stat-card" style={{ borderTopColor: '#e74c3c' }}>
          <h3><Eye size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Platform Views</h3>
          <p>{overview.totalViews}</p>
        </div>
      </div>

      {/* User Management Table */}
      <div className="admin-table-container">
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>User Management</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Joined Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'tag-badge' : 'category-badge'}`} style={{ backgroundColor: u.role === 'admin' ? '#ffeaa7' : '#e1f5fe', color: '#2d3436' }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => handleRoleChange(u._id, u.role)}
                    className={`btn-small ${u.role === 'admin' ? 'btn-demote' : 'btn-promote'}`}
                    disabled={u._id === user.id} // Disable action for the current user
                    style={{ opacity: u._id === user.id ? 0.5 : 1 }}
                  >
                    {u.role === 'admin' ? 'Make Student' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;