
import { useState } from 'react';
import Login from './Login';
import ForgotPassword from './ForgotPassword';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  if (currentPage === 'forgot') {
    return <ForgotPassword onBack={() => setCurrentPage('login')} />;
  }

  return <Login onForgotPassword={() => setCurrentPage('forgot')} />;
}

export default App;
