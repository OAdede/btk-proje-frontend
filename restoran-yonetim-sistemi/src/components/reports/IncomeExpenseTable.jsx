// src/components/reports/IncomeExpenseTable.jsx
import React, { useState } from 'react';
import { Card, Table, ButtonGroup, Button, Form, Badge } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';
import './IncomeExpenseTable.css';

const IncomeExpenseTable = () => {
  const { colors } = useTheme();
  const [period, setPeriod] = useState('daily'); // daily, weekly, monthly
  const [selectedMonth, setSelectedMonth] = useState('aralik');

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

  // Sadece gelir verileri - gerçek uygulamada API'den gelecek
  const revenueData = {
    daily: {
      ocak: [
        { id: 1, date: '2024-01-15', category: 'Yemek Satışı', description: 'Masa 3 - Adana Kebap', amount: 85.50, payment: 'Kredi Kartı' },
        { id: 2, date: '2024-01-15', category: 'İçecek Satışı', description: 'Masa 5 - Kola, Su', amount: 25.00, payment: 'Nakit' },
        { id: 3, date: '2024-01-15', category: 'Yemek Satışı', description: 'Masa 2 - İskender', amount: 65.00, payment: 'Kredi Kartı' },
        { id: 4, date: '2024-01-15', category: 'Tatlı Satışı', description: 'Masa 1 - Künefe', amount: 35.00, payment: 'Nakit' },
      ],
      subat: [
        { id: 5, date: '2024-02-15', category: 'Yemek Satışı', description: 'Masa 4 - Mercimek Çorbası', amount: 45.00, payment: 'Kredi Kartı' },
        { id: 6, date: '2024-02-15', category: 'İçecek Satışı', description: 'Masa 6 - Çay, Kahve', amount: 30.00, payment: 'Nakit' },
      ],
      aralik: [
        { id: 7, date: '2024-12-15', category: 'Yemek Satışı', description: 'Masa 1 - Sütlaç', amount: 40.00, payment: 'Kredi Kartı' },
        { id: 8, date: '2024-12-15', category: 'Yemek Satışı', description: 'Masa 3 - İskender', amount: 70.00, payment: 'Nakit' },
      ]
    },
    weekly: {
      ocak: [
        { id: 1, date: '2024-01-15', category: 'Yemek Satışı', description: 'Masa 3 - Adana Kebap', amount: 85.50, payment: 'Kredi Kartı' },
        { id: 2, date: '2024-01-16', category: 'İçecek Satışı', description: 'Masa 5 - Kola, Su', amount: 25.00, payment: 'Nakit' },
        { id: 3, date: '2024-01-17', category: 'Yemek Satışı', description: 'Masa 2 - İskender', amount: 65.00, payment: 'Kredi Kartı' },
        { id: 4, date: '2024-01-18', category: 'Tatlı Satışı', description: 'Masa 1 - Künefe', amount: 35.00, payment: 'Nakit' },
      ],
      subat: [
        { id: 5, date: '2024-02-15', category: 'Yemek Satışı', description: 'Masa 4 - Mercimek Çorbası', amount: 45.00, payment: 'Kredi Kartı' },
        { id: 6, date: '2024-02-16', category: 'İçecek Satışı', description: 'Masa 6 - Çay, Kahve', amount: 30.00, payment: 'Nakit' },
      ],
      aralik: [
        { id: 7, date: '2024-12-15', category: 'Yemek Satışı', description: 'Masa 1 - Sütlaç', amount: 40.00, payment: 'Kredi Kartı' },
        { id: 8, date: '2024-12-16', category: 'Yemek Satışı', description: 'Masa 3 - İskender', amount: 70.00, payment: 'Nakit' },
      ]
    },
    monthly: {
      ocak: [
        { id: 1, date: '2024-01-15', category: 'Yemek Satışı', description: 'Masa 3 - Adana Kebap', amount: 85.50, payment: 'Kredi Kartı' },
        { id: 2, date: '2024-01-16', category: 'İçecek Satışı', description: 'Masa 5 - Kola, Su', amount: 25.00, payment: 'Nakit' },
        { id: 3, date: '2024-01-17', category: 'Yemek Satışı', description: 'Masa 2 - İskender', amount: 65.00, payment: 'Kredi Kartı' },
        { id: 4, date: '2024-01-18', category: 'Tatlı Satışı', description: 'Masa 1 - Künefe', amount: 35.00, payment: 'Nakit' },
        { id: 5, date: '2024-01-20', category: 'Yemek Satışı', description: 'Masa 4 - Mercimek Çorbası', amount: 45.00, payment: 'Kredi Kartı' },
        { id: 6, date: '2024-01-25', category: 'İçecek Satışı', description: 'Masa 6 - Çay, Kahve', amount: 30.00, payment: 'Nakit' },
        { id: 7, date: '2024-01-30', category: 'Yemek Satışı', description: 'Masa 1 - Sütlaç', amount: 40.00, payment: 'Kredi Kartı' },
        { id: 8, date: '2024-01-31', category: 'Yemek Satışı', description: 'Masa 3 - İskender', amount: 70.00, payment: 'Nakit' },
      ],
      aralik: [
        { id: 9, date: '2024-12-01', category: 'Yemek Satışı', description: 'Masa 2 - Adana Kebap', amount: 85.50, payment: 'Kredi Kartı' },
        { id: 10, date: '2024-12-05', category: 'İçecek Satışı', description: 'Masa 5 - Kola, Su', amount: 25.00, payment: 'Nakit' },
        { id: 11, date: '2024-12-10', category: 'Yemek Satışı', description: 'Masa 1 - İskender', amount: 65.00, payment: 'Kredi Kartı' },
        { id: 12, date: '2024-12-15', category: 'Tatlı Satışı', description: 'Masa 3 - Künefe', amount: 35.00, payment: 'Nakit' },
        { id: 13, date: '2024-12-20', category: 'Yemek Satışı', description: 'Masa 4 - Mercimek Çorbası', amount: 45.00, payment: 'Kredi Kartı' },
        { id: 14, date: '2024-12-25', category: 'İçecek Satışı', description: 'Masa 6 - Çay, Kahve', amount: 30.00, payment: 'Nakit' },
        { id: 15, date: '2024-12-30', category: 'Yemek Satışı', description: 'Masa 1 - Sütlaç', amount: 40.00, payment: 'Kredi Kartı' },
        { id: 16, date: '2024-12-31', category: 'Yemek Satışı', description: 'Masa 3 - İskender', amount: 70.00, payment: 'Nakit' },
      ]
    }
  };

  const currentData = revenueData[period]?.[selectedMonth] || revenueData[period]?.aralik || [];

  const totalRevenue = currentData.reduce((sum, item) => sum + item.amount, 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getPeriodTitle = () => {
    switch(period) {
      case 'daily': return 'Günlük';
      case 'weekly': return 'Haftalık';
      case 'monthly': return 'Aylık';
      default: return 'Günlük';
    }
  };

  return (
    <div style={{ backgroundColor: colors.background, padding: '20px', borderRadius: '8px' }}>
      <Card className="mb-4" style={{ backgroundColor: colors.cardBackground, color: colors.text, border: 'none' }}>
        <Card.Body>
          <Card.Title className="d-flex justify-content-between align-items-center mb-3">
            <span style={{ color: colors.text }}>💰 Ciro Detayları</span>
            <div className="d-flex gap-2">
              <ButtonGroup size="sm">
                <Button
                  variant={period === 'daily' ? 'primary' : 'outline-primary'}
                  onClick={() => setPeriod('daily')}
                >
                  Günlük
                </Button>
                <Button
                  variant={period === 'weekly' ? 'primary' : 'outline-primary'}
                  onClick={() => setPeriod('weekly')}
                >
                  Haftalık
                </Button>
                <Button
                  variant={period === 'monthly' ? 'primary' : 'outline-primary'}
                  onClick={() => setPeriod('monthly')}
                >
                  Aylık
                </Button>
              </ButtonGroup>
            </div>
          </Card.Title>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div style={{ color: colors.textSecondary, fontSize: '14px' }}>
              {getPeriodTitle()} ciro raporu
            </div>

            <Form.Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Ciro Özet Kartı */}
          <div className="row mb-3">
            <div className="col-md-12">
              <div className="card" style={{ backgroundColor: colors.success, color: 'white' }}>
                <div className="card-body text-center">
                  <h6 style={{ color: 'white' }}>💰 Toplam Ciro</h6>
                  <h3 style={{ color: 'white', fontWeight: 'bold' }}>{formatAmount(totalRevenue)}</h3>
                  <small style={{ color: 'white', opacity: 0.8 }}>
                    {getPeriodTitle()} toplam gelir
                  </small>
                </div>
              </div>
            </div>
          </div>

          <Table responsive className="custom-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Kategori</th>
                <th>Açıklama</th>
                <th>Tutar</th>
                <th>Ödeme Yöntemi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id || crypto.randomUUID()}>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    <Badge bg="success" style={{ fontSize: '12px' }}>
                      {item.category}
                    </Badge>
                  </td>
                  <td>{item.description}</td>
                  <td style={{ fontWeight: 'bold', color: colors.success }}>
                    {formatAmount(item.amount)}
                  </td>
                  <td>
                    <Badge bg="secondary" style={{ fontSize: '11px' }}>
                      {item.payment}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {currentData.length === 0 && (
            <div className="text-center py-4">
              <p style={{ color: colors.textSecondary }}>Bu dönem için ciro verisi bulunamadı.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default IncomeExpenseTable; 