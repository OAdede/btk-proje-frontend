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
import { useTheme } from '../../context/ThemeContext';
import './SalesChart.css';

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
  const { colors } = useTheme();
  // Gerçek zamanlı tarih hesaplama fonksiyonları
  const getCurrentYear = () => new Date().getFullYear();
  const getCurrentMonth = () => {
    const months = ['ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran', 
                   'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik'];
    return months[new Date().getMonth()];
  };

  const [mode, setMode] = useState('daily');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear().toString());

  // Dinamik günlük tarih oluşturma
  const generateDailyLabels = (monthName, monthIndex, year) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Eğer seçilen ay geçmişte ise, o ayın ilk haftasını göster
    // Eğer şu anki ay ise, bu haftayı göster
    let startDate;
    if (monthIndex === currentMonth && year === currentYear.toString()) {
      // Bu hafta
      const dayOfWeek = currentDate.getDay(); // 0 = Pazar, 1 = Pazartesi
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Pazartesi'ye olan gün sayısı
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - daysToMonday);
    } else {
      // Seçilen ayın ilk haftası
      startDate = new Date(parseInt(year), monthIndex, 1);
      const dayOfWeek = startDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(startDate.getDate() - daysToMonday);
    }

    const labels = [];
    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const monthShortNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const day = date.getDate();
      const monthShort = monthShortNames[date.getMonth()];
      labels.push(`${dayNames[i]} (${day} ${monthShort})`);
    }

    return labels;
  };

  // Dinamik haftalık tarih oluşturma
  const generateWeeklyLabels = (monthName, monthIndex, year) => {
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Eğer şu anki ay seçiliyse, bu ayın haftalarını göster
    if (monthIndex === currentMonth && year === currentYear.toString()) {
      const weekOfMonth = Math.ceil(currentDate.getDate() / 7);
      const labels = [];
      for (let i = 1; i <= 4; i++) {
        if (i <= weekOfMonth) {
          labels.push(`${i}. Hafta (${monthNames[monthIndex]})`);
        } else {
          labels.push(`${i}. Hafta (${monthNames[monthIndex]})`);
        }
      }
      return labels;
    } else {
      // Geçmiş veya gelecek aylar için standart haftalar
      return [
        `1. Hafta (${monthNames[monthIndex]})`,
        `2. Hafta (${monthNames[monthIndex]})`,
        `3. Hafta (${monthNames[monthIndex]})`,
        `4. Hafta (${monthNames[monthIndex]})`
      ];
    }
  };

  // Dinamik aylık tarih oluşturma
  const generateMonthlyLabels = (year) => {
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Eğer şu anki yıl seçiliyse, bu yılın aylarını göster
    if (year === currentYear.toString()) {
      const currentMonth = currentDate.getMonth();
      const labels = [];
      for (let i = 0; i < 12; i++) {
        if (i <= currentMonth) {
          labels.push(`${monthNames[i]} ${year}`);
        } else {
          labels.push(`${monthNames[i]} ${year}`);
        }
      }
      return labels;
    } else {
      // Geçmiş veya gelecek yıllar için tüm aylar
      return monthNames.map(month => `${month} ${year}`);
    }
  };

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
    { value: (getCurrentYear() - 2).toString(), label: (getCurrentYear() - 2).toString() },
    { value: (getCurrentYear() - 1).toString(), label: (getCurrentYear() - 1).toString() },
    { value: getCurrentYear().toString(), label: getCurrentYear().toString() },
    { value: (getCurrentYear() + 1).toString(), label: (getCurrentYear() + 1).toString() },
  ];

  // Veri setlerini dinamik olarak oluştur
  const getDataSets = () => {
    const currentYear = getCurrentYear();
    const yearOptions = [
      { value: (currentYear - 2).toString(), label: (currentYear - 2).toString() },
      { value: (currentYear - 1).toString(), label: (currentYear - 1).toString() },
      { value: currentYear.toString(), label: currentYear.toString() },
      { value: (currentYear + 1).toString(), label: (currentYear + 1).toString() },
    ];

    return {
      daily: {
        ocak: {
          labels: generateDailyLabels('ocak', 0, selectedYear),
          data: [1100, 1300, 1600, 1200, 1800, 2000, 1500],
        },
        subat: {
          labels: generateDailyLabels('subat', 1, selectedYear),
          data: [1000, 1200, 1400, 1100, 1600, 1800, 1300],
        },
        mart: {
          labels: generateDailyLabels('mart', 2, selectedYear),
          data: [1150, 1350, 1650, 1250, 1850, 2050, 1550],
        },
        nisan: {
          labels: generateDailyLabels('nisan', 3, selectedYear),
          data: [1250, 1450, 1750, 1350, 1950, 2150, 1650],
        },
        mayis: {
          labels: generateDailyLabels('mayis', 4, selectedYear),
          data: [1300, 1500, 1800, 1400, 2000, 2200, 1700],
        },
        haziran: {
          labels: generateDailyLabels('haziran', 5, selectedYear),
          data: [1350, 1550, 1850, 1450, 2050, 2250, 1750],
        },
        temmuz: {
          labels: generateDailyLabels('temmuz', 6, selectedYear),
          data: [1400, 1600, 1900, 1500, 2100, 2300, 1800],
        },
        agustos: {
          labels: generateDailyLabels('agustos', 7, selectedYear),
          data: [1450, 1650, 1950, 1550, 2150, 2350, 1850],
        },
        eylul: {
          labels: generateDailyLabels('eylul', 8, selectedYear),
          data: [1200, 1400, 1700, 1300, 1900, 2100, 1600],
        },
        ekim: {
          labels: generateDailyLabels('ekim', 9, selectedYear),
          data: [1250, 1450, 1750, 1350, 1950, 2150, 1650],
        },
        kasim: {
          labels: generateDailyLabels('kasim', 10, selectedYear),
          data: [1300, 1500, 1800, 1400, 2000, 2200, 1700],
        },
        aralik: {
          labels: generateDailyLabels('aralik', 11, selectedYear),
          data: [1200, 1500, 1800, 1400, 2000, 2200, 1700],
        },
      },
      weekly: {
        ocak: {
          labels: generateWeeklyLabels('ocak', 0, selectedYear),
          data: [8500, 9200, 7800, 9500],
        },
        subat: {
          labels: generateWeeklyLabels('subat', 1, selectedYear),
          data: [8000, 8700, 7500, 9000],
        },
        mart: {
          labels: generateWeeklyLabels('mart', 2, selectedYear),
          data: [8800, 9500, 8200, 9800],
        },
        nisan: {
          labels: generateWeeklyLabels('nisan', 3, selectedYear),
          data: [9500, 10200, 8900, 10500],
        },
        mayis: {
          labels: generateWeeklyLabels('mayis', 4, selectedYear),
          data: [10000, 10700, 9400, 11000],
        },
        haziran: {
          labels: generateWeeklyLabels('haziran', 5, selectedYear),
          data: [10500, 11200, 9900, 11500],
        },
        temmuz: {
          labels: generateWeeklyLabels('temmuz', 6, selectedYear),
          data: [11000, 11700, 10400, 12000],
        },
        agustos: {
          labels: generateWeeklyLabels('agustos', 7, selectedYear),
          data: [11500, 12200, 10900, 12500],
        },
        eylul: {
          labels: generateWeeklyLabels('eylul', 8, selectedYear),
          data: [9000, 9700, 8400, 10000],
        },
        ekim: {
          labels: generateWeeklyLabels('ekim', 9, selectedYear),
          data: [9500, 10200, 8900, 10500],
        },
        kasim: {
          labels: generateWeeklyLabels('kasim', 10, selectedYear),
          data: [10000, 10700, 9400, 11000],
        },
        aralik: {
          labels: generateWeeklyLabels('aralik', 11, selectedYear),
          data: [9800, 10200, 8700, 11000],
        },
      },
      monthly: {
        2022: {
          labels: generateMonthlyLabels('2022'),
          data: [38000, 42000, 35000, 47000, 44000, 49000, 51000, 54000, 48000, 50000, 52000, 55000],
        },
        2023: {
          labels: generateMonthlyLabels('2023'),
          data: [40000, 44000, 37000, 49000, 46000, 51000, 53000, 56000, 50000, 52000, 54000, 57000],
        },
        2024: {
          labels: generateMonthlyLabels('2024'),
          data: [42000, 46000, 39000, 51000, 48000, 53000, 55000, 58000, 52000, 54000, 56000, 59000],
        },
        2025: {
          labels: generateMonthlyLabels('2025'),
          data: [44000, 48000, 41000, 53000, 50000, 55000, 57000, 60000, 54000, 56000, 58000, 61000],
        },
      },
      yearly: {
        labels: yearOptions.map(year => year.value),
        data: [570000, 600000, 630000, 660000],
      },
    };
  };

  const dataSets = getDataSets();
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
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          color: colors.text
        }
      },
      title: {
        display: true,
        color: colors.text,
        text:
          mode === 'daily'
            ? 'Günlük Satışlar'
            : mode === 'weekly'
              ? 'Haftalük Satışlar'
              : mode === 'monthly'
                ? 'Aylık Satışlar'
                : 'Yıllık Satışlar',
      },
    },
    scales: {
      x: {
        ticks: {
          color: colors.text
        },
        grid: {
          color: colors.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        ticks: {
          color: colors.text
        },
        grid: {
          color: colors.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    backgroundColor: colors.cardBackground,
    elements: {
      line: {
        backgroundColor: colors.cardBackground
      },
      point: {
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
    <Card className="mb-4 sales-chart" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
      <Card.Body>
        <Card.Title className="sales-chart" style={{ color: colors.text }}>Satış Grafiği</Card.Title>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <ButtonGroup className="sales-chart">
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
              className="sales-chart"
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
              className="sales-chart"
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

        <div className="chart-container sales-chart" style={{ backgroundColor: colors.cardBackground, padding: '10px', borderRadius: '8px', height: '400px', border: `2px solid ${colors.border}`, overflow: 'hidden' }}>
          <div style={{ backgroundColor: colors.cardBackground, width: '100%', height: '100%' }}>
            <Line data={chartData} options={options} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SalesChart;
