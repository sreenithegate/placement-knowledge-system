import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, X } from 'lucide-react';

const CATEGORIES = [
  'Programming', 'Data Structures & Algorithms', 'DBMS', 'Operating Systems', 
  'Computer Networks', 'Software Engineering', 'Aptitude', 'Reasoning', 
  'Verbal Ability', 'Technical Interview', 'HR Interview', 'Resume Preparation', 
  'Placement Experiences', 'Projects', 'Best Practices', 'Other'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AddKnowledge = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', description: '', content: '', category: '', tags: ''
  });
  
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file size on frontend
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must not exceed 10 MB.');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use FormData to handle both text and file uploads
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('content', formData.content);
      data.append('category', formData.category);
      data.append('tags', formData.tags);
      
      if (file) {
        data.append('file', file);
      }

      // Axios automatically sets the correct multipart/form-data boundary when passing a FormData object
      await api.post('/knowledge', data);
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add knowledge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Create Knowledge Article</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input 
            type="text" name="title" value={formData.title} onChange={handleChange} 
            required placeholder="e.g., Database Normalization Basics" maxLength="160"
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <input 
            type="text" name="description" value={formData.description} onChange={handleChange} 
            required placeholder="A short summary of the article..." maxLength="500"
          />
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
          <input 
            type="text" name="tags" value={formData.tags} onChange={handleChange} 
            placeholder="e.g., DBMS, SQL, 1NF (comma separated)"
          />
        </div>
        
        <div className="form-group">
          <label>Content</label>
          <textarea 
            name="content" value={formData.content} onChange={handleChange} 
            required placeholder="Write your detailed article content here..."
          ></textarea>
        </div>

        <div className="form-group">
          <label>Supporting Document (Optional)</label>
          <div className="file-upload-container">
            {!file ? (
              <>
                <Upload size={32} color="#95a5a6" style={{ marginBottom: '10px' }} />
                <p style={{ color: '#7f8c8d', marginBottom: '10px', fontSize: '0.9rem' }}>Upload PDF, DOCX, PPTX, or Image files (Max 10MB)</p>
                <label className="file-upload-label">
                  Browse Files
                  <input 
                    type="file" 
                    className="file-input-hidden" 
                    onChange={handleFileChange} 
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                </label>
              </>
            ) : (
              <div className="file-details">
                <div className="file-info">
                  <FileText size={20} />
                  <span>{file.name} ({formatFileSize(file.size)})</span>
                </div>
                <button type="button" onClick={clearFile} className="remove-file-btn" title="Remove file">
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '20px' }}>
          {loading ? 'Publishing & Uploading...' : 'Add Knowledge'}
        </button>
      </form>
    </div>
  );
};

export default AddKnowledge;