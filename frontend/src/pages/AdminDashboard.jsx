import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, BookOpen, Eye } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUser = () => {
    try {
      const item = localStorage.getItem('user');
      if (!item || item === 'undefined' || item === 'null') return null;
      return JSON.parse(item);
    } catch {
      return null;
    }
  };

  const user = getUser();

  const fetchAdminData = useCallback(async () => {
    try {
      const [overviewRes, usersRes] = await Promise.all([
        api.get('/admin/overview').catch(() => ({ data: {} })),
        api.get('/admin/users').catch(() => ({ data: [] }))
      ]);
      setOverview(overviewRes.data);
      setUsersList(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdminData();
  }, [navigate, user, fetchAdminData]);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsersList(prev =>
        prev.map(u => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Admin Panel...</div>;

  return (
    <div className="admin-container" style={{ padding: '20px' }}>
      <h2>Admin Management Portal</h2>
      <div className="stats-grid" style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
        <div className="stat-card">
          <BookOpen size={24} />
          <h3>Total Articles</h3>
          <p>{overview?.totalArticles || 0}</p>
        </div>
        <div className="stat-card">
          <Users size={24} />
          <h3>Total Users</h3>
          <p>{overview?.totalUsers || usersList.length}</p>
        </div>
        <div className="stat-card">
          <Eye size={24} />
          <h3>Total Views</h3>
          <p>{overview?.totalViews || 0}</p>
        </div>
      </div>

      <h3>Registered Users</h3>
      <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {usersList.map(u => (
            <tr key={u._id} style={{ borderBottom: '1px solid #eee', height: '40px' }}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
              <td>
                <button
                  onClick={() => handleRoleChange(u._id, u.role)}
                  style={{ padding: '4px 8px', cursor: 'pointer' }}
                >
                  Make {u.role === 'admin' ? 'Student' : 'Admin'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;