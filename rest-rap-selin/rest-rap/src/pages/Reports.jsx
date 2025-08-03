// src/pages/Reports.jsx
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import SalesChart from '../components/SalesChart';
import PopularItemsChart from '../components/PopularItemsChart';

const Reports = () => {
  return (
    <div>
      <h2 className="mb-4">📊 Raporlar</h2>

      <Row>
        <Col md={6}>
          <SalesChart />
        </Col>
        <Col md={6}>
          <PopularItemsChart />
        </Col>
      </Row>
    </div>
  );
};

export default Reports;


