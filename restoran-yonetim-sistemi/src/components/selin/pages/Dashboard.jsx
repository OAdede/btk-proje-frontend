// src/pages/Dashboard.jsx
import React from 'react';
import TableForm from '../components/TableForm';
import TableList from '../components/TableList';

const Dashboard = () => {
  return (
    <div>
      <h2>🪑 Masalar</h2>
      <TableForm />
      <TableList />
    </div>
  );
};

export default Dashboard;
