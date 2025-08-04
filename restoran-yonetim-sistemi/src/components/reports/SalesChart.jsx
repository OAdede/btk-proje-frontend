// src/components/reports/SalesChart.jsx
import React, { useState } from 'react';
import { Card, ButtonGroup, Button, Form } from 'react-bootstrap';
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
  const [selectedMonth, setSelectedMonth] = useState('aralik');
  const [selectedYear, setSelectedYear] = useState('2024');

  const months = [
    { value: 'ocak', label: 'Ocak' },
    { value: 'subat', label: 'Şubat' },
    { value: 'mart', label: 'Mart' },
    { value: 'nisan', label: 'Nisan' },
    { value: 'mayis', label: 'Mayıs' },
    { value: 'haziran', label: 'Haziran' },
    { value: 'temmuz', label: 'Temmuz' },
    { value: 'agustos', label: 'Ağustos' },
    { value: 'eylul', label: 'Eylül' },
    { value: 'ekim', label: 'Ekim' },
    { value: 'kasim', label: 'Kasım' },
    { value: 'aralik', label: 'Aralık' },
  ];

  const years = [
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
  ];

  const dataSets = {
    daily: {
      ocak: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1100, 1300, 1600, 1200, 1800, 2000, 1500],
      },
      subat: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1000, 1200, 1400, 1100, 1600, 1800, 1300],
      },
      mart: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1150, 1350, 1650, 1250, 1850, 2050, 1550],
      },
      nisan: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1250, 1450, 1750, 1350, 1950, 2150, 1650],
      },
      mayis: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1300, 1500, 1800, 1400, 2000, 2200, 1700],
      },
      haziran: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1350, 1550, 1850, 1450, 2050, 2250, 1750],
      },
      temmuz: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1400, 1600, 1900, 1500, 2100, 2300, 1800],
      },
      agustos: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1450, 1650, 1950, 1550, 2150, 2350, 1850],
      },
      eylul: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1200, 1400, 1700, 1300, 1900, 2100, 1600],
      },
      ekim: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1250, 1450, 1750, 1350, 1950, 2150, 1650],
      },
      kasim: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1300, 1500, 1800, 1400, 2000, 2200, 1700],
      },
      aralik: {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        data: [1200, 1500, 1800, 1400, 2000, 2200, 1700],
      },
    },
    weekly: {
      ocak: {
        labels: ['1. Hafta (Ocak)', '2. Hafta (Ocak)', '3. Hafta (Ocak)', '4. Hafta (Ocak)'],
        data: [8500, 9200, 7800, 9500],
      },
      subat: {
        labels: ['1. Hafta (Şubat)', '2. Hafta (Şubat)', '3. Hafta (Şubat)', '4. Hafta (Şubat)'],
        data: [8000, 8700, 7500, 9000],
      },
      mart: {
        labels: ['1. Hafta (Mart)', '2. Hafta (Mart)', '3. Hafta (Mart)', '4. Hafta (Mart)'],
        data: [8800, 9500, 8200, 9800],
      },
      nisan: {
        labels: ['1. Hafta (Nisan)', '2. Hafta (Nisan)', '3. Hafta (Nisan)', '4. Hafta (Nisan)'],
        data: [9500, 10200, 8900, 10500],
      },
      mayis: {
        labels: ['1. Hafta (Mayıs)', '2. Hafta (Mayıs)', '3. Hafta (Mayıs)', '4. Hafta (Mayıs)'],
        data: [10000, 10700, 9400, 11000],
      },
      haziran: {
        labels: ['1. Hafta (Haziran)', '2. Hafta (Haziran)', '3. Hafta (Haziran)', '4. Hafta (Haziran)'],
        data: [10500, 11200, 9900, 11500],
      },
      temmuz: {
        labels: ['1. Hafta (Temmuz)', '2. Hafta (Temmuz)', '3. Hafta (Temmuz)', '4. Hafta (Temmuz)'],
        data: [11000, 11700, 10400, 12000],
      },
      agustos: {
        labels: ['1. Hafta (Ağustos)', '2. Hafta (Ağustos)', '3. Hafta (Ağustos)', '4. Hafta (Ağustos)'],
        data: [11500, 12200, 10900, 12500],
      },
      eylul: {
        labels: ['1. Hafta (Eylül)', '2. Hafta (Eylül)', '3. Hafta (Eylül)', '4. Hafta (Eylül)'],
        data: [9000, 9700, 8400, 10000],
      },
      ekim: {
        labels: ['1. Hafta (Ekim)', '2. Hafta (Ekim)', '3. Hafta (Ekim)', '4. Hafta (Ekim)'],
        data: [9500, 10200, 8900, 10500],
      },
      kasim: {
        labels: ['1. Hafta (Kasım)', '2. Hafta (Kasım)', '3. Hafta (Kasım)', '4. Hafta (Kasım)'],
        data: [10000, 10700, 9400, 11000],
      },
      aralik: {
        labels: ['1. Hafta (Aralık)', '2. Hafta (Aralık)', '3. Hafta (Aralık)', '4. Hafta (Aralık)'],
        data: [9800, 10200, 8700, 11000],
      },
    },
    monthly: {
      2022: {
        labels: ['Ocak 2022', 'Şubat 2022', 'Mart 2022', 'Nisan 2022', 'Mayıs 2022', 'Haziran 2022', 'Temmuz 2022', 'Ağustos 2022', 'Eylül 2022', 'Ekim 2022', 'Kasım 2022', 'Aralık 2022'],
        data: [38000, 42000, 35000, 47000, 44000, 49000, 51000, 54000, 48000, 50000, 52000, 55000],
      },
      2023: {
        labels: ['Ocak 2023', 'Şubat 2023', 'Mart 2023', 'Nisan 2023', 'Mayıs 2023', 'Haziran 2023', 'Temmuz 2023', 'Ağustos 2023', 'Eylül 2023', 'Ekim 2023', 'Kasım 2023', 'Aralık 2023'],
        data: [40000, 44000, 37000, 49000, 46000, 51000, 53000, 56000, 50000, 52000, 54000, 57000],
      },
      2024: {
        labels: ['Ocak 2024', 'Şubat 2024', 'Mart 2024', 'Nisan 2024', 'Mayıs 2024', 'Haziran 2024', 'Temmuz 2024', 'Ağustos 2024', 'Eylül 2024', 'Ekim 2024', 'Kasım 2024', 'Aralık 2024'],
        data: [42000, 46000, 39000, 51000, 48000, 53000, 55000, 58000, 52000, 54000, 56000, 59000],
      },
      2025: {
        labels: ['Ocak 2025', 'Şubat 2025', 'Mart 2025', 'Nisan 2025', 'Mayıs 2025', 'Haziran 2025', 'Temmuz 2025', 'Ağustos 2025', 'Eylül 2025', 'Ekim 2025', 'Kasım 2025', 'Aralık 2025'],
        data: [44000, 48000, 41000, 53000, 50000, 55000, 57000, 60000, 54000, 56000, 58000, 61000],
      },
    },
    yearly: {
      labels: ['2022', '2023', '2024', '2025'],
      data: [570000, 600000, 630000, 660000],
    },
  };

  const currentData = mode === 'monthly' 
    ? dataSets[mode][selectedYear]
    : mode === 'yearly'
    ? dataSets[mode]
    : dataSets[mode][selectedMonth];

  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: `Satışlar (${mode === 'daily' ? 'Günlük' : mode === 'weekly' ? 'Haftalık' : mode === 'monthly' ? 'Aylık' : 'Yıllık'})`,
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
              : mode === 'monthly'
                ? 'Aylık Satışlar'
                : 'Yıllık Satışlar',
      },
    },
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Satış Grafiği</Card.Title>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <ButtonGroup>
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
            <Button
              variant={mode === 'yearly' ? 'primary' : 'outline-primary'}
              onClick={() => setMode('yearly')}
            >
              Yıllık
            </Button>
          </ButtonGroup>

          {(mode === 'daily' || mode === 'weekly') && (
            <Form.Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Form.Select>
          )}

          {mode === 'monthly' && (
            <Form.Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </Form.Select>
          )}
        </div>

        <Line data={chartData} options={options} />
      </Card.Body>
    </Card>
  );
};

export default SalesChart;
