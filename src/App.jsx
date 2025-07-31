

import './App.css';
import Login from './Login';
import ForgotPassword from './ForgotPassword';




import { useState } from 'react';

function App() {
  const [page, setPage] = useState('login');

  if (page === 'forgot') {
    return <ForgotPassword onBack={() => setPage('login')} />;
  }
  return <Login onForgot={() => setPage('forgot')} />;
}

export default App
