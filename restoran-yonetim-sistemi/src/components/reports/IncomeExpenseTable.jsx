// src/components/reports/IncomeExpenseTable.jsx
import React, { useState } from 'react';
import { Card, Table, ButtonGroup, Button, Form, Badge } from 'react-bootstrap';
import './IncomeExpenseTable.css';

const IncomeExpenseTable = () => {
  const [filter, setFilter] = useState('all'); // all, income, expense
  const [period, setPeriod] = useState('month'); // week, month, year
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

  // Sahte veri - gerçek uygulamada API'den gelecek
  const tableData = {
    week: {
      ocak: [
        { id: 1, date: '2024-01-15', type: 'income', category: 'Yemek Satışı', description: 'Masa 3 - Adana Kebap', amount: 85.50, payment: 'Kredi Kartı' },
        { id: 2, date: '2024-01-15', type: 'expense', category: 'Malzeme Alımı', description: 'Et ve sebze alımı', amount: -120.00, payment: 'Nakit' },
        { id: 3, date: '2024-01-16', type: 'income', category: 'İçecek Satışı', description: 'Masa 5 - Kola, Su', amount: 25.00, payment: 'Nakit' },
        { id: 4, date: '2024-01-16', type: 'expense', category: 'Personel Maaşı', description: 'Garson maaş ödemesi', amount: -1500.00, payment: 'Banka' },
        { id: 5, date: '2024-01-17', type: 'income', category: 'Yemek Satışı', description: 'Masa 2 - İskender', amount: 65.00, payment: 'Kredi Kartı' },
        { id: 6, date: '2024-01-17', type: 'expense', category: 'Fatura', description: 'Elektrik faturası', amount: -350.00, payment: 'Banka' },
        { id: 7, date: '2024-01-18', type: 'income', category: 'Tatlı Satışı', description: 'Masa 1 - Künefe', amount: 35.00, payment: 'Nakit' },
        { id: 8, date: '2024-01-18', type: 'expense', category: 'Temizlik', description: 'Temizlik malzemeleri', amount: -75.00, payment: 'Nakit' },
      ],
      subat: [
        { id: 9, date: '2024-02-15', type: 'income', category: 'Yemek Satışı', description: 'Masa 4 - Mercimek Çorbası', amount: 45.00, payment: 'Kredi Kartı' },
        { id: 10, date: '2024-02-15', type: 'expense', category: 'Malzeme Alımı', description: 'Mercimek ve baharat', amount: -80.00, payment: 'Nakit' },
        { id: 11, date: '2024-02-16', type: 'income', category: 'İçecek Satışı', description: 'Masa 6 - Çay, Kahve', amount: 30.00, payment: 'Nakit' },
        { id: 12, date: '2024-02-16', type: 'expense', category: 'Kira', description: 'Restoran kirası', amount: -2500.00, payment: 'Banka' },
      ],
      aralik: [
        { id: 13, date: '2024-12-15', type: 'income', category: 'Yemek Satışı', description: 'Masa 1 - Sütlaç', amount: 40.00, payment: 'Kredi Kartı' },
        { id: 14, date: '2024-12-15', type: 'expense', category: 'Malzeme Alımı', description: 'Süt ve şeker alımı', amount: -60.00, payment: 'Nakit' },
        { id: 15, date: '2024-12-16', type: 'income', category: 'Yemek Satışı', description: 'Masa 3 - İskender', amount: 70.00, payment: 'Nakit' },
        { id: 16, date: '2024-12-16', type: 'expense', category: 'Su Faturası', description: 'Su faturası ödemesi', amount: -120.00, payment: 'Banka' },
      ]
    },
    month: {
      ocak: [
        { id: 1, date: '2024-01-15', type: 'income', category: 'Yemek Satışı', description: 'Masa 3 - Adana Kebap', amount: 85.50, payment: 'Kredi Kartı' },
        { id: 2, date: '2024-01-15', type: 'expense', category: 'Malzeme Alımı', description: 'Et ve sebze alımı', amount: -120.00, payment: 'Nakit' },
        { id: 3, date: '2024-01-16', type: 'income', category: 'İçecek Satışı', description: 'Masa 5 - Kola, Su', amount: 25.00, payment: 'Nakit' },
        { id: 4, date: '2024-01-16', type: 'expense', category: 'Personel Maaşı', description: 'Garson maaş ödemesi', amount: -1500.00, payment: 'Banka' },
        { id: 5, date: '2024-01-17', type: 'income', category: 'Yemek Satışı', description: 'Masa 2 - İskender', amount: 65.00, payment: 'Kredi Kartı' },
        { id: 6, date: '2024-01-17', type: 'expense', category: 'Fatura', description: 'Elektrik faturası', amount: -350.00, payment: 'Banka' },
        { id: 7, date: '2024-01-18', type: 'income', category: 'Tatlı Satışı', description: 'Masa 1 - Künefe', amount: 35.00, payment: 'Nakit' },
        { id: 8, date: '2024-01-18', type: 'expense', category: 'Temizlik', description: 'Temizlik malzemeleri', amount: -75.00, payment: 'Nakit' },
        { id: 9, date: '2024-01-20', type: 'income', category: 'Yemek Satışı', description: 'Masa 4 - Mercimek Çorbası', amount: 45.00, payment: 'Kredi Kartı' },
        { id: 10, date: '2024-01-20', type: 'expense', category: 'Malzeme Alımı', description: 'Mercimek ve baharat', amount: -80.00, payment: 'Nakit' },
        { id: 11, date: '2024-01-25', type: 'income', category: 'İçecek Satışı', description: 'Masa 6 - Çay, Kahve', amount: 30.00, payment: 'Nakit' },
        { id: 12, date: '2024-01-25', type: 'expense', category: 'Kira', description: 'Restoran kirası', amount: -2500.00, payment: 'Banka' },
        { id: 13, date: '2024-01-30', type: 'income', category: 'Yemek Satışı', description: 'Masa 1 - Sütlaç', amount: 40.00, payment: 'Kredi Kartı' },
        { id: 14, date: '2024-01-30', type: 'expense', category: 'Malzeme Alımı', description: 'Süt ve şeker alımı', amount: -60.00, payment: 'Nakit' },
        { id: 15, date: '2024-01-31', type: 'income', category: 'Yemek Satışı', description: 'Masa 3 - İskender', amount: 70.00, payment: 'Nakit' },
        { id: 16, date: '2024-01-31', type: 'expense', category: 'Su Faturası', description: 'Su faturası ödemesi', amount: -120.00, payment: 'Banka' },
      ],
      aralik: [
        { id: 17, date: '2024-12-01', type: 'income', category: 'Yemek Satışı', description: 'Masa 2 - Adana Kebap', amount: 85.50, payment: 'Kredi Kartı' },
        { id: 18, date: '2024-12-01', type: 'expense', category: 'Malzeme Alımı', description: 'Et ve sebze alımı', amount: -120.00, payment: 'Nakit' },
        { id: 19, date: '2024-12-05', type: 'income', category: 'İçecek Satışı', description: 'Masa 5 - Kola, Su', amount: 25.00, payment: 'Nakit' },
        { id: 20, date: '2024-12-05', type: 'expense', category: 'Personel Maaşı', description: 'Garson maaş ödemesi', amount: -1500.00, payment: 'Banka' },
        { id: 21, date: '2024-12-10', type: 'income', category: 'Yemek Satışı', description: 'Masa 1 - İskender', amount: 65.00, payment: 'Kredi Kartı' },
        { id: 22, date: '2024-12-10', type: 'expense', category: 'Fatura', description: 'Elektrik faturası', amount: -350.00, payment: 'Banka' },
        { id: 23, date: '2024-12-15', type: 'income', category: 'Tatlı Satışı', description: 'Masa 3 - Künefe', amount: 35.00, payment: 'Nakit' },
        { id: 24, date: '2024-12-15', type: 'expense', category: 'Temizlik', description: 'Temizlik malzemeleri', amount: -75.00, payment: 'Nakit' },
        { id: 25, date: '2024-12-20', type: 'income', category: 'Yemek Satışı', description: 'Masa 4 - Mercimek Çorbası', amount: 45.00, payment: 'Kredi Kartı' },
        { id: 26, date: '2024-12-20', type: 'expense', category: 'Malzeme Alımı', description: 'Mercimek ve baharat', amount: -80.00, payment: 'Nakit' },
        { id: 27, date: '2024-12-25', type: 'income', category: 'İçecek Satışı', description: 'Masa 6 - Çay, Kahve', amount: 30.00, payment: 'Nakit' },
        { id: 28, date: '2024-12-25', type: 'expense', category: 'Kira', description: 'Restoran kirası', amount: -2500.00, payment: 'Banka' },
        { id: 29, date: '2024-12-30', type: 'income', category: 'Yemek Satışı', description: 'Masa 1 - Sütlaç', amount: 40.00, payment: 'Kredi Kartı' },
        { id: 30, date: '2024-12-30', type: 'expense', category: 'Malzeme Alımı', description: 'Süt ve şeker alımı', amount: -60.00, payment: 'Nakit' },
        { id: 31, date: '2024-12-31', type: 'income', category: 'Yemek Satışı', description: 'Masa 3 - İskender', amount: 70.00, payment: 'Nakit' },
        { id: 32, date: '2024-12-31', type: 'expense', category: 'Su Faturası', description: 'Su faturası ödemesi', amount: -120.00, payment: 'Banka' },
      ]
    }
  };

  const currentData = tableData[period]?.[selectedMonth] || tableData[period]?.aralik || [];

  const filteredData = filter === 'all' 
    ? currentData 
    : currentData.filter(item => item.type === filter);

  const totalIncome = filteredData
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = filteredData
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const netProfit = totalIncome - totalExpense;

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

  return (
    <div style={{ backgroundColor: '#1a252f', padding: '20px', borderRadius: '8px' }}>
      <Card className="mb-4" style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none' }}>
        <Card.Body>
          <Card.Title className="d-flex justify-content-between align-items-center mb-3">
            <span style={{ color: 'white' }}>Gelir-Gider Detayları</span>
          <div className="d-flex gap-2">
            <ButtonGroup size="sm">
              <Button
                variant={period === 'week' ? 'primary' : 'outline-primary'}
                onClick={() => setPeriod('week')}
              >
                Haftalık
              </Button>
              <Button
                variant={period === 'month' ? 'primary' : 'outline-primary'}
                onClick={() => setPeriod('month')}
              >
                Aylık
              </Button>
            </ButtonGroup>
          </div>
        </Card.Title>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <ButtonGroup>
            <Button
              variant={filter === 'all' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('all')}
            >
              Tümü
            </Button>
            <Button
              variant={filter === 'income' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('income')}
            >
              Gelir
            </Button>
            <Button
              variant={filter === 'expense' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('expense')}
            >
              Gider
            </Button>
          </ButtonGroup>

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

        {/* Özet Kartları */}
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="card" style={{ backgroundColor: '#27ae60', color: 'white' }}>
              <div className="card-body text-center">
                <h6 style={{ color: 'white' }}>Toplam Gelir</h6>
                <h4 style={{ color: 'white' }}>{formatAmount(totalIncome)}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card" style={{ backgroundColor: '#e74c3c', color: 'white' }}>
              <div className="card-body text-center">
                <h6 style={{ color: 'white' }}>Toplam Gider</h6>
                <h4 style={{ color: 'white' }}>{formatAmount(totalExpense)}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className={`card ${netProfit >= 0 ? 'bg-primary' : 'bg-warning'}`} style={{ color: 'white' }}>
              <div className="card-body text-center">
                <h6 style={{ color: 'white' }}>Net Kar/Zarar</h6>
                <h4 style={{ color: 'white' }}>{formatAmount(netProfit)}</h4>
              </div>
            </div>
          </div>
        </div>

        <Table responsive className="custom-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Tür</th>
              <th>Kategori</th>
              <th>Açıklama</th>
              <th>Tutar</th>
              <th>Ödeme Yöntemi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item.id}>
                <td>{formatDate(item.date)}</td>
                <td>
                  <Badge bg={item.type === 'income' ? 'success' : 'danger'}>
                    {item.type === 'income' ? 'Gelir' : 'Gider'}
                  </Badge>
                </td>
                <td>{item.category}</td>
                <td>{item.description}</td>
                <td style={{ fontWeight: 'bold' }}>
                  {formatAmount(item.amount)}
                </td>
                <td>
                  <Badge bg="secondary">{item.payment}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {filteredData.length === 0 && (
          <div className="text-center py-4">
            <p style={{ color: '#bdc3c7' }}>Bu dönem için veri bulunamadı.</p>
          </div>
        )}
      </Card.Body>
    </Card>
    </div>
  );
};

export default IncomeExpenseTable; 