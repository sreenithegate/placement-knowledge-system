import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentArticles, setRecentArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Protected Route: If no user is found, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [navigate, user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch both newest and popular articles concurrently
      const [recentRes, popularRes] = await Promise.all([
        api.get('/knowledge?sort=newest&limit=5'),
        api.get('/knowledge?sort=popular&limit=5')
      ]);

      setRecentArticles(recentRes.data.articles);
      setPopularArticles(popularRes.data.articles);

      // Calculate simple stats based on the platform data
      setStats({
        total: recentRes.data.pagination.totalArticles,
        totalViews: popularRes.data.articles.reduce((sum, item) => sum + item.views, 0)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <p style={{ fontSize: '1.5rem', marginTop: '10px', textTransform: 'capitalize' }}>{user.role}</p>
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