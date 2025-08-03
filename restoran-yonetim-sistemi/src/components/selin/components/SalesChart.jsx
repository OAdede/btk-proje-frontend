// src/components/SalesChart.jsx
import React, { useState } from 'react';
import { Card, ButtonGroup, Button } from 'react-bootstrap';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = () => {
  const [mode, setMode] = useState('daily');

  const dataSets = {
    daily: {
      labels: ['Pzt', 'Salı', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      data: [1200, 1500, 1800, 1400, 2000, 2200, 1700],
    },
    weekly: {
      labels: ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta'],
      data: [9800, 10200, 8700, 11000],
    },
    monthly: {
      labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
      data: [42000, 46000, 39000, 51000, 48000, 53000],
    },
  };

  const currentData = dataSets[mode];

  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: `Satışlar (${mode === 'daily' ? 'Günlük' : mode === 'weekly' ? 'Haftalık' : 'Aylık'})`,
        data: currentData.data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text:
          mode === 'daily'
            ? 'Günlük Satışlar'
            : mode === 'weekly'
            ? 'Haftalık Satışlar'
            : 'Aylık Satışlar',
      },
    },
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Satış Grafiği</Card.Title>

        <ButtonGroup className="mb-3">
          <Button
            variant={mode === 'daily' ? 'primary' : 'outline-primary'}
            onClick={() => setMode('daily')}
          >
            Günlük
          </Button>
          <Button
            variant={mode === 'weekly' ? 'primary' : 'outline-primary'}
            onClick={() => setMode('weekly')}
          >
            Haftalık
          </Button>
          <Button
            variant={mode === 'monthly' ? 'primary' : 'outline-primary'}
            onClick={() => setMode('monthly')}
          >
            Aylık
          </Button>
        </ButtonGroup>

        <Line data={chartData} options={options} />
      </Card.Body>
    </Card>
  );
};

export default SalesChart;

