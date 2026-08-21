import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentArticles, setRecentArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalViews: 0 });
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

  const fetchDashboardData = useCallback(async () => {
    try {
      const [recentRes, popularRes] = await Promise.all([
        api.get('/knowledge?sort=newest&limit=5').catch(() => ({ data: {} })),
        api.get('/knowledge?sort=popular&limit=5').catch(() => ({ data: {} }))
      ]);

      const recentList = recentRes.data?.articles || recentRes.data || [];
      const popularList = popularRes.data?.articles || popularRes.data || [];
      const totalArticles = recentRes.data?.pagination?.totalArticles || recentList.length;
      const totalViews = popularList.reduce((sum, item) => sum + (item.views || 0), 0);

      setRecentArticles(recentList);
      setPopularArticles(popularList);
      setStats({ total: totalArticles, totalViews });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, [navigate, user, fetchDashboardData]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">Knowledge Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Platform Articles</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Top Articles Views</h3>
          <p>{stats.totalViews}</p>
        </div>
        <div className="stat-card">
          <h3>Your Role</h3>
          <p style={{ fontSize: '1.5rem', marginTop: '10px', textTransform: 'capitalize' }}>{user?.role || 'Student'}</p>
        </div>
      </div>

      <div className="lists-grid">
        <div className="list-card">
          <h3>Recent Knowledge</h3>
          {recentArticles.length === 0 ? <p>No articles found.</p> : (
            recentArticles.map(article => (
              <div key={article._id} className="article-item">
                <Link to={`/knowledge/${article._id}`} className="article-title">{article.title}</Link>
                <span className="article-meta">{article.category}</span>
              </div>
            ))
          )}
        </div>

        <div className="list-card">
          <h3>Popular Knowledge</h3>
          {popularArticles.length === 0 ? <p>No articles found.</p> : (
            popularArticles.map(article => (
              <div key={article._id} className="article-item">
                <Link to={`/knowledge/${article._id}`} className="article-title">{article.title}</Link>
                <span className="article-meta">{article.views} views</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;