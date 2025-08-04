// src/components/TableForm.jsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const TableForm = () => {
  const [tableName, setTableName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tableName.trim()) {
      alert(`Yeni masa eklendi: ${tableName}`);
      setTableName('');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-3">
      <Form.Group>
        <Form.Label>Masa Adı</Form.Label>
        <Form.Control
          type="text"
          placeholder="Masa 1"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-2">
        Ekle
      </Button>
    </Form>
  );
};

export default TableForm;
