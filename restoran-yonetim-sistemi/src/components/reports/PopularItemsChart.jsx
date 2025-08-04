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
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const PopularItemsChart = () => {
  const { colors } = useTheme();
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
          color: colors.text
        }
      }
    },
    backgroundColor: colors.cardBackground
  };

  return (
    <Card className="mb-4" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
      <Card.Body>
        <Card.Title className="text-center fs-5 mb-3" style={{ color: colors.text }}>🍕 En Çok Satan Ürünler</Card.Title>

        <div style={{ maxWidth: '300px', margin: '0 auto', backgroundColor: colors.cardBackground, padding: '10px', borderRadius: '8px' }}>
          <Pie data={data} options={options} />
        </div>

      </Card.Body>
    </Card>
  );
};

export default PopularItemsChart;
