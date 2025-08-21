// src/components/reports/IncomeExpenseTable.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, ButtonGroup, Button, Badge } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';
import { analyticsService } from '../../services/analyticsService';
import './IncomeExpenseTable.css';

const IncomeExpenseTable = () => {
  const { colors } = useTheme();
  const [period, setPeriod] = useState('daily'); // daily, weekly, monthly
  const [dailySalesData, setDailySalesData] = useState(null);
  const [weeklySalesData, setWeeklySalesData] = useState(null);
  const [monthlySalesData, setMonthlySalesData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realtimeStats, setRealtimeStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // API'den daily sales verilerini çek
  const fetchDailySales = async (date) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all daily sales summaries and filter for the specified date
      const allDailyData = await analyticsService.getAllDailySalesSummaries();
      const dateData = allDailyData.find(data => data.reportDate === date);
      
      setDailySalesData(dateData || null);
    } catch (err) {
      console.error('Daily sales fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // API'den weekly sales verilerini çek
  const fetchWeeklySales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all weekly sales summaries and get the most recent one
      const allWeeklyData = await analyticsService.getAllWeeklySalesSummaries();
      const mostRecentWeekly = allWeeklyData.length > 0 ? allWeeklyData[0] : null;
      
      setWeeklySalesData(mostRecentWeekly);
    } catch (err) {
      console.error('Weekly sales fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // API'den monthly sales verilerini çek
  const fetchMonthlySales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all monthly sales summaries and get the most recent one
      const allMonthlyData = await analyticsService.getAllMonthlySalesSummaries();
      const mostRecentMonthly = allMonthlyData.length > 0 ? allMonthlyData[0] : null;
      
      setMonthlySalesData(mostRecentMonthly);
    } catch (err) {
      console.error('Monthly sales fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Gerçek zamanlı istatistikleri çek
  const fetchRealtimeStats = async () => {
    try {
      setIsLoadingStats(true);
      const stats = await analyticsService.getRealtimeStats();
      setRealtimeStats(stats);
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
      setRealtimeStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Component mount olduğunda ve period değiştiğinde veri çek
  useEffect(() => {
    fetchRealtimeStats();
    if (period === 'daily') {
      fetchDailySales();
    } else if (period === 'weekly') {
      fetchWeeklySales();
    } else if (period === 'monthly') {
      fetchMonthlySales();
    }
  }, [period]);

  // Sales verilerini tablo formatına dönüştür
  const transformSalesToTableData = (salesData) => {
    if (!salesData || !salesData.salesByCategory) {
      return [];
    }

    const tableData = [];
    let id = 1;

    // Kategori bazlı satışları ekle
    Object.entries(salesData.salesByCategory).forEach(([category, amount]) => {
      const categoryName = category === 'drinks' ? 'İçecek Satışı' : 
                          category === 'main_dishes' ? 'Ana Yemek Satışı' :
                          category === 'desserts' ? 'Tatlı Satışı' :
                          category === 'appetizers' ? 'Başlangıç Satışı' :
                          'Diğer Satışlar';

      tableData.push({
        id: id++,
        date: salesData.reportDate,
        category: categoryName,
        description: `${categoryName} - ${salesData.reportType} Raporu`,
        amount: parseFloat(amount),
        payment: 'Karma',
        orderCount: salesData.totalOrders,
        averageOrder: salesData.averageOrderValue
      });
    });

    // En popüler ürünü ekle
    if (salesData.mostPopularItemName) {
      tableData.push({
        id: id++,
        date: salesData.reportDate,
        category: 'En Popüler Ürün',
        description: `${salesData.mostPopularItemName} - En çok satan ürün`,
        amount: salesData.averageOrderValue * 0.3, // Tahmini değer
        payment: 'Karma',
        orderCount: Math.floor(salesData.totalOrders * 0.2), // Tahmini sipariş sayısı
        averageOrder: salesData.averageOrderValue
      });
    }

    return tableData;
  };

  // Mevcut veriyi belirle
  const getCurrentData = () => {
    if (period === 'daily') {
      return transformSalesToTableData(dailySalesData);
    } else if (period === 'weekly') {
      return transformSalesToTableData(weeklySalesData);
    } else if (period === 'monthly') {
      return transformSalesToTableData(monthlySalesData);
    }
    return [];
  };

  // Mevcut sales data'yı belirle
  const getCurrentSalesData = () => {
    if (period === 'daily') {
      return dailySalesData;
    } else if (period === 'weekly') {
      return weeklySalesData;
    } else if (period === 'monthly') {
      return monthlySalesData;
    }
    return null;
  };

  const currentData = getCurrentData();
  const currentSalesData = getCurrentSalesData();
  const totalRevenue = currentData.reduce((sum, item) => sum + item.amount, 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getPeriodTitle = () => {
    switch(period) {
      case 'daily': return 'Günlük';
      case 'weekly': return 'Haftalık';
      case 'monthly': return 'Aylık';
      default: return 'Günlük';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ backgroundColor: colors.background, padding: '20px', borderRadius: '8px' }}>
        <Card className="mb-4" style={{ backgroundColor: colors.cardBackground, color: colors.text, border: 'none' }}>
          <Card.Body className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
            <p className="mt-3" style={{ color: colors.textSecondary }}>Ciro verileri yükleniyor...</p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && (period === 'daily' || period === 'weekly' || period === 'monthly')) {
    return (
      <div style={{ backgroundColor: colors.background, padding: '20px', borderRadius: '8px' }}>
        <Card className="mb-4" style={{ backgroundColor: colors.cardBackground, color: colors.text, border: 'none' }}>
          <Card.Body className="text-center">
            <p style={{ color: colors.danger }}>❌ Hata: {error}</p>
            <Button variant="outline-primary" onClick={() => {
              if (period === 'daily') fetchDailySales();
              else if (period === 'weekly') fetchWeeklySales();
              else if (period === 'monthly') fetchMonthlySales();
            }}>
              Tekrar Dene
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background, padding: '20px', borderRadius: '8px' }}>
      <Card className="mb-4" style={{ backgroundColor: colors.cardBackground, color: colors.text, border: 'none' }}>
        <Card.Body>
          <Card.Title className="d-flex justify-content-between align-items-center mb-3">
            <span style={{ color: colors.text }}>💰 Ciro Detayları</span>
            <div className="d-flex gap-2">
              <ButtonGroup size="sm">
                <Button
                  variant={period === 'daily' ? 'primary' : 'outline-primary'}
                  onClick={() => setPeriod('daily')}
                >
                  Günlük
                </Button>
                <Button
                  variant={period === 'weekly' ? 'primary' : 'outline-primary'}
                  onClick={() => setPeriod('weekly')}
                >
                  Haftalık
                </Button>
                <Button
                  variant={period === 'monthly' ? 'primary' : 'outline-primary'}
                  onClick={() => setPeriod('monthly')}
                >
                  Aylık
                </Button>
              </ButtonGroup>
            </div>
          </Card.Title>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div style={{ color: colors.textSecondary, fontSize: '14px' }}>
              {getPeriodTitle()} ciro raporu
              {currentSalesData && (
                <span style={{ marginLeft: '10px', color: colors.primary }}>
                  ({formatDate(currentSalesData.reportDate)})
                </span>
              )}
            </div>
          </div>

          {/* Ciro Özet Kartı */}
          <div className="row mb-3">
            <div className="col-md-12">
              <div className="card" style={{ backgroundColor: colors.success, color: 'white' }}>
                <div className="card-body text-center">
                  <h6 style={{ color: 'white' }}>💰 Toplam Ciro</h6>
                  <h3 style={{ color: 'white', fontWeight: 'bold' }}>
                    {isLoadingStats ? "Yükleniyor..." : 
                     realtimeStats ? 
                       (period === 'daily' ? `₺${parseFloat(realtimeStats.todayRevenue || 0).toLocaleString()}` :
                        period === 'weekly' ? `₺${parseFloat(realtimeStats.weeklyRevenue || 0).toLocaleString()}` :
                        period === 'monthly' ? `₺${parseFloat(realtimeStats.monthlyRevenue || 0).toLocaleString()}` :
                        `₺${parseFloat(realtimeStats.todayRevenue || 0).toLocaleString()}`) :
                       (currentSalesData ? formatAmount(currentSalesData.totalRevenue) : formatAmount(totalRevenue))
                    }
                  </h3>
                  <small style={{ color: 'white', opacity: 0.8 }}>
                    {getPeriodTitle()} toplam gelir
                    {realtimeStats && (
                      <span> • {period === 'daily' ? realtimeStats.todayOrders :
                                period === 'weekly' ? realtimeStats.weeklyOrders :
                                period === 'monthly' ? realtimeStats.monthlyOrders :
                                realtimeStats.todayOrders} sipariş</span>
                    )}
                    {!realtimeStats && currentSalesData && (
                      <span> • {currentSalesData.totalOrders} sipariş • {currentSalesData.totalCustomers} müşteri</span>
                    )}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <Table responsive className="custom-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Kategori</th>
                <th>Açıklama</th>
                <th>Tutar</th>
                <th>Ödeme Yöntemi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id || crypto.randomUUID()}>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    <Badge bg="success" style={{ fontSize: '12px' }}>
                      {item.category}
                    </Badge>
                  </td>
                  <td>{item.description}</td>
                  <td style={{ fontWeight: 'bold', color: colors.success }}>
                    {formatAmount(item.amount)}
                  </td>
                  <td>
                    <Badge bg="secondary" style={{ fontSize: '11px' }}>
                      {item.payment}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {currentData.length === 0 && (
            <div className="text-center py-4">
              <p style={{ color: colors.textSecondary }}>
                {period === 'daily' 
                  ? 'Bugün için ciro verisi bulunamadı.'
                  : period === 'weekly'
                  ? 'Bu hafta için ciro verisi bulunamadı.'
                  : period === 'monthly'
                  ? 'Bu ay için ciro verisi bulunamadı.'
                  : 'Bu dönem için ciro verisi bulunamadı.'
                }
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default IncomeExpenseTable; 