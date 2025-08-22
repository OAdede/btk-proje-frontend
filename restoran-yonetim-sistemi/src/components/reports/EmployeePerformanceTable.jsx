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


  // API'den veri çek
  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get employee performance from the dedicated endpoint first
      try {
        const performanceData = await analyticsService.getEmployeePerformance('DAILY');

        if (performanceData && Object.keys(performanceData).length > 0) {
          setPerformanceData(performanceData);
          return;
        }
      } catch (endpointError) {

      }
      
      // Fallback: Get employee performance from monthly sales summaries endpoint
      const allMonthlyData = await analyticsService.getAllMonthlySalesSummaries();
      
      // Find the most recent data with employee performance
      const recentData = allMonthlyData.find(data => {
        if (!data.employeePerformance) return false;
        // Skip malformed data
        if (typeof data.employeePerformance === 'string' && data.employeePerformance === '[object Object]') {
          return false;
        }
        return true;
      });
      
      if (recentData && recentData.employeePerformance) {
        try {
          // Handle different data formats
          let parsedPerformance;
          if (typeof recentData.employeePerformance === 'string') {
            // Try to parse as JSON first
            try {
              parsedPerformance = JSON.parse(recentData.employeePerformance);
            } catch (jsonError) {
              // If it's "[object Object]", the data is malformed, skip it
              if (recentData.employeePerformance === '[object Object]') {
  
                setPerformanceData(null);
                return;
              } else {
                throw jsonError;
              }
            }
          } else {
            // It's already an object
            parsedPerformance = recentData.employeePerformance;
          }
          setPerformanceData(parsedPerformance);
        } catch (parseError) {
          console.error('Failed to parse employee performance data:', parseError);
          setError('Çalışan performans verisi işlenirken hata oluştu');
        }
      } else {
        setPerformanceData(null);
      }
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

    if (!performanceData) {
      return { employees: [], topPerformer: null };
    }

    try {
      // Check if this is the backend format (object with employees array)
      if (performanceData.employees && Array.isArray(performanceData.employees)) {
        // Transform the backend format to frontend format
        const employees = performanceData.employees.map(emp => ({
          employeeId: emp.employeeId,
          employeeName: emp.employeeName || `Çalışan ${emp.employeeId}`,
          totalSales: parseFloat(emp.totalRevenue || 0),
          orderCount: emp.totalOrders || 0,
          averageOrderValue: parseFloat(emp.averageOrderValue || 0),
          customerCount: emp.totalItemsSold || 0 // Using totalItemsSold as customerCount for now
        }));
        
        // Find top performer
        let topPerformer = null;
        let maxSales = 0;
        
        employees.forEach(employee => {
          if (employee.totalSales > maxSales) {
            maxSales = employee.totalSales;
            topPerformer = employee;
          }
        });

        return { employees, topPerformer };
      }

      // Fallback: This is the old endpoint format (object with employee IDs as keys)
      const employees = [];
      let topPerformer = null;
      let maxSales = 0;

      // Process the performance data object
      Object.entries(performanceData).forEach(([employeeId, data]) => {
        if (data && typeof data === 'object') {
          const employee = {
            employeeId: employeeId,
            employeeName: data.employeeName || `Çalışan ${employeeId}`,
            totalSales: data.totalSales || 0,
            orderCount: data.orderCount || 0,
            averageOrderValue: data.averageOrderValue || 0,
            customerCount: data.customerCount || 0
          };
          
          employees.push(employee);
          
          // Find top performer
          if (employee.totalSales > maxSales) {
            maxSales = employee.totalSales;
            topPerformer = employee;
          }
        }
      });

      return { employees, topPerformer };
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

        <div className="text-center mb-2" style={{ color: colors.textSecondary, fontSize: '14px' }}>
          Çalışan Performans Raporu
        </div>

        {isLoading ? (
          <div className="text-center" style={{ padding: '40px', color: colors.textSecondary }}>
            <div>Veriler yükleniyor...</div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: colors.textSecondary }}>
            <div style={{ fontSize: '14px', marginBottom: '10px' }}>
              Çalışan performans verisi bulunamadı
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Henüz performans verisi bulunmuyor veya API'den veri alınamadı.
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
