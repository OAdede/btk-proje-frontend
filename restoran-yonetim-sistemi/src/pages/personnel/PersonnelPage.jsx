// BU DOSYA GEÇİCİ OLARAK ESKİ HALİNE GETİRİLDİ
// DOĞRU YAPIYI KURMADAN ÖNCE MEVCUT DURUMU GÖRMEK İÇİN
import React from 'react';
import PersonelEkleme from '../../components/personnel/PersonelEkleme';

const PersonnelPage = () => {
    

    return (
        <div style={{ padding: '20px' }}>
            <h1>Personnel Page Test</h1>

            <PersonelEkleme />
        </div>
    );
};

export default PersonnelPage;