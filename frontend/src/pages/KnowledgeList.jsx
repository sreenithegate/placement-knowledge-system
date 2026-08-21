import { useState, useEffect } from 'react';
import api from '../services/api';
import KnowledgeCard from '../components/KnowledgeCard';
import { Search } from 'lucide-react';

// Categories matching your backend schema
const CATEGORIES = [
  'Programming', 'Data Structures & Algorithms', 'DBMS', 'Operating Systems', 
  'Computer Networks', 'Software Engineering', 'Aptitude', 'Reasoning', 
  'Verbal Ability', 'Technical Interview', 'HR Interview', 'Resume Preparation', 
  'Placement Experiences', 'Projects', 'Best Practices', 'Other'
];

const KnowledgeList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({ search: '', category: '' });

  const fetchKnowledge = async (query = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/knowledge${query}`);
      // Safely handle different response structures to prevent undefined errors
      const data = response.data;
      const list = Array.isArray(data) 
        ? data 
        : (data.articles || data.knowledge || []);
      setArticles(list);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.search) params.append('search', searchParams.search);
    if (searchParams.category) params.append('category', searchParams.category);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    fetchKnowledge(queryString);
  };

  return (
    <div className="knowledge-board">
      <div className="search-section">
        <h1 style={{ marginBottom: '20px', color: '#2c3e50', textAlign: 'center' }}>Placement Knowledge Base</h1>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by keyword, topic, or tag..." 
              value={searchParams.search}
              onChange={(e) => setSearchParams({...searchParams, search: e.target.value})}
              className="search-input"
            />
          </div>
          
          <select 
            value={searchParams.category}
            onChange={(e) => setSearchParams({...searchParams, category: e.target.value})}
            className="category-select"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <button type="submit" className="btn-primary search-btn">Search</button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Knowledge...</div>
      ) : (
        <>
          {(articles?.length || 0) === 0 ? (
            <div className="empty-state">
              <h3>No articles found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="knowledge-grid">
              {articles?.map(article => (
                <KnowledgeCard key={article._id} article={article} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KnowledgeList;