// src/components/reports/SalesChart.jsx
import React, { useState, useEffect } from 'react';
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
import { analyticsService } from '../../services/analyticsService';
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
  const [weeklyData, setWeeklyData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get current week's end date (Sunday)
  const getCurrentWeekEndDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysToSunday);
    return formatDateForAPI(sunday);
  };

  // Get week dates for a specific month
  const getWeekDatesForMonth = (monthIndex, year) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    let startDate;
    if (monthIndex === currentMonth && year === currentYear.toString()) {
      // Bu hafta - gerçek tarih kullan
      const dayOfWeek = currentDate.getDay(); // 0 = Pazar, 1 = Pazartesi
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Pazartesi'ye olan gün sayısı
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - daysToMonday);
    } else {
      // Seçilen ayın ilk haftası - gerçek tarih kullan
      startDate = new Date(parseInt(year), monthIndex, 1);
      const dayOfWeek = startDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(startDate.getDate() - daysToMonday);
    }

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(formatDateForAPI(date));
    }

    return dates;
  };

  // Get week end dates for a specific month - gerçek tarih kullan
  const getWeekEndDatesForMonth = (monthIndex, year) => {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const endDates = [];
    
    let currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0) { // Sunday
        endDates.push(formatDateForAPI(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // If no Sundays found, add the last day of the month
    if (endDates.length === 0) {
      endDates.push(formatDateForAPI(lastDay));
    }
    
    return endDates.slice(0, 4); // Return max 4 weeks
  };

  // Get real month dates for a specific year
  const getMonthDatesForYear = (year) => {
    const monthNumbers = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Eğer şu anki yıl seçiliyse, sadece geçmiş ayları dahil et
    if (year === currentYear.toString()) {
      const currentMonth = currentDate.getMonth();
      for (let i = 1; i <= currentMonth + 1; i++) {
        monthNumbers.push(i);
      }
    } else {
      // Geçmiş veya gelecek yıllar için tüm aylar
      for (let i = 1; i <= 12; i++) {
        monthNumbers.push(i);
      }
    }
    
    return monthNumbers;
  };

  // Fetch daily sales data for a week
  const fetchDailyData = async () => {
    setLoading(true);
    try {
      const monthIndex = months.findIndex(m => m.value === selectedMonth);
      const weekDates = getWeekDatesForMonth(monthIndex, parseInt(selectedYear));
      
      const dailyDataPromises = weekDates.map(date => 
        analyticsService.getDailySalesSummary(date)
      );
      
      const dailyDataResults = await Promise.all(dailyDataPromises);
      const validData = dailyDataResults.filter(data => data !== null);
      
      if (validData.length > 0) {
        // Combine daily data for the week
        const combinedData = {
          reportType: 'DAILY',
          totalRevenue: validData.reduce((sum, data) => sum + (data.totalRevenue || 0), 0),
          totalOrders: validData.reduce((sum, data) => sum + (data.totalOrders || 0), 0),
          totalCustomers: validData.reduce((sum, data) => sum + (data.totalCustomers || 0), 0),
          dailyBreakdown: validData.map((data, index) => ({
            day: index + 1,
            revenue: data.totalRevenue || 0,
            orders: data.totalOrders || 0,
            customers: data.totalCustomers || 0,
            date: weekDates[index]
          }))
        };
        setDailyData(combinedData);
      } else {
        setDailyData(null);
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
      setDailyData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weekly sales data for multiple weeks
  const fetchWeeklyData = async (endDate) => {
    setLoading(true);
    try {
      const data = await analyticsService.getWeeklySalesData(endDate);
      setWeeklyData(data);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setWeeklyData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weekly data for all weeks in a month
  const fetchMonthlyWeeklyData = async () => {
    setLoading(true);
    try {
      const monthIndex = months.findIndex(m => m.value === selectedMonth);
      const weekEndDates = getWeekEndDatesForMonth(monthIndex, parseInt(selectedYear));
      
      const weeklyDataPromises = weekEndDates.map(endDate => 
        analyticsService.getWeeklySalesData(endDate)
      );
      
      const weeklyDataResults = await Promise.all(weeklyDataPromises);
      const validData = weeklyDataResults.filter(data => data !== null);
      
      if (validData.length > 0) {
        // Combine weekly data for the month with real dates
        const combinedData = {
          reportType: 'WEEKLY',
          totalRevenue: validData.reduce((sum, data) => sum + (data.totalRevenue || 0), 0),
          totalOrders: validData.reduce((sum, data) => sum + (data.totalOrders || 0), 0),
          totalCustomers: validData.reduce((sum, data) => sum + (data.totalCustomers || 0), 0),
          weeklyBreakdown: validData.map((data, index) => ({
            week: index + 1,
            endDate: weekEndDates[index], // Gerçek tarih
            revenue: data.totalRevenue || 0,
            orders: data.totalOrders || 0,
            customers: data.totalCustomers || 0
          }))
        };
        setWeeklyData(combinedData);
      } else {
        setWeeklyData(null);
      }
    } catch (error) {
      console.error('Error fetching monthly weekly data:', error);
      setWeeklyData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly data for all months in a year
  const fetchYearlyMonthlyData = async () => {
    setLoading(true);
    try {
      const monthNumbers = getMonthDatesForYear(selectedYear);
      
      const monthlyDataPromises = monthNumbers.map(month => 
        analyticsService.getMonthlySalesSummary(selectedYear, month)
      );
      
      const monthlyDataResults = await Promise.all(monthlyDataPromises);
      const validData = monthlyDataResults.filter(data => data !== null);
      
      if (validData.length > 0) {
        // Combine monthly data for the year with real month numbers
        const combinedData = {
          reportType: 'MONTHLY',
          totalRevenue: validData.reduce((sum, data) => sum + (data.totalRevenue || 0), 0),
          totalOrders: validData.reduce((sum, data) => sum + (data.totalOrders || 0), 0),
          totalCustomers: validData.reduce((sum, data) => sum + (data.totalCustomers || 0), 0),
          monthlyBreakdown: validData.map((data, index) => ({
            month: monthNumbers[index], // Gerçek ay numarası
            revenue: data.totalRevenue || 0,
            orders: data.totalOrders || 0,
            customers: data.totalCustomers || 0
          }))
        };
        setMonthlyData(combinedData);
      } else {
        setMonthlyData(null);
      }
    } catch (error) {
      console.error('Error fetching yearly monthly data:', error);
      setMonthlyData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when mode changes
  useEffect(() => {
    if (mode === 'daily') {
      fetchDailyData();
    } else if (mode === 'weekly') {
      fetchMonthlyWeeklyData();
    } else if (mode === 'monthly') {
      fetchYearlyMonthlyData();
    }
  }, [mode]);

  // Fetch data when year or month changes
  useEffect(() => {
    if (mode === 'daily') {
      fetchDailyData();
    } else if (mode === 'weekly') {
      fetchMonthlyWeeklyData();
    } else if (mode === 'monthly') {
      fetchYearlyMonthlyData();
    }
  }, [selectedYear, selectedMonth, mode]);

  // Dinamik günlük tarih oluşturma - Sadece API verilerini kullan
  const generateDailyLabels = (monthName, monthIndex, year) => {
    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const monthShortNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    // Sadece API'den gelen veriyi kullan
    if (dailyData && dailyData.reportType === 'DAILY' && dailyData.dailyBreakdown) {
      return dailyData.dailyBreakdown.map((dayData, index) => {
        const date = new Date(dayData.date);
        const day = date.getDate();
        const monthShort = monthShortNames[date.getMonth()];
        return `${dayNames[index]} (${day} ${monthShort})`;
      });
    }

    // API verisi yoksa boş array döndür
    return [];
  };

  // Dinamik haftalık tarih oluşturma - Gerçek tarih kullan
  const generateWeeklyLabels = (monthName, monthIndex, year) => {
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    // API'den gelen veri varsa, gerçek tarihleri kullan
    if (weeklyData && weeklyData.reportType === 'WEEKLY' && weeklyData.weeklyBreakdown) {
      return weeklyData.weeklyBreakdown.map((weekData) => {
        const endDate = new Date(weekData.endDate);
        const day = endDate.getDate();
        const monthShort = monthNames[endDate.getMonth()].substring(0, 3);
        return `${weekData.week}. Hafta (${day} ${monthShort})`;
      });
    }
    
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

  // Dinamik aylık tarih oluşturma - Gerçek tarih kullan
  const generateMonthlyLabels = (year) => {
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    // Sadece API'den gelen veriyi kullan
    if (monthlyData && monthlyData.reportType === 'MONTHLY' && monthlyData.monthlyBreakdown) {
      return monthlyData.monthlyBreakdown.map((monthData) => {
        // Gerçek ay numarasını kullan (1-12)
        const monthIndex = monthData.month - 1; // Array index için 0-11
        return `${monthNames[monthIndex]} ${year}`;
      });
    }

    // API verisi yoksa boş array döndür
    return [];
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
        // Sadece API'den gelen veriyi kullan
        [selectedMonth]: {
          labels: dailyData && dailyData.reportType === 'DAILY' && dailyData.dailyBreakdown ? 
            dailyData.dailyBreakdown.map((dayData, index) => {
              const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
              const monthShortNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
              const date = new Date(dayData.date);
              const day = date.getDate();
              const monthShort = monthShortNames[date.getMonth()];
              return `${dayNames[index]} (${day} ${monthShort})`;
            }) :
            [],
          data: dailyData && dailyData.reportType === 'DAILY' && dailyData.dailyBreakdown ? 
            dailyData.dailyBreakdown.map(day => day.revenue) :
            [],
        },
      },
      weekly: {
        // API'den gelen veriyi kullan - gerçek tarih
        [selectedMonth]: {
          labels: weeklyData && weeklyData.reportType === 'WEEKLY' && weeklyData.weeklyBreakdown ? 
            weeklyData.weeklyBreakdown.map((weekData) => {
              const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 
                                 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
              const endDate = new Date(weekData.endDate);
              const day = endDate.getDate();
              const monthShort = monthNames[endDate.getMonth()];
              return `${weekData.week}. Hafta (${day} ${monthShort})`;
            }) :
            generateWeeklyLabels(selectedMonth, months.find(m => m.value === selectedMonth)?.value || 0, selectedYear),
          data: weeklyData && weeklyData.reportType === 'WEEKLY' && weeklyData.weeklyBreakdown ? 
            weeklyData.weeklyBreakdown.map(week => week.revenue) :
            [8500, 9200, 7800, 9500],
        },
      },
      monthly: {
        // Sadece API'den gelen veriyi kullan - gerçek tarih
        [selectedYear]: {
          labels: monthlyData && monthlyData.reportType === 'MONTHLY' && monthlyData.monthlyBreakdown ? 
            monthlyData.monthlyBreakdown.map((monthData) => {
              const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                                 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
              // Gerçek ay numarasını kullan (1-12)
              const monthIndex = monthData.month - 1; // Array index için 0-11
              return `${monthNames[monthIndex]} ${selectedYear}`;
            }) :
            [],
          data: monthlyData && monthlyData.reportType === 'MONTHLY' && monthlyData.monthlyBreakdown ? 
            monthlyData.monthlyBreakdown.map(month => month.revenue) :
            [],
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

        {loading && (
          <div className="text-center mb-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        )}

        <div className="chart-container sales-chart" style={{ backgroundColor: colors.cardBackground, padding: '10px', borderRadius: '8px', height: '400px', border: `2px solid ${colors.border}`, overflow: 'hidden' }}>
          <div style={{ backgroundColor: colors.cardBackground, width: '100%', height: '100%' }}>
            {(mode === 'daily' && (!dailyData || !dailyData.dailyBreakdown || dailyData.dailyBreakdown.length === 0)) ||
             (mode === 'monthly' && (!monthlyData || !monthlyData.monthlyBreakdown || monthlyData.monthlyBreakdown.length === 0)) ? (
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-center">
                  <div style={{ color: colors.textSecondary, fontSize: '1.1rem' }}>
                    {loading ? 'Veriler yükleniyor...' : 
                     mode === 'daily' ? 'Bu tarih için günlük veri bulunamadı' :
                     mode === 'monthly' ? 'Bu yıl için aylık veri bulunamadı' : 'Veri bulunamadı'}
                  </div>
                </div>
              </div>
            ) : (
              <Line data={chartData} options={options} />
            )}
          </div>
        </div>

        {dailyData && mode === 'daily' && (
          <div className="mt-3 p-3" style={{ backgroundColor: colors.cardBackground, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <h6 style={{ color: colors.text }}>Günlük Özet</h6>
            <div className="row">
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Toplam Gelir</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>₺{dailyData.totalRevenue?.toLocaleString()}</div>
              </div>
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Toplam Sipariş</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>{dailyData.totalOrders}</div>
              </div>
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Ortalama Sipariş</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>₺{dailyData.totalOrders > 0 ? (dailyData.totalRevenue / dailyData.totalOrders).toFixed(2) : '0.00'}</div>
              </div>
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Toplam Müşteri</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>{dailyData.totalCustomers}</div>
              </div>
            </div>
            
            {dailyData.dailyBreakdown && dailyData.dailyBreakdown.length > 0 && (
              <div className="mt-3">
                <h6 style={{ color: colors.text }}>Günlük Detay</h6>
                <div className="row">
                  {dailyData.dailyBreakdown.map((day, index) => {
                    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
                    const monthShortNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
                    const date = new Date(day.date);
                    const dayNumber = date.getDate();
                    const monthShort = monthShortNames[date.getMonth()];
                    return (
                      <div key={index} className="col-md-3 mb-2">
                        <small style={{ color: colors.textSecondary }}>{dayNames[index]} ({dayNumber} {monthShort})</small>
                        <div style={{ color: colors.text, fontWeight: 'bold' }}>₺{day.revenue?.toLocaleString()}</div>
                        <small style={{ color: colors.textSecondary }}>{day.orders} sipariş</small>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {weeklyData && mode === 'weekly' && (
          <div className="mt-3 p-3" style={{ backgroundColor: colors.cardBackground, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <h6 style={{ color: colors.text }}>Haftalık Özet</h6>
            <div className="row">
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Toplam Gelir</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>₺{weeklyData.totalRevenue?.toLocaleString()}</div>
              </div>
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Toplam Sipariş</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>{weeklyData.totalOrders}</div>
              </div>
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Ortalama Sipariş</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>₺{weeklyData.totalOrders > 0 ? (weeklyData.totalRevenue / weeklyData.totalOrders).toFixed(2) : '0.00'}</div>
              </div>
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Toplam Müşteri</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>{weeklyData.totalCustomers}</div>
              </div>
            </div>
            
                         {weeklyData.weeklyBreakdown && weeklyData.weeklyBreakdown.length > 0 && (
               <div className="mt-3">
                 <h6 style={{ color: colors.text }}>Haftalık Detay</h6>
                 <div className="row">
                   {weeklyData.weeklyBreakdown.map((week, index) => {
                     const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 
                                        'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
                     const endDate = new Date(week.endDate);
                     const day = endDate.getDate();
                     const monthShort = monthNames[endDate.getMonth()];
                     return (
                       <div key={index} className="col-md-3 mb-2">
                         <small style={{ color: colors.textSecondary }}>{week.week}. Hafta ({day} {monthShort})</small>
                         <div style={{ color: colors.text, fontWeight: 'bold' }}>₺{week.revenue?.toLocaleString()}</div>
                         <small style={{ color: colors.textSecondary }}>{week.orders} sipariş</small>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}
          </div>
        )}

        {monthlyData && mode === 'monthly' && (
          <div className="mt-3 p-3" style={{ backgroundColor: colors.cardBackground, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <h6 style={{ color: colors.text }}>Aylık Özet</h6>
            <div className="row">
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Toplam Gelir</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>₺{monthlyData.totalRevenue?.toLocaleString()}</div>
              </div>
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Toplam Sipariş</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>{monthlyData.totalOrders}</div>
              </div>
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Ortalama Sipariş</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>₺{monthlyData.totalOrders > 0 ? (monthlyData.totalRevenue / monthlyData.totalOrders).toFixed(2) : '0.00'}</div>
              </div>
              <div className="col-md-3">
                <small style={{ color: colors.textSecondary }}>Toplam Müşteri</small>
                <div style={{ color: colors.text, fontWeight: 'bold' }}>{monthlyData.totalCustomers}</div>
              </div>
            </div>
            
                         {monthlyData.monthlyBreakdown && monthlyData.monthlyBreakdown.length > 0 && (
               <div className="mt-3">
                 <h6 style={{ color: colors.text }}>Aylık Detay</h6>
                 <div className="row">
                   {monthlyData.monthlyBreakdown.map((month, index) => {
                     const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                                        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                     // Gerçek ay numarasını kullan (1-12)
                     const monthIndex = month.month - 1; // Array index için 0-11
                     return (
                       <div key={index} className="col-md-3 mb-2">
                         <small style={{ color: colors.textSecondary }}>{monthNames[monthIndex]}</small>
                         <div style={{ color: colors.text, fontWeight: 'bold' }}>₺{month.revenue?.toLocaleString()}</div>
                         <small style={{ color: colors.textSecondary }}>{month.orders} sipariş</small>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SalesChart;
