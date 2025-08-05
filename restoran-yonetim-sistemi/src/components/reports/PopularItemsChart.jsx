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
import './PopularItemsChart.css';

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
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.text
        }
      }
    },
    backgroundColor: colors.cardBackground,
    elements: {
      arc: {
        backgroundColor: colors.cardBackground
      }
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10
      }
    }
  };

  return (
    <Card className="mb-4 popular-items-chart" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
      <Card.Body>
        <Card.Title className="text-center fs-5 mb-3 popular-items-chart" style={{ color: colors.text }}>🍕 En Çok Satan Ürünler</Card.Title>

        <div className="chart-container popular-items-chart" style={{ maxWidth: '300px', margin: '0 auto', backgroundColor: colors.cardBackground, padding: '10px', borderRadius: '8px', height: '300px', border: `2px solid ${colors.border}`, overflow: 'hidden' }}>
          <div style={{ backgroundColor: colors.cardBackground, width: '100%', height: '100%' }}>
            <Pie data={data} options={options} />
          </div>
        </div>

      </Card.Body>
    </Card>
  );
};

export default PopularItemsChart;
