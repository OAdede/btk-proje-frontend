// src/components/reports/EmployeePerformanceTable.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Form, ButtonGroup } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';
import { analyticsService } from '../../services/analyticsService';
import './EmployeePerformanceTable.css';

const EmployeePerformanceTable = () => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [period, setPeriod] = useState('daily'); // daily, monthly, yearly
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = ['ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran', 
                   'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik'];
    return months[new Date().getMonth()];
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

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
    { value: (new Date().getFullYear() - 2).toString(), label: (new Date().getFullYear() - 2).toString() },
    { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
    { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
    { value: (new Date().getFullYear() + 1).toString(), label: (new Date().getFullYear() + 1).toString() },
  ];

  // API'den günlük performans verisi çek
  const fetchDailyPerformanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all daily sales summaries and filter for the selected month and year
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
        
        // Find the most recent data with employee performance
        const recentData = filteredData.find(data => {
          if (!data.employeePerformance) return false;
          if (typeof data.employeePerformance === 'string' && data.employeePerformance === '[object Object]') {
            return false;
          }
          return true;
        });
        
        if (recentData && recentData.employeePerformance) {
          try {
            let parsedPerformance;
            if (typeof recentData.employeePerformance === 'string') {
              try {
                parsedPerformance = JSON.parse(recentData.employeePerformance);
              } catch (jsonError) {
                if (recentData.employeePerformance === '[object Object]') {
                  console.log('Employee performance data is malformed, skipping');
                  setPerformanceData(null);
                  return;
                } else {
                  throw jsonError;
                }
              }
            } else {
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
      } else {
        setPerformanceData(null);
      }
    } catch (err) {
      console.error('Daily performance data fetch error:', err);
      setError(err.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // API'den aylık performans verisi çek
  const fetchMonthlyPerformanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all monthly sales summaries and filter for the selected year
      const allMonthlyData = await analyticsService.getAllMonthlySalesSummaries();
      
      if (allMonthlyData && allMonthlyData.length > 0) {
        const selectedYearInt = parseInt(selectedYear);
        
        // Filter data for the selected year
        const filteredData = allMonthlyData.filter(data => {
          if (!data.reportDate) return false;
          const date = new Date(data.reportDate);
          return date.getFullYear() === selectedYearInt;
        });
        
        // Find the most recent data with employee performance
        const recentData = filteredData.find(data => {
          if (!data.employeePerformance) return false;
          if (typeof data.employeePerformance === 'string' && data.employeePerformance === '[object Object]') {
            return false;
          }
          return true;
        });
        
        if (recentData && recentData.employeePerformance) {
          try {
            let parsedPerformance;
            if (typeof recentData.employeePerformance === 'string') {
              try {
                parsedPerformance = JSON.parse(recentData.employeePerformance);
              } catch (jsonError) {
                if (recentData.employeePerformance === '[object Object]') {
                  console.log('Employee performance data is malformed, skipping');
                  setPerformanceData(null);
                  return;
                } else {
                  throw jsonError;
                }
              }
            } else {
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
      } else {
        setPerformanceData(null);
      }
    } catch (err) {
      console.error('Monthly performance data fetch error:', err);
      setError(err.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // API'den yıllık performans verisi çek
  const fetchYearlyPerformanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all yearly sales summaries and filter for the selected year
      const allYearlyData = await analyticsService.getAllYearlySalesSummaries();
      
      if (allYearlyData && allYearlyData.length > 0) {
        const selectedYearInt = parseInt(selectedYear);
        
        // Filter data for the selected year
        const filteredData = allYearlyData.filter(data => {
          if (!data.reportDate) return false;
          const date = new Date(data.reportDate);
          return date.getFullYear() === selectedYearInt;
        });
        
        // Find the most recent data with employee performance
        const recentData = filteredData.find(data => {
          if (!data.employeePerformance) return false;
          if (typeof data.employeePerformance === 'string' && data.employeePerformance === '[object Object]') {
            return false;
          }
          return true;
        });
        
        if (recentData && recentData.employeePerformance) {
          try {
            let parsedPerformance;
            if (typeof recentData.employeePerformance === 'string') {
              try {
                parsedPerformance = JSON.parse(recentData.employeePerformance);
              } catch (jsonError) {
                if (recentData.employeePerformance === '[object Object]') {
                  console.log('Employee performance data is malformed, skipping');
                  setPerformanceData(null);
                  return;
                } else {
                  throw jsonError;
                }
              }
            } else {
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
      } else {
        setPerformanceData(null);
      }
    } catch (err) {
      console.error('Yearly performance data fetch error:', err);
      setError(err.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Period değiştiğinde veri çek
  useEffect(() => {
    if (period === 'daily') {
      fetchDailyPerformanceData();
    } else if (period === 'monthly') {
      fetchMonthlyPerformanceData();
    } else if (period === 'yearly') {
      fetchYearlyPerformanceData();
    }
  }, [period, selectedMonth, selectedYear]);

  // Performans verilerini parse et
  const parseEmployeePerformance = () => {
    if (!performanceData) {
      return { employees: [], topPerformer: null };
    }

    try {
      // Check if this is the new endpoint format (object with employee data)
      if (performanceData.employees && Array.isArray(performanceData.employees)) {
        // This is the fallback format from daily sales data
        return {
          employees: performanceData.employees || [],
          topPerformer: performanceData.topPerformer || null
        };
      }

      // This is the new endpoint format (object with employee IDs as keys)
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

  const getPeriodTitle = () => {
    if (period === 'daily') {
      const monthLabel = months.find(m => m.value === selectedMonth)?.label || selectedMonth;
      return `${monthLabel} ${selectedYear} - Günlük`;
    } else if (period === 'monthly') {
      return `${selectedYear} - Aylık`;
    } else if (period === 'yearly') {
      return `${selectedYear} - Yıllık`;
    }
    return 'Performans Raporu';
  };

  if (error) {
    return (
      <Card className="mb-4 employee-performance-table" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
        <Card.Body>
          <div className="text-center" style={{ padding: '40px' }}>
            <div style={{ color: 'red' }}>Hata: {error}</div>
            <button 
              onClick={() => {
                if (period === 'daily') {
                  fetchDailyPerformanceData();
                } else if (period === 'monthly') {
                  fetchMonthlyPerformanceData();
                } else if (period === 'yearly') {
                  fetchYearlyPerformanceData();
                }
              }}
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
          
          <div className="d-flex gap-2 align-items-center">
            <ButtonGroup size="sm">
              <Button
                variant={period === 'daily' ? 'primary' : 'outline-primary'}
                onClick={() => setPeriod('daily')}
                style={{ fontSize: '0.85rem', padding: '4px 8px' }}
              >
                Günlük
              </Button>
              <Button
                variant={period === 'monthly' ? 'primary' : 'outline-primary'}
                onClick={() => setPeriod('monthly')}
                style={{ fontSize: '0.85rem', padding: '4px 8px' }}
              >
                Aylık
              </Button>
              <Button
                variant={period === 'yearly' ? 'primary' : 'outline-primary'}
                onClick={() => setPeriod('yearly')}
                style={{ fontSize: '0.85rem', padding: '4px 8px' }}
              >
                Yıllık
              </Button>
            </ButtonGroup>

            {(period === 'daily' || period === 'monthly') && (
              <Form.Select
                className="employee-performance-table"
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

            <Form.Select
              className="employee-performance-table"
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
          </div>
        </div>

        <div className="text-center mb-2" style={{ color: colors.textSecondary, fontSize: '14px' }}>
          {getPeriodTitle()} Çalışan Performans Raporu
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
              {getPeriodTitle()} için henüz performans verisi bulunmuyor veya API'den veri alınamadı.
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
