import React, { createContext, useContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Local storage'dan tema tercihini al
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Varsayılan olarak sistem temasını kullan
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    // Tema değişikliğini local storage'a kaydet
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Body'ye tema sınıfını ekle
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      // Yeni koyu tema renkleri - tatlı ve hoş görünüm
      background: '#32263A', // En koyu arka plan
      sidebar: '#473653', // Sidebar arka planı
      cardBackground: '#473653', // Kart arka planı
      surfaceBackground: '#513653', // Yüzey arka planı
      accentBackground: '#53364D', // Vurgu arka planı
      text: '#ffffff', // Beyaz ana metin
      textSecondary: '#e0e0e0', // Açık gri ikincil metin
      textMuted: '#b0b0b0', // Soluk metin
      tableRowBackground: '#473653', // Tablo satır arka planı
      tableHeaderBackground: '#513653', // Tablo başlık arka planı
      border: '#53364D', // Kenarlık rengi
      borderLight: '#3A2636', // Açık kenarlık
      success: '#4ade80', // Yeşil - başarı
      danger: '#f87171', // Kırmızı - tehlike
      dangerHover: '#ef4444', // Koyu kırmızı hover
      primary: '#a78bfa', // Mor - birincil
      warning: '#fbbf24', // Sarı - uyarı
      warningHover: '#f59e0b', // Koyu sarı hover
      info: '#60a5fa', // Mavi - bilgi
      hover: '#53364D', // Hover efekti
      shadow: 'rgba(50, 38, 58, 0.3)', // Gölge rengi
      overlay: 'rgba(50, 38, 58, 0.8)' // Overlay rengi
    } : {
      // Yeni açık tema renkleri - Mor paleti
      background: '#F5EFFF', // En açık mor arka plan
      sidebar: '#E5D9F2', // Sidebar arka planı
      cardBackground: '#CBC3E3', // Kart arka planı - güncellendi
      surfaceBackground: '#E5D9F2', // Açık mor yüzey arka planı
      accentBackground: '#CDC1FF', // Orta mor vurgu arka planı
      text: '#1A0B3D', // Daha koyu mor ana metin - daha okunabilir
      textSecondary: '#2D1B69', // Daha koyu mor ikincil metin - daha okunabilir
      textMuted: '#4A3B76', // Daha koyu mor soluk metin - daha okunabilir
      tableRowBackground: '#CBC3E3', // Tablo satır arka planı - güncellendi
      tableHeaderBackground: '#E5D9F2', // Açık mor tablo başlık arka planı
      border: '#CDC1FF', // Orta mor kenarlık
      borderLight: '#E5D9F2', // Açık mor kenarlık
      success: '#10B981', // Yeşil - başarı
      danger: '#EF4444', // Kırmızı - tehlike
      dangerHover: '#dc2626', // Koyu kırmızı hover
      primary: '#A294F9', // Mor - birincil
      warning: '#F59E0B', // Sarı - uyarı
      warningHover: '#d97706', // Koyu sarı hover
      info: '#3B82F6', // Mavi - bilgi
      hover: '#CDC1FF', // Hover efekti
      shadow: 'rgba(162, 148, 249, 0.1)', // Gölge rengi
      overlay: 'rgba(162, 148, 249, 0.5)' // Overlay rengi
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
