// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import { Container, Nav, Navbar } from 'react-bootstrap';

const App = () => {
  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>Restoran Paneli</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Masalar</Nav.Link>
            <Nav.Link as={Link} to="/reports">Raporlar</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
