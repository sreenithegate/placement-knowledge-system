import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, X } from 'lucide-react';

const CATEGORIES = [
  'Programming', 'Data Structures & Algorithms', 'DBMS', 'Operating Systems', 
  'Computer Networks', 'Software Engineering', 'Aptitude', 'Reasoning', 
  'Verbal Ability', 'Technical Interview', 'HR Interview', 'Resume Preparation', 
  'Placement Experiences', 'Projects', 'Best Practices', 'Other'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const EditKnowledge = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', description: '', content: '', category: '', tags: ''
  });
  
  const [currentFile, setCurrentFile] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Moved inside useEffect so it doesn't cause infinite re-renders on every keystroke
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      navigate('/login');
      return;
    }

    const fetchArticle = async () => {
      try {
        const response = await api.get(`/knowledge/${id}`);
        const article = response.data.knowledge;
        
        if (user.role !== 'admin' && user.id !== article.author._id) {
          navigate(`/knowledge/${id}`);
          return;
        }

        setFormData({
          title: article.title,
          description: article.description,
          content: article.content,
          category: article.category,
          tags: article.tags ? article.tags.join(', ') : ''
        });

        if (article.file) {
          setCurrentFile(article.file);
        }
      } catch { 
        setError('Failed to load article details.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, navigate]); // user is completely removed from this dependency array

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must not exceed 10 MB.');
      setNewFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError('');
    setNewFile(selectedFile);
  };

  const clearNewFile = () => {
    setNewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('content', formData.content);
      data.append('category', formData.category);
      data.append('tags', formData.tags);
      
      if (newFile) {
        data.append('file', newFile);
      }

      await api.put(`/knowledge/${id}`, data);
      navigate(`/knowledge/${id}`); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update knowledge.');
    } finally {
      setSaving(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Editor...</div>;

  return (
    <div className="page-container">
      <h2 className="page-title">Edit Knowledge Article</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required maxLength="160" />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <input type="text" name="description" value={formData.description} onChange={handleChange} required maxLength="500" />
        </div>
        
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Tags</label>
          <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., DBMS, SQL, 1NF" />
        </div>
        
        <div className="form-group">
          <label>Content</label>
          <textarea name="content" value={formData.content} onChange={handleChange} required></textarea>
        </div>

        <div className="form-group">
          <label>Attached Document (Upload a new file to replace the current one)</label>
          
          {currentFile && !newFile && (
            <div className="file-details" style={{ marginBottom: '1rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
              <div className="file-info" style={{ color: '#2c3e50' }}>
                <FileText size={20} />
                <span><strong>Current:</strong> {currentFile.originalName}</span>
              </div>
            </div>
          )}

          <div className="file-upload-container">
            {!newFile ? (
              <>
                <Upload size={32} color="#95a5a6" style={{ marginBottom: '10px' }} />
                <p style={{ color: '#7f8c8d', marginBottom: '10px', fontSize: '0.9rem' }}>
                  {currentFile ? 'Upload a new file to replace the existing attachment' : 'Upload PDF, DOCX, PPTX, or Image (Max 10MB)'}
                </p>
                <label className="file-upload-label">
                  Browse Files
                  <input type="file" className="file-input-hidden" onChange={handleFileChange} ref={fileInputRef} accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg" />
                </label>
              </>
            ) : (
              <div className="file-details">
                <div className="file-info">
                  <FileText size={20} />
                  <span><strong>New:</strong> {newFile.name} ({formatFileSize(newFile.size)})</span>
                </div>
                <button type="button" onClick={clearNewFile} className="remove-file-btn" title="Remove new file">
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '20px' }}>
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditKnowledge;