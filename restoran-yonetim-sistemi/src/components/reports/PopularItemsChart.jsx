// src/components/reports/PopularItemsChart.jsx
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
    labels: ['Adana Kebap', 'Mercimek Çorbası', 'Künefe', 'İskender', 'Sütlaç'],
    datasets: [
      {
        label: 'Satış Adedi',
        data: [45, 30, 25, 20, 18],
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

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white'
        }
      }
    }
  };

  return (
    <Card className="mb-4" style={{ backgroundColor: '#2c3e50', color: 'white' }}>
      <Card.Body>
        <Card.Title className="text-center fs-5 mb-3" style={{ color: 'white' }}>🍕 En Çok Satan Ürünler</Card.Title>

        <div style={{ maxWidth: '300px', margin: '0 auto' }}>
          <Pie data={data} options={options} />
        </div>

      </Card.Body>
    </Card>
  );
};

export default PopularItemsChart;
