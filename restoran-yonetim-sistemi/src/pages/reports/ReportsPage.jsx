import React, { useContext, useState, useEffect } from 'react';
import { TableContext } from '../../context/TableContext';
import { analyticsService } from '../../services/analyticsService';
import SalesChart from '../../components/reports/SalesChart';
import PopularItemsChart from '../../components/reports/PopularItemsChart';
import SalesByCategoryChart from '../../components/reports/SalesByCategoryChart';
import EmployeePerformanceTable from '../../components/reports/EmployeePerformanceTable';
import IncomeExpenseTable from '../../components/reports/IncomeExpenseTable';
import './ReportsPage.css';

const ReportsPage = () => {
    const { reservations, dailyOrderCount } = useContext(TableContext);
    const [dailySalesData, setDailySalesData] = useState(null);
    const [isLoadingSales, setIsLoadingSales] = useState(true);
    const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);
    const [summaryGenerationStatus, setSummaryGenerationStatus] = useState({
        daily: false,
        weekly: false,
        monthly: false,
        yearly: false
    });
    const [lastGeneratedTime, setLastGeneratedTime] = useState(null);
    const [generationError, setGenerationError] = useState(null);
    const [realtimeStats, setRealtimeStats] = useState(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Generate all summaries for current timestamp when page loads
    const generateAllSummaries = async () => {
        try {
            setIsGeneratingSummaries(true);
            setGenerationError(null); // Clear any previous errors
            setSummaryGenerationStatus({
                daily: false,
                weekly: false,
                monthly: false,
                yearly: false
            });

            const now = new Date();
            
            // Safety check to ensure we have a valid date
            if (isNaN(now.getTime())) {
                throw new Error('Geçersiz tarih oluşturuldu');
            }
            

            
            const results = await analyticsService.generateAllSummariesForCurrentTime();
            
            if (results) {
                setSummaryGenerationStatus({
                    daily: !!results.daily,
                    weekly: !!results.weekly,
                    monthly: !!results.monthly,
                    yearly: !!results.yearly
                });

                // Set the current timestamp as last generated time
                setLastGeneratedTime(new Date());


                
                // After generating summaries, fetch the updated daily sales data
                await fetchDailySalesData();
            } else {
                console.warn('⚠️ Summary generation returned no results');
                setGenerationError('Rapor oluşturma işlemi sonuç döndürmedi. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('❌ Error generating summaries:', error);
            // Set error state for user feedback
            setGenerationError(`Rapor oluşturma hatası: ${error.message || 'Bilinmeyen hata'}`);
            setSummaryGenerationStatus({
                daily: false,
                weekly: false,
                monthly: false,
                yearly: false
            });
        } finally {
            setIsGeneratingSummaries(false);
        }
    };

    // Günlük satış verilerini API'den çek
    const fetchDailySalesData = async () => {
        try {
            setIsLoadingSales(true);
            const today = new Date().toISOString().split('T')[0];
            
            // Get all daily sales summaries and filter for today
            const allDailyData = await analyticsService.getAllDailySalesSummaries();
            const todayData = allDailyData.find(data => data.reportDate === today);
            
            setDailySalesData(todayData || null);
        } catch (error) {
            console.error('Daily sales data fetch error:', error);
            setDailySalesData(null);
        } finally {
            setIsLoadingSales(false);
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

    // Component mount olduğunda önce özetleri oluştur, sonra veri çek
    useEffect(() => {
        const initializeReports = async () => {
            // First generate all summaries for current timestamp
            await generateAllSummaries();
            await fetchDailySalesData();
            await fetchRealtimeStats();
        };

        initializeReports();
    }, []);

    // Aktif rezervasyonları hesapla (bugünkü rezervasyonlar)
    const getActiveReservations = () => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında bugünün tarihi
        return Object.values(reservations).filter(reservation => {
            return reservation.tarih === today;
        }).length;
    };

    // Bugünkü siparişleri hesapla
    const getTodayOrders = () => {
        if (isLoadingStats) {
            return "Yükleniyor...";
        }
        
        if (realtimeStats && realtimeStats.todayOrders !== undefined) {
            return realtimeStats.todayOrders;
        }
        
        return dailyOrderCount || 0;
    };

    // Toplam kazancı API'den al
    const getTotalEarnings = () => {
        if (isLoadingStats) {
            return "Yükleniyor...";
        }
        
        if (realtimeStats && realtimeStats.todayRevenue !== undefined) {
            return `${parseFloat(realtimeStats.todayRevenue).toLocaleString()}₺`;
        }
        
        if (dailySalesData && dailySalesData.totalRevenue) {
            return `${dailySalesData.totalRevenue.toLocaleString()}₺`;
        }
        
        return "0₺";
    };

    const activeReservations = getActiveReservations();

    return (
        <div className="reports-page">
            <div className="page-header">
                <h1 className="page-title">Raporlar</h1>
                <div className="header-controls">
                    {lastGeneratedTime && (
                        <div className="last-generated-info">
                            <span className="info-icon">⏰</span>
                            <span>Son güncelleme: {lastGeneratedTime.toLocaleString('tr-TR')}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Summary Generation Status */}
            {isGeneratingSummaries && (
                <div className="summary-generation-status">
                    <div className="status-header">
                        <span className="status-icon">🔄</span>
                        <span>Raporlar oluşturuluyor...</span>
                    </div>
                    <div className="status-details">
                        <div className="status-item">
                            <span className={`status-indicator ${summaryGenerationStatus.daily ? 'success' : 'pending'}`}>
                                {summaryGenerationStatus.daily ? '✅' : '⏳'}
                            </span>
                            <span>Günlük Özet</span>
                        </div>
                        <div className="status-item">
                            <span className={`status-indicator ${summaryGenerationStatus.weekly ? 'success' : 'pending'}`}>
                                {summaryGenerationStatus.weekly ? '✅' : '⏳'}
                            </span>
                            <span>Haftalık Özet</span>
                        </div>
                        <div className="status-item">
                            <span className={`status-indicator ${summaryGenerationStatus.monthly ? 'success' : 'pending'}`}>
                                {summaryGenerationStatus.monthly ? '✅' : '⏳'}
                            </span>
                            <span>Aylık Özet</span>
                        </div>
                        <div className="status-item">
                            <span className={`status-indicator ${summaryGenerationStatus.yearly ? 'success' : 'pending'}`}>
                                {summaryGenerationStatus.yearly ? '✅' : '⏳'}
                            </span>
                            <span>Yıllık Özet</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {!isGeneratingSummaries && lastGeneratedTime && !generationError && (
                <div className="summary-success-message">
                    <div className="success-header">
                        <span className="success-icon">✅</span>
                        <span>Tüm raporlar başarıyla oluşturuldu!</span>
                    </div>
                    <div className="success-details">
                        <span>Raporlar {lastGeneratedTime.toLocaleString('tr-TR')} tarihinde güncellendi</span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {!isGeneratingSummaries && generationError && (
                <div className="summary-error-message">
                    <div className="error-header">
                        <span className="error-icon">❌</span>
                        <span>Rapor oluşturma hatası</span>
                    </div>
                    <div className="error-details">
                        <span>{generationError}</span>
                    </div>
                    <div className="error-actions">
                        <button 
                            className="retry-btn"
                            onClick={generateAllSummaries}
                            disabled={isGeneratingSummaries}
                        >
                            <span className="retry-icon">🔄</span>
                            <span>Tekrar Dene</span>
                        </button>
                    </div>
                </div>
            )}

            {/* İstatistik Kartları */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3 className="stat-title">Bugünkü Sipariş</h3>
                        <p className="stat-value">{getTodayOrders()}</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3 className="stat-title">Bugünkü Toplam Kazanç</h3>
                        <p className="stat-value">{getTotalEarnings()}</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <h3 className="stat-title">Aktif Rezervasyon</h3>
                        <p className="stat-value">{activeReservations}</p>
                    </div>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-wrapper">
                    <SalesChart />
                </div>
                <div className="chart-wrapper">
                    <PopularItemsChart />
                </div>
                <div className="chart-wrapper">
                    <SalesByCategoryChart />
                </div>
                <div className="chart-wrapper">
                    <EmployeePerformanceTable />
                </div>
            </div>

            <div className="table-container">
                <IncomeExpenseTable />
            </div>
        </div>
    );
};

export default ReportsPage;
