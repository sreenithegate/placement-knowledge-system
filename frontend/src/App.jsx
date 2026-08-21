import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KnowledgeList from './pages/KnowledgeList';
import AddKnowledge from './pages/AddKnowledge';
import KnowledgeDetails from './pages/KnowledgeDetails';
import EditKnowledge from './pages/EditKnowledge';
import AdminDashboard from './pages/AdminDashboard'; // New Import

const NotFound = () => <div style={{ padding: '2rem' }}><h2>404 - Page Not Found</h2></div>;

function App() {
  return (
    <div>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<KnowledgeList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-knowledge" element={<AddKnowledge />} />
          <Route path="/knowledge/:id" element={<KnowledgeDetails />} />
          <Route path="/edit-knowledge/:id" element={<EditKnowledge />} />
          <Route path="/admin" element={<AdminDashboard />} /> {/* New Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;