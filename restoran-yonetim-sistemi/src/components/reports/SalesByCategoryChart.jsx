// src/components/reports/SalesByCategoryChart.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { analyticsService } from '../../services/analyticsService';
import './SalesByCategoryChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const SalesByCategoryChart = () => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryData, setCategoryData] = useState({});
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Kategori Satışları',
      data: [],
      backgroundColor: [],
      borderWidth: 1,
    }]
  });

  // Chart renkleri
  const chartColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#BA68C8',
    '#FF9F40', '#4BC0C0', '#9966FF', '#FF99CC', '#FFB366',
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B'
  ];

  // API'den veri çek
  const fetchCategoryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await analyticsService.getSalesByCategory(startDate, endDate || null);
      setCategoryData(data);
    } catch (err) {
      console.error('Category data fetch error:', err);
      setError(err.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Component mount olduğunda veri çek
  useEffect(() => {
    fetchCategoryData();
  }, []);

  // Kategori verilerine göre chart verisini güncelle
  useEffect(() => {
    if (!categoryData || Object.keys(categoryData).length === 0) {
      setChartData({
        labels: [],
        datasets: [{
          label: 'Kategori Satışları',
          data: [],
          backgroundColor: [],
          borderWidth: 1,
        }]
      });
      return;
    }

    // Kategori verilerini işle
    const categories = Object.keys(categoryData);
    const sales = Object.values(categoryData).map(value => parseFloat(value) || 0);
    
    // Sadece satışı olan kategorileri göster
    const validCategories = categories.filter((_, index) => sales[index] > 0);
    const validSales = sales.filter(sale => sale > 0);

    const backgroundColor = validCategories.map((_, index) => chartColors[index % chartColors.length]);

    setChartData({
      labels: validCategories,
      datasets: [{
        label: 'Kategori Satışları',
        data: validSales,
        backgroundColor: backgroundColor,
        borderWidth: 1,
      }]
    });
  }, [categoryData]);

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
            
            return [
              `${label}: ₺${value.toLocaleString()} (${percentage}%)`
            ];
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

  const getDateRangeText = () => {
    if (endDate) {
      return `${startDate} - ${endDate}`;
    }
    return startDate;
  };

  const getTotalSales = () => {
    if (!categoryData || Object.keys(categoryData).length === 0) return 0;
    return Object.values(categoryData).reduce((total, value) => total + (parseFloat(value) || 0), 0);
  };

  if (error) {
    return (
      <Card className="mb-4 sales-by-category-chart" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
        <Card.Body>
          <div className="text-center" style={{ padding: '40px' }}>
            <div style={{ color: 'red' }}>Hata: {error}</div>
            <button 
              onClick={fetchCategoryData}
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
    <Card className="mb-4 sales-by-category-chart" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
      <Card.Body style={{ padding: '15px', overflow: 'hidden' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="fs-5 mb-0 sales-by-category-chart" style={{ color: colors.text }}>
            📊 Kategori Bazlı Satışlar
          </Card.Title>
        </div>

        {/* Tarih Seçimi */}
        <div className="d-flex gap-2 align-items-center mb-3" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: 'auto', minWidth: '140px', fontSize: '0.85rem' }}
            size="sm"
          />
          <span style={{ color: colors.textSecondary, fontSize: '0.85rem' }}>-</span>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: 'auto', minWidth: '140px', fontSize: '0.85rem' }}
            size="sm"
            placeholder="Opsiyonel"
          />
          <Button
            variant="primary"
            onClick={fetchCategoryData}
            disabled={!startDate || isLoading}
            style={{ minWidth: '80px', fontSize: '0.85rem', padding: '4px 8px' }}
            size="sm"
          >
            {isLoading ? 'Yükleniyor...' : 'Getir'}
          </Button>
        </div>

        <div className="text-center mb-2" style={{ color: colors.textSecondary, fontSize: '14px' }}>
          {endDate ? 'Tarih Aralığı' : 'Günlük'} Kategori Satışları ({getDateRangeText()})
        </div>

        {chartData.labels.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: colors.textSecondary }}>
            <div style={{ fontSize: '14px', marginBottom: '10px' }}>
              Bu tarih aralığında kategori satış verisi bulunamadı
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Seçilen tarihte henüz satış verisi bulunmuyor veya API'den veri alınamadı.
            </div>
          </div>
        ) : (
          <>
            <div className="chart-container sales-by-category-chart" style={{ maxWidth: '300px', margin: '0 auto', backgroundColor: colors.cardBackground, padding: '10px', borderRadius: '8px', height: '300px', border: `2px solid ${colors.border}`, overflow: 'hidden' }}>
              <div style={{ backgroundColor: colors.cardBackground, width: '100%', height: '100%' }}>
                <Pie data={chartData} options={options} />
              </div>
            </div>

            {/* Toplam Satış Özeti */}
            <div className="mt-3 text-center" style={{ backgroundColor: colors.surface, borderRadius: '8px', padding: '15px', border: `1px solid ${colors.border}` }}>
              <div style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>
                Toplam Satış: ₺{getTotalSales().toLocaleString()}
              </div>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                {chartData.labels.length} kategori
              </div>
            </div>

            {/* Kategori Detay Tablosu */}
            <div className="mt-3 sales-by-category-chart">
              <h6>Kategori Detayları</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Satış</th>
                      <th>Oran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const total = getTotalSales();
                      const categories = Object.keys(categoryData);
                      const sales = Object.values(categoryData).map(value => parseFloat(value) || 0);
                      
                      const validData = categories
                        .map((category, index) => ({ category, sales: sales[index] }))
                        .filter(item => item.sales > 0)
                        .sort((a, b) => b.sales - a.sales);

                      if (validData.length === 0) {
                        return (
                          <tr>
                            <td colSpan="3" className="text-center">
                              Bu dönemde satış verisi bulunamadı
                            </td>
                          </tr>
                        );
                      }

                      return validData.map((item, index) => {
                        const percentage = total > 0 ? ((item.sales / total) * 100).toFixed(1) : '0';
                        return (
                          <tr key={index}>
                            <td className="fw-medium">
                              {item.category}
                            </td>
                            <td>
                              ₺{item.sales.toLocaleString()}
                            </td>
                            <td>
                              %{percentage}
                            </td>
                          </tr>
                        );
                      });
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

export default SalesByCategoryChart;
