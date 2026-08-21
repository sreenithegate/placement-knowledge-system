import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className="nav-item" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Placement KMS</Link>
        {user && (
          <>
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            <Link to="/add-knowledge" className="nav-item" style={{ color: '#f1c40f', fontWeight: 'bold' }}>+ Add Knowledge</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-item" style={{ color: '#e74c3c', fontWeight: 'bold', marginLeft: '5px' }}>Admin Panel</Link>
            )}
          </>
        )}
      </div>
      
      <div className="nav-links">
        {user ? (
          <>
            <span style={{ color: '#3498db', fontWeight: '500' }}>Hello, {user.name}</span>
            <button 
              onClick={handleLogout} 
              style={{ background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/register" className="nav-item">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;