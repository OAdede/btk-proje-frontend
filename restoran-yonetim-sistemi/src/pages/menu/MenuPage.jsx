import React from 'react';

const MenuPage = () => {
    return (
        <div style={{
            padding: '20px',
            color: 'var(--text)',
            background: 'var(--background)',
            minHeight: '100vh'
        }}>
            <h1 style={{
                fontSize: '1.8rem',
                color: 'var(--text)',
                fontWeight: 600,
                marginBottom: '24px'
            }}>
                Menü Yönetimi
            </h1>
            <div style={{
                background: 'var(--card)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px var(--shadow)',
                border: '1px solid var(--border)'
            }}>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1rem',
                    margin: 0
                }}>
                    Menü yönetimi sayfasına hoş geldiniz! Burada restoran menüsünü düzenleyebilirsiniz.
                </p>
            </div>
        </div>
    );
};

export default MenuPage;
