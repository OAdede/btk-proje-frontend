import React from 'react';
import SalesChart from '../../components/reports/SalesChart';
import PopularItemsChart from '../../components/reports/PopularItemsChart';
import './ReportsPage.css';

const ReportsPage = () => {
    return (
        <div className="reports-page">
            <h1 className="page-title">Raporlar</h1>
            
            {/* İstatistik Kartları */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3 className="stat-title">Bugünkü Sipariş</h3>
                        <p className="stat-value">12</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3 className="stat-title">Toplam Kazanç</h3>
                        <p className="stat-value">1,500₺</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <h3 className="stat-title">Aktif Rezervasyon</h3>
                        <p className="stat-value">3</p>
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
            </div>
        </div>
    );
};

export default ReportsPage;
