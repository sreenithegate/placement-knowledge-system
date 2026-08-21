import { Link } from 'react-router-dom';
import { Eye, FileText, Calendar } from 'lucide-react';

const KnowledgeCard = ({ article }) => {
  return (
    <div className="knowledge-card">
      <div className="card-header">
        <span className="badge category-badge">{article.category}</span>
        {article.file && <FileText size={18} className="file-icon" title="Contains Attachment" />}
      </div>
      
      <Link to={`/knowledge/${article._id}`} className="card-title-link">
        <h3 className="card-title">{article.title}</h3>
      </Link>
      
      <p className="card-description">
        {article.description.length > 100 
          ? `${article.description.substring(0, 100)}...` 
          : article.description}
      </p>
      
      <div className="card-tags">
        {article.tags.map((tag, index) => (
          <span key={index} className="badge tag-badge">#{tag}</span>
        ))}
      </div>
      
      <div className="card-footer">
        <div className="meta-item">
          <Eye size={16} />
          <span>{article.views} Views</span>
        </div>
        <div className="meta-item">
          <Calendar size={16} />
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCard;