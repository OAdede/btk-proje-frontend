import React, { useState, useContext, useEffect } from 'react';
import { TableContext } from '../../context/TableContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import './StaffLayout.css';

const MonthlyOrdersView = () => {
    const { completedOrders } = useContext(TableContext);
    const { colors } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthName = new Date(year, month).toLocaleDateString('tr-TR', { month: 'long' });

    const getOrdersByDay = () => {
        const ordersByDay = {};
        Object.values(completedOrders).forEach(order => {
            const orderDate = new Date(order.creationDate);
            if (orderDate.getMonth() === month && orderDate.getFullYear() === year) {
                const day = orderDate.getDate();
                ordersByDay[day] = (ordersByDay[day] || 0) + 1;
            }
        });
        return ordersByDay;
    };

    const ordersByDay = getOrdersByDay();
    const totalMonthlyOrders = Object.values(ordersByDay).reduce((sum, count) => sum + count, 0);

    const handlePrevMonth = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
            return newDate;
        });
    };

    const renderDays = () => {
        const days = [];
        const emptyCells = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        for (let i = 0; i < emptyCells; i++) {
            days.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const orderCount = ordersByDay[i] || 0;
            const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            days.push(
                <div key={i} className={`day-cell simplified ${isToday ? 'today' : ''}`}>
                    <span className="order-count-simplified">{orderCount}</span>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="monthly-orders-view">
            <h2 className="orders-page-title">Aylık Siparişler</h2>
            <div className="total-orders-info">
                {monthName} Ayı Toplam Sipariş Sayısı: <span>{totalMonthlyOrders}</span>
            </div>
            
            <div className="calendar-header">
                <button onClick={handlePrevMonth} className="calendar-nav-btn">{'<'}</button>
                <span className="calendar-month-year">{monthName} {year}</span>
                <button onClick={handleNextMonth} className="calendar-nav-btn">{'>'}</button>
            </div>
            <div className="calendar-grid">
                <div className="day-label">Pazartesi</div>
                <div className="day-label">Salı</div>
                <div className="day-label">Çarşamba</div>
                <div className="day-label">Perşembe</div>
                <div className="day-label">Cuma</div>
                <div className="day-label">Cumartesi</div>
                <div className="day-label">Pazar</div>
                {renderDays()}
            </div>
        </div>
    );
};

export default MonthlyOrdersView;