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
  const [dateRangeData, setDateRangeData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      // Get all daily sales summaries from the new endpoint
      const allDailyData = await analyticsService.getAllDailySalesSummaries();
      
      if (allDailyData && allDailyData.length > 0) {
        const monthIndex = months.findIndex(m => m.value === selectedMonth);
        const selectedYearInt = parseInt(selectedYear);
        
        // Filter data for the selected month and year
        const filteredData = allDailyData.filter(data => {
          if (!data.reportDate) return false;
          const date = new Date(data.reportDate);
          return date.getMonth() === monthIndex && date.getFullYear() === selectedYearInt;
        });
        
        // Sort by date (oldest first for chronological order)
        filteredData.sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate));
        
        // Get all days of data for the selected month
        let monthData = filteredData;
        
        // If we don't have data for the selected month, create placeholder data for all days
        if (monthData.length === 0) {
          const selectedMonthIndex = months.findIndex(m => m.value === selectedMonth);
          const selectedYearInt = parseInt(selectedYear);
          
          // Get the number of days in the selected month
          const daysInMonth = new Date(selectedYearInt, selectedMonthIndex + 1, 0).getDate();
          
          // Create placeholder data for all days of the month
          for (let i = 1; i <= daysInMonth; i++) {
            const placeholderDate = new Date(selectedYearInt, selectedMonthIndex, i);
            
            monthData.push({
              reportDate: placeholderDate.toISOString().split('T')[0],
              totalRevenue: 0,
              totalOrders: 0,
              totalCustomers: 0
            });
          }
        }
        
        // Use monthData instead of weekData
        const weekData = monthData;
        
        if (weekData.length > 0) {
          // Combine daily data for the week
          const combinedData = {
            reportType: 'DAILY',
            totalRevenue: weekData.reduce((sum, data) => sum + (data.totalRevenue || 0), 0),
            totalOrders: weekData.reduce((sum, data) => sum + (data.totalOrders || 0), 0),
            totalCustomers: weekData.reduce((sum, data) => sum + (data.totalCustomers || 0), 0),
            dailyBreakdown: weekData.map((data, index) => ({
              day: index + 1,
              revenue: data.totalRevenue || 0,
              orders: data.totalOrders || 0,
              customers: data.totalCustomers || 0,
              date: data.reportDate
            }))
          };
          setDailyData(combinedData);
        } else {
          setDailyData(null);
        }
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
      // Get all weekly sales summaries from the new endpoint
      const allWeeklyData = await analyticsService.getAllWeeklySalesSummaries();
      
      if (allWeeklyData && allWeeklyData.length > 0) {
        const monthIndex = months.findIndex(m => m.value === selectedMonth);
        const selectedYearInt = parseInt(selectedYear);
        
        // Filter data for the selected month and year
        const filteredData = allWeeklyData.filter(data => {
          if (!data.reportDate) return false;
          const date = new Date(data.reportDate);
          return date.getMonth() === monthIndex && date.getFullYear() === selectedYearInt;
        });
        
        // Sort by date (newest first, then reverse to get oldest first for the month)
        filteredData.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
        
        // Get the most recent 4 weeks of data for the selected month
        const monthData = filteredData.slice(0, 4).reverse();
        
        if (monthData.length > 0) {
          // Combine weekly data for the month with real dates
          const combinedData = {
            reportType: 'WEEKLY',
            totalRevenue: monthData.reduce((sum, data) => sum + (data.totalRevenue || 0), 0),
            totalOrders: monthData.reduce((sum, data) => sum + (data.totalOrders || 0), 0),
            totalCustomers: monthData.reduce((sum, data) => sum + (data.totalCustomers || 0), 0),
            weeklyBreakdown: monthData.map((data, index) => ({
              week: index + 1,
              endDate: data.reportDate, // Use actual report date from API
              revenue: data.totalRevenue || 0,
              orders: data.totalOrders || 0,
              customers: data.totalCustomers || 0
            }))
          };
          setWeeklyData(combinedData);
        } else {
          setWeeklyData(null);
        }
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
      // Get all monthly sales summaries from the new endpoint
      const allMonthlyData = await analyticsService.getAllMonthlySalesSummaries();
      
      if (allMonthlyData && allMonthlyData.length > 0) {
        const selectedYearInt = parseInt(selectedYear);
        
        // Filter data for the selected year
        const filteredData = allMonthlyData.filter(data => {
          if (!data.reportDate) return false;
          const date = new Date(data.reportDate);
          return date.getFullYear() === selectedYearInt;
        });
        
        // Sort by date (newest first, then reverse to get oldest first for the year)
        filteredData.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
        
        // Get all months for the selected year (up to 12 months)
        const yearData = filteredData.slice(0, 12).reverse();
        
        if (yearData.length > 0) {
          // Combine monthly data for the year with real month numbers
          const combinedData = {
            reportType: 'MONTHLY',
            totalRevenue: yearData.reduce((sum, data) => sum + (data.totalRevenue || 0), 0),
            totalOrders: yearData.reduce((sum, data) => sum + (data.totalOrders || 0), 0),
            totalCustomers: yearData.reduce((sum, data) => sum + (data.totalCustomers || 0), 0),
            monthlyBreakdown: yearData.map((data, index) => {
              const date = new Date(data.reportDate);
              return {
                month: date.getMonth() + 1, // Get actual month number (1-12)
                revenue: data.totalRevenue || 0,
                orders: data.totalOrders || 0,
                customers: data.totalCustomers || 0,
                reportDate: data.reportDate
              };
            })
          };
          setMonthlyData(combinedData);
        } else {
          setMonthlyData(null);
        }
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

  // Fetch data for custom date range
  const fetchDateRangeData = async () => {
    if (!startDate || !endDate) {
      setDateRangeData(null);
      return;
    }

    setLoading(true);
    try {
      // Get sales summaries by date range from the new endpoint
      const dateRangeData = await analyticsService.getSalesSummariesByDateRange(startDate, endDate);
      
      if (dateRangeData && dateRangeData.length > 0) {
        // Calculate totals from all summaries
        const totalRevenue = dateRangeData.reduce((sum, data) => sum + (data.totalRevenue || 0), 0);
        const totalOrders = dateRangeData.reduce((sum, data) => sum + (data.totalOrders || 0), 0);
        const totalCustomers = dateRangeData.reduce((sum, data) => sum + (data.totalCustomers || 0), 0);
        const totalReservations = dateRangeData.reduce((sum, data) => sum + (data.totalReservations || 0), 0);
        
        // Calculate average order value
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Get most and least popular items (from the first summary for simplicity)
        const firstSummary = dateRangeData[0];
        const mostPopularItemName = firstSummary?.mostPopularItemName || '';
        const leastPopularItemName = firstSummary?.leastPopularItemName || '';
        
        // Combine sales by category from all summaries
        const combinedSalesByCategory = {};
        dateRangeData.forEach(summary => {
          if (summary.salesByCategory) {
            Object.entries(summary.salesByCategory).forEach(([category, amount]) => {
              const currentAmount = parseFloat(amount) || 0;
              combinedSalesByCategory[category] = (combinedSalesByCategory[category] || 0) + currentAmount;
            });
          }
        });
        
        // Process the date range data
        const processedData = {
          reportType: 'DAILY',
          totalRevenue: totalRevenue,
          totalOrders: totalOrders,
          totalCustomers: totalCustomers,
          averageOrderValue: averageOrderValue,
          mostPopularItemName: mostPopularItemName,
          leastPopularItemName: leastPopularItemName,
          totalReservations: totalReservations,
          salesByCategory: combinedSalesByCategory,
          employeePerformance: firstSummary?.employeePerformance || {},
          startDate: startDate,
          endDate: endDate,
          // Add daily breakdown for chart display
          dailyBreakdown: dateRangeData.map((data, index) => ({
            day: index + 1,
            revenue: data.totalRevenue || 0,
            orders: data.totalOrders || 0,
            customers: data.totalCustomers || 0,
            date: data.reportDate
          }))
        };
        setDateRangeData(processedData);
      } else {
        setDateRangeData(null);
      }
    } catch (error) {
      console.error('Error fetching date range data:', error);
      setDateRangeData(null);
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
    } else if (mode === 'dateRange') {
      // Clear date range data when switching to date range mode
      setDateRangeData(null);
    }
    // Removed automatic fetch for dateRange mode - now only triggered by Generate button
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

  // Removed the useEffect that automatically fetched date range data when parameters changed

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
    : mode === 'dateRange'
    ? (() => {
        // Date range için günlük veri oluştur
        if (!dateRangeData) {
          return { labels: [], data: [] };
        }
        
        if (dateRangeData.dailyBreakdown) {
          return {
            labels: dateRangeData.dailyBreakdown.map((day, index) => {
              const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
              const monthShortNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
              const date = new Date(day.date);
              const dayNumber = date.getDate();
              const monthShort = monthShortNames[date.getMonth()];
              return `${dayNames[index]} (${dayNumber} ${monthShort})`;
            }),
            data: dateRangeData.dailyBreakdown.map(day => day.revenue)
          };
        } else {
          // Eğer breakdown verisi yoksa toplam geliri göster
          return { 
            labels: ['Toplam Gelir'], 
            data: [dateRangeData.totalRevenue || 0] 
          };
        }
      })()
    : dataSets[mode][selectedMonth];

  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: `Satışlar (${
          mode === 'daily' ? 'Günlük' : 
          mode === 'weekly' ? 'Haftalık' : 
          mode === 'monthly' ? 'Aylık' : 
          mode === 'dateRange' ? 'Günlük' : 'Yıllık'
        })`,
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
               ? 'Haftalık Satışlar'
              : mode === 'monthly'
                ? 'Aylık Satışlar'
                : mode === 'dateRange'
                  ? `Tarih Aralığı Satışları (${startDate} - ${endDate}) - Günlük`
                : 'Yıllık Satışlar',
      },
    },
    scales: {
      x: {
        display: currentData.labels && currentData.labels.length > 0,
        ticks: {
          color: colors.text
        },
        grid: {
          display: currentData.labels && currentData.labels.length > 0,
          color: colors.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: currentData.data && currentData.data.length > 0 && currentData.data.some(val => val > 0),
        ticks: {
          color: colors.text
        },
        grid: {
          display: currentData.data && currentData.data.length > 0 && currentData.data.some(val => val > 0),
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
      <Card.Body style={{ padding: '15px', overflow: 'hidden' }}>
        <Card.Title className="sales-chart mb-2" style={{ color: colors.text, fontSize: '1.2rem' }}>Satış Grafiği</Card.Title>

        <div className="d-flex justify-content-between align-items-center mb-2" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <ButtonGroup className="sales-chart" size="sm">
            <Button
              variant={mode === 'daily' ? 'primary' : 'outline-primary'}
              onClick={() => setMode('daily')}
              style={{ fontSize: '0.85rem', padding: '4px 8px' }}
            >
              Günlük
            </Button>
            <Button
              variant={mode === 'weekly' ? 'primary' : 'outline-primary'}
              onClick={() => setMode('weekly')}
              style={{ fontSize: '0.85rem', padding: '4px 8px' }}
            >
              Haftalık
            </Button>
            <Button
              variant={mode === 'monthly' ? 'primary' : 'outline-primary'}
              onClick={() => setMode('monthly')}
              style={{ fontSize: '0.85rem', padding: '4px 8px' }}
            >
              Aylık
            </Button>
            <Button
              variant={mode === 'yearly' ? 'primary' : 'outline-primary'}
              onClick={() => setMode('yearly')}
              style={{ fontSize: '0.85rem', padding: '4px 8px' }}
            >
              Yıllık
            </Button>
            <Button
              variant={mode === 'dateRange' ? 'primary' : 'outline-primary'}
              onClick={() => setMode('dateRange')}
              style={{ fontSize: '0.85rem', padding: '4px 8px' }}
            >
              Tarih Aralığı
            </Button>
          </ButtonGroup>

          {(mode === 'daily' || mode === 'weekly') && (
            <Form.Select
              className="sales-chart"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: 'auto', minWidth: '120px', fontSize: '0.85rem' }}
              size="sm"
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
              style={{ width: 'auto', minWidth: '120px', fontSize: '0.85rem' }}
              size="sm"
            >
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </Form.Select>
          )}

          {mode === 'dateRange' && (
            <div className="d-flex gap-1 align-items-center" style={{ flexWrap: 'wrap', gap: '4px' }}>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: 'auto', minWidth: '120px', fontSize: '0.85rem' }}
                className="sales-chart"
                size="sm"
              />
              <span style={{ color: colors.text, fontSize: '0.85rem' }}>-</span>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: 'auto', minWidth: '120px', fontSize: '0.85rem' }}
                className="sales-chart"
                size="sm"
              />

              <Button
                variant="primary"
                onClick={() => fetchDateRangeData()}
                disabled={!startDate || !endDate || loading}
                className="sales-chart"
                style={{ minWidth: '80px', fontSize: '0.85rem', padding: '4px 8px' }}
                size="sm"
              >
                {loading ? 'Yükleniyor...' : 'Generate'}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setMode('daily');
                  setStartDate('');
                  setEndDate('');
                  setDateRangeData(null);
                }}
                className="sales-chart"
                style={{ minWidth: '50px', fontSize: '0.85rem', padding: '4px 6px' }}
                size="sm"
              >
                Geri
              </Button>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center mb-2">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        )}

        <div className="chart-container sales-chart" style={{ backgroundColor: colors.cardBackground, padding: '8px', borderRadius: '6px', height: '280px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
          <div style={{ backgroundColor: colors.cardBackground, width: '100%', height: '100%' }}>
            {(mode === 'daily' && (!dailyData || !dailyData.dailyBreakdown || dailyData.dailyBreakdown.length === 0)) ||
              (mode === 'monthly' && (!monthlyData || !monthlyData.monthlyBreakdown || monthlyData.monthlyBreakdown.length === 0)) ||
              (mode === 'dateRange' && (!dateRangeData || !startDate || !endDate)) ||
              (mode === 'dateRange' && dateRangeData && (!dateRangeData.totalRevenue || dateRangeData.totalRevenue === 0)) ? (
               <div className="d-flex align-items-center justify-content-center h-100">
                 <div className="text-center">
                   <div style={{ color: colors.textSecondary, fontSize: '1rem' }}>
                     {loading ? 'Veriler yükleniyor...' : 
                      mode === 'daily' ? 'Bu tarih için günlük veri bulunamadı' :
                      mode === 'monthly' ? 'Bu yıl için aylık veri bulunamadı' :
                      mode === 'dateRange' ? 'Lütfen tarih aralığı seçin' : 'Veri bulunamadı'}
                   </div>
                 </div>
               </div>
             ) : (
               <Line data={chartData} options={options} />
             )}
           </div>
         </div>

         <div style={{ maxHeight: 'none', overflow: 'visible' }}>
           {dailyData && mode === 'daily' && (
             <div className="mt-2 p-2" style={{ backgroundColor: colors.cardBackground, borderRadius: '6px', border: `1px solid ${colors.border}` }}>
               <h6 style={{ color: colors.text, fontSize: '0.95rem', marginBottom: '8px' }}>Günlük Özet</h6>
               <div className="row g-2">
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Gelir</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>₺{dailyData.totalRevenue?.toLocaleString()}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Sipariş</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>{dailyData.totalOrders}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Ortalama Sipariş</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>₺{dailyData.totalOrders > 0 ? (dailyData.totalRevenue / dailyData.totalOrders).toFixed(2) : '0.00'}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Müşteri</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>{dailyData.totalCustomers}</div>
                 </div>
               </div>
               
               {dailyData.dailyBreakdown && dailyData.dailyBreakdown.length > 0 && (
                 <div className="mt-2">
                   <h6 style={{ color: colors.text, fontSize: '0.85rem', marginBottom: '6px' }}>Günlük Detay</h6>
                   <div className="row g-1" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                     {dailyData.dailyBreakdown.map((day, index) => {
                       const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
                       const monthShortNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
                       const date = new Date(day.date);
                       const dayNumber = date.getDate();
                       const monthShort = monthShortNames[date.getMonth()];
                       return (
                         <div key={index} className="col-md-3 col-6 mb-1">
                           <small style={{ color: colors.textSecondary, fontSize: '0.7rem' }}>{dayNames[index]} ({dayNumber} {monthShort})</small>
                           <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.8rem' }}>₺{day.revenue?.toLocaleString()}</div>
                           <small style={{ color: colors.textSecondary, fontSize: '0.7rem' }}>{day.orders} sipariş</small>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}
             </div>
           )}

           {weeklyData && mode === 'weekly' && (
             <div className="mt-2 p-2" style={{ backgroundColor: colors.cardBackground, borderRadius: '6px', border: `1px solid ${colors.border}` }}>
               <h6 style={{ color: colors.text, fontSize: '0.95rem', marginBottom: '8px' }}>Haftalık Özet</h6>
               <div className="row g-2">
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Gelir</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>₺{weeklyData.totalRevenue?.toLocaleString()}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Sipariş</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>{weeklyData.totalOrders}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Ortalama Sipariş</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>₺{weeklyData.totalOrders > 0 ? (weeklyData.totalRevenue / weeklyData.totalOrders).toFixed(2) : '0.00'}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Müşteri</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>{weeklyData.totalCustomers}</div>
                 </div>
               </div>
               
               {weeklyData.weeklyBreakdown && weeklyData.weeklyBreakdown.length > 0 && (
                 <div className="mt-2">
                   <h6 style={{ color: colors.text, fontSize: '0.85rem', marginBottom: '6px' }}>Haftalık Detay</h6>
                   <div className="row g-1" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                     {weeklyData.weeklyBreakdown.map((week, index) => {
                       const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 
                                          'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
                       const endDate = new Date(week.endDate);
                       const day = endDate.getDate();
                       const monthShort = monthNames[endDate.getMonth()];
                       return (
                         <div key={index} className="col-md-3 col-6 mb-1">
                           <small style={{ color: colors.textSecondary, fontSize: '0.7rem' }}>{week.week}. Hafta ({day} {monthShort})</small>
                           <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.8rem' }}>₺{week.revenue?.toLocaleString()}</div>
                           <small style={{ color: colors.textSecondary, fontSize: '0.7rem' }}>{week.orders} sipariş</small>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}
             </div>
           )}

           {monthlyData && mode === 'monthly' && (
             <div className="mt-2 p-2" style={{ backgroundColor: colors.cardBackground, borderRadius: '6px', border: `1px solid ${colors.border}` }}>
               <h6 style={{ color: colors.text, fontSize: '0.95rem', marginBottom: '8px' }}>Aylık Özet</h6>
               <div className="row g-2">
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Gelir</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>₺{monthlyData.totalRevenue?.toLocaleString()}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Sipariş</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>{monthlyData.totalOrders}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Ortalama Sipariş</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>₺{monthlyData.totalOrders > 0 ? (monthlyData.totalRevenue / monthlyData.totalOrders).toFixed(2) : '0.00'}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Müşteri</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>{monthlyData.totalCustomers}</div>
                 </div>
               </div>
               
               {monthlyData.monthlyBreakdown && monthlyData.monthlyBreakdown.length > 0 && (
                 <div className="mt-2">
                   <h6 style={{ color: colors.text, fontSize: '0.85rem', marginBottom: '6px' }}>Aylık Detay</h6>
                   <div className="row g-1" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                     {monthlyData.monthlyBreakdown.map((month, index) => {
                       const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                                          'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                       // Gerçek ay numarasını kullan (1-12)
                       const monthIndex = month.month - 1; // Array index için 0-11
                       return (
                         <div key={index} className="col-md-3 col-6 mb-1">
                           <small style={{ color: colors.textSecondary, fontSize: '0.7rem' }}>{monthNames[monthIndex]}</small>
                           <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.8rem' }}>₺{month.revenue?.toLocaleString()}</div>
                           <small style={{ color: colors.textSecondary, fontSize: '0.7rem' }}>{month.orders} sipariş</small>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}
             </div>
           )}

           {dateRangeData && mode === 'dateRange' && (
             <div className="mt-2 p-2" style={{ backgroundColor: colors.cardBackground, borderRadius: '6px', border: `1px solid ${colors.border}` }}>
               <h6 style={{ color: colors.text, fontSize: '0.95rem', marginBottom: '8px' }}>Tarih Aralığı Özet ({dateRangeData.startDate} - {dateRangeData.endDate})</h6>
               <div className="row g-2">
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Gelir</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>₺{dateRangeData.totalRevenue?.toLocaleString()}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Sipariş</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>{dateRangeData.totalOrders}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Ortalama Sipariş</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>₺{dateRangeData.averageOrderValue?.toFixed(2)}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Müşteri</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>{dateRangeData.totalCustomers}</div>
                 </div>
               </div>
               
               <div className="row g-2 mt-2">
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>En Popüler Ürün</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>{dateRangeData.mostPopularItemName}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>En Az Popüler Ürün</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>{dateRangeData.leastPopularItemName}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Toplam Rezervasyon</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>{dateRangeData.totalReservations}</div>
                 </div>
                 <div className="col-md-3">
                   <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Rapor Tipi</small>
                   <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.9rem' }}>
                     Günlük
                   </div>
                 </div>
               </div>

               {dateRangeData.salesByCategory && Object.keys(dateRangeData.salesByCategory).length > 0 && (
                 <div className="mt-2">
                   <h6 style={{ color: colors.text, fontSize: '0.85rem', marginBottom: '6px' }}>Kategori Bazında Satışlar</h6>
                   <div className="row g-1" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                     {Object.entries(dateRangeData.salesByCategory).map(([category, amount], index) => (
                       <div key={index} className="col-md-3 col-6 mb-1">
                         <small style={{ color: colors.textSecondary, fontSize: '0.7rem' }}>
                           {category === 'drinks' ? 'İçecekler' : 
                            category === 'main_dishes' ? 'Ana Yemekler' : 
                            category === 'desserts' ? 'Tatlılar' : 
                            category === 'appetizers' ? 'Başlangıçlar' : category}
                         </small>
                         <div style={{ color: colors.text, fontWeight: 'bold', fontSize: '0.8rem' }}>₺{parseFloat(amount).toLocaleString()}</div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           )}
         </div>
       </Card.Body>
     </Card>
   );
};

export default SalesChart;

