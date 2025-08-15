import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BootstrapProvider } from './context/BootstrapContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <BootstrapProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BootstrapProvider>
  </BrowserRouter>
);
