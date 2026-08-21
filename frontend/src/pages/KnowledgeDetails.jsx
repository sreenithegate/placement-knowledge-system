import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, Calendar, Eye, Paperclip, FileText, Download, Edit, Trash2 } from 'lucide-react';

const KnowledgeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // Safe helper to read the user from localStorage without crashing
  const getUser = () => {
    try {
      const item = localStorage.getItem('user');
      return item && item !== 'undefined' ? JSON.parse(item) : null;
    } catch  {
      return null;
    }
  };

  const user = getUser();

  useEffect(() => {
    const fetchArticleDetails = async () => {
      try {
        const response = await api.get(`/knowledge/${id}`);
        setArticle(response.data.knowledge);
      } catch (err) {
        setError(err.response?.data?.message || 'Article not found or server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticleDetails();
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this knowledge article? This action cannot be undone.");
    
    if (confirmDelete) {
      setDeleting(true);
      try {
        await api.delete(`/knowledge/${id}`);
        navigate('/dashboard'); 
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete article. Please try again.');
        setDeleting(false);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getOpenUrl = (fileUrl, originalName) => {
    const extension = originalName.split('.').pop()?.toLowerCase();
    const officeExtensions = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
    if (officeExtensions.includes(extension)) {
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
    }
    return fileUrl;
  };

  const handleDownload = async (fileUrl, originalName) => {
    const isPDF = originalName.toLowerCase().endsWith('.pdf') || fileUrl.toLowerCase().endsWith('.pdf');
    if (isPDF) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      return; 
    }

    try {
      setDownloading(true);
      
      const cleanUrl = fileUrl.replace('/fl_attachment/', '/').replace('fl_attachment/', '');
      const response = await fetch(cleanUrl);
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Article...</div>;
  if (error) return (
    <div className="page-container" style={{ textAlign: 'center' }}>
      <h2 style={{ color: '#e74c3c' }}>Error</h2>
      <p>{error}</p>
      <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Back to Home</Link>
    </div>
  );

  const isAuthorOrAdmin = user && (user.id === article.author?._id || user.role === 'admin');

  return (
    <div className="article-container">
      <div className="article-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className="badge category-badge">{article.category}</span>
          
          {isAuthorOrAdmin && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/edit-knowledge/${article._id}`} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Edit size={16} /> Edit
              </Link>
              <button 
                onClick={handleDelete} 
                disabled={deleting}
                className="btn-outline" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', borderColor: '#e74c3c', color: '#e74c3c', cursor: 'pointer', background: 'transparent' }}
              >
                <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
        
        <h1 className="article-main-title">{article.title}</h1>
        
        <div className="article-meta-bar">
          <div className="meta-item-inline">
            <User size={16} />
            <span>{article.author?.name || 'Unknown Author'}</span>
          </div>
          <div className="meta-item-inline">
            <Calendar size={16} />
            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="meta-item-inline">
            <Eye size={16} />
            <span>{article.views} Views</span>
          </div>
        </div>

        {article.tags && article.tags?.length > 0 && (
          <div className="card-tags" style={{ marginTop: '1rem', marginBottom: '0' }}>
            {article.tags.map((tag, index) => (
              <span key={index} className="badge tag-badge">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="article-body">
        <p className="article-description">{article.description}</p>
        <div className="article-content-text">{article.content}</div>
      </div>

      {article.file && article.file.fileUrl && (
        <div className="attachment-box">
          <h3><Paperclip size={20} /> Attached Document</h3>
          <div className="attachment-card">
            <div className="attachment-info">
              <FileText size={24} color="#e67e22" />
              <div>
                <div style={{ wordBreak: 'break-all' }}>{article.file.originalName}</div>
                <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '4px' }}>
                  {formatFileSize(article.file.fileSize)} • {article.file.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                </div>
              </div>
            </div>
            <div className="attachment-actions">
              <a href={getOpenUrl(article.file.fileUrl, article.file.originalName)} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Eye size={16} /> Open
              </a>
              <button 
                onClick={() => handleDownload(article.file.fileUrl, article.file.originalName)} 
                disabled={downloading}
                className="btn-outline" 
                style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: 'transparent' }}
              >
                <Download size={16} /> {downloading ? 'Downloading...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeDetails;