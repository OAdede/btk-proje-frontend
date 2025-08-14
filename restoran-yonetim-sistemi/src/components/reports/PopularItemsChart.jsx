// src/components/reports/PopularItemsChart.jsx
import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { analyticsService } from '../../services/analyticsService';
import './PopularItemsChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PopularItemsChart = () => {
  const { colors } = useTheme();
  const [timeFilter, setTimeFilter] = useState('daily'); // daily, weekly, monthly, yearly
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Satış Adedi',
      data: [],
      backgroundColor: [],
      borderWidth: 1,
    }]
  });

  // Chart renkleri
  const chartColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#BA68C8',
    '#FF9F40', '#4BC0C0', '#9966FF', '#FF99CC', '#FFB366'
  ];

  // API'den veri çek
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Tek endpoint'ten tüm verileri çek
      const summaryData = await analyticsService.getTopProductsSummary(10);
      
      // Verileri doğrudan kullan
      const combinedData = {
        daily: summaryData?.daily || [],
        weekly: summaryData?.weekly || [],
        monthly: summaryData?.monthly || [],
        yearly: summaryData?.yearly || []
      };
      
      setAnalyticsData(combinedData);
    } catch (err) {
      console.error('Analytics data fetch error:', err);
      setError(err.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Component mount olduğunda veri çek
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Seçilen filtreye göre chart verisini güncelle
  useEffect(() => {
    
    if (!analyticsData || !analyticsData[timeFilter]) {
      setChartData({
        labels: [],
        datasets: [{
          label: 'Satış Adedi',
          data: [],
          backgroundColor: [],
          borderWidth: 1,
        }]
      });
      return;
    }

    const selectedData = analyticsData[timeFilter];
    
    // Veri array mi ve boş değil mi kontrol et
    if (!Array.isArray(selectedData) || selectedData.length === 0) {
      setChartData({
        labels: [],
        datasets: [{
          label: 'Satış Adedi',
          data: [],
          backgroundColor: [],
          borderWidth: 1,
        }]
      });
      return;
    }
    
    // En çok satan 5 ürünü al (totalQuantity'e göre sırala)
    const topProducts = selectedData
      .filter(product => product && product.totalQuantity > 0) // Sadece quantity > 0 olanları al
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    const labels = topProducts.map(product => product.productName);
    const data = topProducts.map(product => product.totalQuantity);
    const backgroundColor = topProducts.map((_, index) => chartColors[index % chartColors.length]);

    setChartData({
      labels: labels,
      datasets: [{
        label: 'Satış Adedi',
        data: data,
        backgroundColor: backgroundColor,
        borderWidth: 1,
      }]
    });
  }, [timeFilter, analyticsData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.text,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            
            // Ürün detaylarını bul
            const selectedData = analyticsData[timeFilter] || [];
            const product = selectedData.find(p => p.productName === label);
            
            if (product) {
              return [
                `${label}: ${value} adet (${percentage}%)`,
                `Toplam Gelir: ₺${product.totalRevenue?.toLocaleString() || 0}`,
                `Sipariş Sayısı: ${product.orderCount || 0}`
              ];
            }
            
            return `${label}: ${value} adet (${percentage}%)`;
          }
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

  const getFilterTitle = () => {
    switch(timeFilter) {
      case 'daily': return 'Günlük';
      case 'weekly': return 'Haftalık';
      case 'monthly': return 'Aylık';
      case 'yearly': return 'Yıllık';
      default: return 'Günlük';
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-4 popular-items-chart" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
        <Card.Body>
          <div className="text-center" style={{ padding: '40px' }}>
            <div style={{ color: colors.textSecondary }}>Veriler yükleniyor...</div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4 popular-items-chart" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
        <Card.Body>
          <div className="text-center" style={{ padding: '40px' }}>
            <div style={{ color: 'red' }}>Hata: {error}</div>
            <button 
              onClick={fetchAnalyticsData}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Tekrar Dene
            </button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 popular-items-chart" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="fs-5 mb-0 popular-items-chart" style={{ color: colors.text }}>
            🍕 En Çok Satan Ürünler
          </Card.Title>
          
          {/* Filtre Butonları */}
          <div className="filter-buttons">
            <button
              onClick={() => setTimeFilter('daily')}
              className={`filter-btn ${timeFilter === 'daily' ? 'active' : ''}`}
              style={{
                backgroundColor: timeFilter === 'daily' ? colors.primary : colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: '6px 12px',
                marginRight: '8px',
                fontSize: '12px',
                fontWeight: timeFilter === 'daily' ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              Günlük
            </button>
            <button
              onClick={() => setTimeFilter('weekly')}
              className={`filter-btn ${timeFilter === 'weekly' ? 'active' : ''}`}
              style={{
                backgroundColor: timeFilter === 'weekly' ? colors.primary : colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: '6px 12px',
                marginRight: '8px',
                fontSize: '12px',
                fontWeight: timeFilter === 'weekly' ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              Haftalık
            </button>
            <button
              onClick={() => setTimeFilter('monthly')}
              className={`filter-btn ${timeFilter === 'monthly' ? 'active' : ''}`}
              style={{
                backgroundColor: timeFilter === 'monthly' ? colors.primary : colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: '6px 12px',
                marginRight: '8px',
                fontSize: '12px',
                fontWeight: timeFilter === 'monthly' ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              Aylık
            </button>
            <button
              onClick={() => setTimeFilter('yearly')}
              className={`filter-btn ${timeFilter === 'yearly' ? 'active' : ''}`}
              style={{
                backgroundColor: timeFilter === 'yearly' ? colors.primary : colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: timeFilter === 'yearly' ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              Yıllık
            </button>
          </div>
        </div>

        <div className="text-center mb-2" style={{ color: colors.textSecondary, fontSize: '14px' }}>
          {getFilterTitle()} En Çok Satan Ürünler
        </div>

        {chartData.labels.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: colors.textSecondary }}>
            <div style={{ fontSize: '14px', marginBottom: '10px' }}>
              {getFilterTitle()} en çok satan ürün verisi bulunamadı
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Bu dönemde henüz satış verisi bulunmuyor veya API'den veri alınamadı.
            </div>
          </div>
        ) : (
          <>
            <div className="chart-container popular-items-chart" style={{ maxWidth: '300px', margin: '0 auto', backgroundColor: colors.cardBackground, padding: '10px', borderRadius: '8px', height: '300px', border: `2px solid ${colors.border}`, overflow: 'hidden' }}>
              <div style={{ backgroundColor: colors.cardBackground, width: '100%', height: '100%' }}>
                <Pie data={chartData} options={options} />
              </div>
            </div>

            {/* Ürün Detay Tablosu */}
            <div className="mt-3" style={{ backgroundColor: colors.surface, borderRadius: '8px', padding: '15px', border: `1px solid ${colors.border}` }}>
              <h6 style={{ color: colors.text, fontSize: '14px', marginBottom: '10px' }}>
                {getFilterTitle()} En Çok Satan Ürün Detayları
              </h6>
              <div className="table-responsive">
                <table className="table table-sm" style={{ color: colors.text, fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: colors.cardBackground }}>
                      <th style={{ color: colors.text, fontSize: '11px' }}>Ürün</th>
                      <th style={{ color: colors.text, fontSize: '11px' }}>Adet</th>
                      <th style={{ color: colors.text, fontSize: '11px' }}>Gelir</th>
                      <th style={{ color: colors.text, fontSize: '11px' }}>Sipariş</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const selectedData = analyticsData[timeFilter] || [];
                      const topProducts = selectedData
                        .filter(product => product && product.totalQuantity > 0) // Sadece quantity > 0 olanları al
                        .sort((a, b) => b.totalQuantity - a.totalQuantity)
                        .slice(0, 5);
                      
                      if (topProducts.length === 0) {
                        return (
                          <tr>
                            <td colSpan="4" style={{ color: colors.textSecondary, fontSize: '11px', textAlign: 'center' }}>
                              Bu dönemde satış verisi bulunamadı
                            </td>
                          </tr>
                        );
                      }
                      
                      return topProducts.map((product, index) => (
                        <tr key={product.productId || index} style={{ backgroundColor: colors.cardBackground }}>
                          <td style={{ color: colors.text, fontSize: '11px', fontWeight: '500' }}>
                            {product.productName}
                          </td>
                          <td style={{ color: colors.text, fontSize: '11px' }}>
                            {product.totalQuantity?.toLocaleString() || 0}
                          </td>
                          <td style={{ color: colors.text, fontSize: '11px' }}>
                            ₺{product.totalRevenue?.toLocaleString() || 0}
                          </td>
                          <td style={{ color: colors.text, fontSize: '11px' }}>
                            {product.orderCount || 0}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </Card.Body>
    </Card>
  );
};

export default PopularItemsChart;
