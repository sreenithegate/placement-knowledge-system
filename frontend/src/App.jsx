import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/KnowledgeList';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddKnowledge from './pages/AddKnowledge';
import KnowledgeDetails from './pages/KnowledgeDetails';
import EditKnowledge from './pages/EditKnowledge';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-knowledge" element={<AddKnowledge />} />
            <Route path="/knowledge/:id" element={<KnowledgeDetails />} />
            <Route path="/edit-knowledge/:id" element={<EditKnowledge />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;