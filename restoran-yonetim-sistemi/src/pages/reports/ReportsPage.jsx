import React, { useContext, useState, useEffect } from 'react';
import { TableContext } from '../../context/TableContext';
import { analyticsService } from '../../services/analyticsService';
import SalesChart from '../../components/reports/SalesChart';
import PopularItemsChart from '../../components/reports/PopularItemsChart';
import SalesByCategoryChart from '../../components/reports/SalesByCategoryChart';
import EmployeePerformanceTable from '../../components/reports/EmployeePerformanceTable';
import IncomeExpenseTable from '../../components/reports/IncomeExpenseTable';
import { Button } from 'react-bootstrap';
import './ReportsPage.css';

const ReportsPage = () => {
    const { reservations, dailyOrderCount } = useContext(TableContext);
    const [dailySalesData, setDailySalesData] = useState(null);
    const [isLoadingSales, setIsLoadingSales] = useState(true);
    const [isGeneratingTestData, setIsGeneratingTestData] = useState(false);

    // Günlük satış verilerini API'den çek
    const fetchDailySalesData = async () => {
        try {
            setIsLoadingSales(true);
            const today = new Date().toISOString().split('T')[0];
            
            // First try to get today's data directly
            try {
                const todayData = await analyticsService.getDailySalesSummary(today);
                if (todayData) {
                    setDailySalesData(todayData);
                    return;
                }
            } catch (directError) {
                console.log('Direct daily sales fetch failed, trying fallback:', directError);
            }
            
            // Fallback: Get all daily sales summaries and filter for today
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

    // Component mount olduğunda veri çek
    useEffect(() => {
        fetchDailySalesData();
    }, []);

    // Test verisi oluştur
    const generateTestData = async () => {
        try {
            setIsGeneratingTestData(true);
            const result = await analyticsService.generateTestData();
            
            if (result) {
                console.log('Test data generated:', result);
                alert('Test verisi başarıyla oluşturuldu! Sayfayı yenileyin.');
                // Refresh data
                fetchDailySalesData();
            } else {
                alert('Test verisi oluşturulurken hata oluştu.');
            }
        } catch (error) {
            console.error('Error generating test data:', error);
            alert('Test verisi oluşturulurken hata oluştu: ' + error.message);
        } finally {
            setIsGeneratingTestData(false);
        }
    };

    // Aktif rezervasyonları hesapla (bugünkü rezervasyonlar)
    const getActiveReservations = () => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında bugünün tarihi
        return Object.values(reservations).filter(reservation => {
            return reservation.tarih === today;
        }).length;
    };

    // Bugünkü siparişleri hesapla
    const getTodayOrders = () => {
        return dailyOrderCount;
    };

    // Toplam kazancı API'den al
    const getTotalEarnings = () => {
        if (isLoadingSales) {
            return "Yükleniyor...";
        }
        
        if (dailySalesData && dailySalesData.totalRevenue) {
            return `${dailySalesData.totalRevenue.toLocaleString()}₺`;
        }
        
        return "0₺";
    };

    const activeReservations = getActiveReservations();

    return (
        <div className="reports-page">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="page-title">Raporlar</h1>
                <Button 
                    variant="outline-primary" 
                    onClick={generateTestData}
                    disabled={isGeneratingTestData}
                >
                    {isGeneratingTestData ? 'Test Verisi Oluşturuluyor...' : 'Test Verisi Oluştur'}
                </Button>
            </div>
            
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
