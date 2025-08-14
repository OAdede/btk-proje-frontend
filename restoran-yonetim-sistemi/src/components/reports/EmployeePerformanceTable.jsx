// src/components/reports/EmployeePerformanceTable.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';
import { analyticsService } from '../../services/analyticsService';
import './EmployeePerformanceTable.css';

const EmployeePerformanceTable = () => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // API'den veri çek
  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await analyticsService.getDailySalesSummary(selectedDate);
      setPerformanceData(data);
    } catch (err) {
      console.error('Performance data fetch error:', err);
      setError(err.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Component mount olduğunda veri çek
  useEffect(() => {
    fetchPerformanceData();
  }, []);

  // Performans verilerini parse et
  const parseEmployeePerformance = () => {
    if (!performanceData || !performanceData.employeePerformance) {
      return { employees: [], topPerformer: null };
    }

    try {
      const parsed = JSON.parse(performanceData.employeePerformance);
      return parsed;
    } catch (error) {
      console.error('Employee performance parse error:', error);
      return { employees: [], topPerformer: null };
    }
  };

  const { employees, topPerformer } = parseEmployeePerformance();

  const getTopPerformerBadge = (employeeId) => {
    if (topPerformer && topPerformer.employeeId === employeeId) {
      return (
        <span 
          style={{
            backgroundColor: '#FFD700',
            color: '#000',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            marginLeft: '5px'
          }}
        >
          🏆 En İyi
        </span>
      );
    }
    return null;
  };

  const formatCurrency = (amount) => {
    if (typeof amount === 'number') {
      return `₺${amount.toLocaleString()}`;
    }
    return `₺${parseFloat(amount || 0).toLocaleString()}`;
  };

  if (error) {
    return (
      <Card className="mb-4 employee-performance-table" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
        <Card.Body>
          <div className="text-center" style={{ padding: '40px' }}>
            <div style={{ color: 'red' }}>Hata: {error}</div>
            <button 
              onClick={fetchPerformanceData}
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
    <Card className="mb-4 employee-performance-table" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
      <Card.Body style={{ padding: '15px', overflow: 'hidden' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="fs-5 mb-0 employee-performance-table" style={{ color: colors.text }}>
            👥 Çalışan Performans Raporu
          </Card.Title>
        </div>

        {/* Tarih Seçimi */}
        <div className="d-flex gap-2 align-items-center mb-3" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', minWidth: '140px', fontSize: '0.85rem' }}
            size="sm"
          />
          <Button
            variant="primary"
            onClick={fetchPerformanceData}
            disabled={!selectedDate || isLoading}
            style={{ minWidth: '80px', fontSize: '0.85rem', padding: '4px 8px' }}
            size="sm"
          >
            {isLoading ? 'Yükleniyor...' : 'Getir'}
          </Button>
        </div>

        <div className="text-center mb-2" style={{ color: colors.textSecondary, fontSize: '14px' }}>
          {selectedDate} Tarihli Çalışan Performans Raporu
        </div>

        {isLoading ? (
          <div className="text-center" style={{ padding: '40px', color: colors.textSecondary }}>
            <div>Veriler yükleniyor...</div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: colors.textSecondary }}>
            <div style={{ fontSize: '14px', marginBottom: '10px' }}>
              Bu tarihte çalışan performans verisi bulunamadı
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Seçilen tarihte henüz performans verisi bulunmuyor veya API'den veri alınamadı.
            </div>
          </div>
        ) : (
          <>
            {/* En İyi Performans Gösteren */}
            {topPerformer && (
              <div className="mb-3" style={{ backgroundColor: colors.surface, borderRadius: '8px', padding: '15px', border: `1px solid ${colors.border}` }}>
                <h6 style={{ color: colors.text, fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>
                  🏆 En İyi Performans Gösteren Çalışan
                </h6>
                <div className="text-center">
                  <div style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>
                    {topPerformer.employeeName || 'Bilinmeyen Çalışan'}
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                    Toplam Satış: {formatCurrency(topPerformer.totalSales || 0)} | 
                    Sipariş Sayısı: {topPerformer.orderCount || 0}
                  </div>
                </div>
              </div>
            )}

            {/* Çalışan Performans Tablosu */}
            <div style={{ backgroundColor: colors.surface, borderRadius: '8px', padding: '15px', border: `1px solid ${colors.border}` }}>
              <h6 style={{ color: colors.text, fontSize: '14px', marginBottom: '10px' }}>
                Tüm Çalışanların Performans Detayları
              </h6>
              <div className="table-responsive">
                <table className="table table-sm" style={{ color: colors.text, fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: colors.cardBackground }}>
                      <th style={{ color: colors.text, fontSize: '11px' }}>Çalışan</th>
                      <th style={{ color: colors.text, fontSize: '11px' }}>Toplam Satış</th>
                      <th style={{ color: colors.text, fontSize: '11px' }}>Sipariş Sayısı</th>
                      <th style={{ color: colors.text, fontSize: '11px' }}>Ortalama Sipariş</th>
                      <th style={{ color: colors.text, fontSize: '11px' }}>Müşteri Sayısı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee, index) => (
                      <tr key={employee.employeeId || index} style={{ backgroundColor: colors.cardBackground }}>
                        <td style={{ color: colors.text, fontSize: '11px', fontWeight: '500' }}>
                          {employee.employeeName || 'Bilinmeyen Çalışan'}
                          {getTopPerformerBadge(employee.employeeId)}
                        </td>
                        <td style={{ color: colors.text, fontSize: '11px' }}>
                          {formatCurrency(employee.totalSales)}
                        </td>
                        <td style={{ color: colors.text, fontSize: '11px' }}>
                          {employee.orderCount || 0}
                        </td>
                        <td style={{ color: colors.text, fontSize: '11px' }}>
                          {formatCurrency(employee.averageOrderValue || 0)}
                        </td>
                        <td style={{ color: colors.text, fontSize: '11px' }}>
                          {employee.customerCount || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Özet İstatistikler */}
            <div className="mt-3" style={{ backgroundColor: colors.surface, borderRadius: '8px', padding: '15px', border: `1px solid ${colors.border}` }}>
              <h6 style={{ color: colors.text, fontSize: '14px', marginBottom: '10px' }}>
                Özet İstatistikler
              </h6>
              <div className="row text-center">
                <div className="col-4">
                  <div style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>
                    {employees.length}
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '11px' }}>
                    Toplam Çalışan
                  </div>
                </div>
                <div className="col-4">
                  <div style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>
                    {formatCurrency(employees.reduce((total, emp) => total + (parseFloat(emp.totalSales) || 0), 0))}
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '11px' }}>
                    Toplam Satış
                  </div>
                </div>
                <div className="col-4">
                  <div style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>
                    {employees.reduce((total, emp) => total + (emp.orderCount || 0), 0)}
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '11px' }}>
                    Toplam Sipariş
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmployeePerformanceTable;
