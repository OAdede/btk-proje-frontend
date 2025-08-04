import React from 'react';
import SalesChart from '../../components/reports/SalesChart';
import PopularItemsChart from '../../components/reports/PopularItemsChart';
import './ReportsPage.css';

const ReportsPage = () => {
    return (
        <div className="reports-page">
            <h1 className="page-title">Raporlar</h1>
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
