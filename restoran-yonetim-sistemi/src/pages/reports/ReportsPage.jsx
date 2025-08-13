import React, { useContext } from 'react';
import { TableContext } from '../../context/TableContext';
import SalesChart from '../../components/reports/SalesChart';
import PopularItemsChart from '../../components/reports/PopularItemsChart';
import SalesByCategoryChart from '../../components/reports/SalesByCategoryChart';
import IncomeExpenseTable from '../../components/reports/IncomeExpenseTable';
import './ReportsPage.css';

const ReportsPage = () => {
    const { reservations, dailyOrderCount } = useContext(TableContext);

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

    // Toplam kazancı hesapla
    const getTotalEarnings = () => {
        // Bu kısım orders verilerine göre hesaplanabilir
        // Şimdilik sabit değer döndürüyoruz
        return "1,500₺";
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
            </div>

            <div className="table-container">
                <IncomeExpenseTable />
            </div>
        </div>
    );
};

export default ReportsPage;
