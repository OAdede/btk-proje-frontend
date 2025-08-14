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

    // Günlük satış verilerini API'den çek
    const fetchDailySalesData = async () => {
        try {
            setIsLoadingSales(true);
            const today = new Date().toISOString().split('T')[0];
            const data = await analyticsService.getDailySalesSummary(today);
            setDailySalesData(data);
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
            <h1 className="page-title">Raporlar</h1>
            
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
                        <h3 className="stat-title">Toplam Kazanç</h3>
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
