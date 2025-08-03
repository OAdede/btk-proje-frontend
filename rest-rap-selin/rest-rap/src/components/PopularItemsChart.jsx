// src/components/PopularItemsChart.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PopularItemsChart = () => {
  const data = {
    labels: ['Pizza', 'Burger', 'Salata', 'Makarna', 'Tatlı'],
    datasets: [
      {
        label: 'Satış Adedi',
        data: [45, 30, 15, 20, 10],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#66BB6A',
          '#BA68C8',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title className="text-center fs-5 mb-3">🍕 En Çok Satan Ürünler</Card.Title>
        
        <div style={{ maxWidth: '300px', margin: '0 auto' }}>
          <Pie data={data} />
        </div>
        
      </Card.Body>
    </Card>
  );
};

export default PopularItemsChart;

