import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// SAFETY OVERRIDE: Prevent localStorage from returning "undefined" string
const originalGetItem = Storage.prototype.getItem;
Storage.prototype.getItem = function(key) {
  const value = originalGetItem.call(this, key);
  if (value === 'undefined' || value === 'null') {
    return null;
  }
  return value;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);