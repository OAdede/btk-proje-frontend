// src/components/TableList.jsx
import React from 'react';
import { ListGroup } from 'react-bootstrap';

const TableList = () => {
  const tables = ['Masa 1', 'Masa 2', 'Masa 3'];

  return (
    <div>
      <h5>Mevcut Masalar</h5>
      <ListGroup>
        {tables.map((table, idx) => (
          <ListGroup.Item key={idx}>{table}</ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default TableList;
