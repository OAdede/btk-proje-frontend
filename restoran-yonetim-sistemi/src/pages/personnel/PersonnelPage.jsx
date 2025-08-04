// BU DOSYA GEÇİCİ OLARAK ESKİ HALİNE GETİRİLDİ
// DOĞRU YAPIYI KURMADAN ÖNCE MEVCUT DURUMU GÖRMEK İÇİN
import React from 'react';
// Normalde burada eski form kodları olmalı, ama biz doğrudan yeni yapıya geçeceğiz.
// Bu yüzden bu dosyayı temizleyip doğru bileşeni çağırmasını sağlayacağız.
import PersonelEkleme from '../../components/personnel/PersonelEkleme';
import { Box } from '@mui/material';

const PersonnelPage = () => {
    return (
        <Box sx={{ p: 3 }}>
            {/* Eski, yanlış form burada gösteriliyordu varsayalım. */}
            {/* Şimdi doğru bileşeni çağırıyoruz. */}
            <PersonelEkleme />
        </Box>
    );
};

export default PersonnelPage;