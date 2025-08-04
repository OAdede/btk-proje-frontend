import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(isDarkMode));
    // Body elementine tema attribute'u ekle
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.style.background = isDarkMode ? '#040410' : '#f8f9fa';
    document.body.style.color = isDarkMode ? '#ffffff' : '#1e293b';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      // Gece modu renkleri
      background: '#040410',
      surface: 'rgba(255, 255, 255, 0.1)',
      primary: '#1e3c72',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(255, 255, 255, 0.1)',
      sidebar: 'rgba(4, 4, 16, 0.9)',
      card: 'rgba(255, 255, 255, 0.1)',
      button: '#1a3c34',
      buttonHover: 'rgba(255, 255, 255, 0.2)',
      danger: '#E0190F',
      success: '#38b000',
      warning: '#ff6b35'
    } : {
      // Gündüz modu renkleri
      background: '#f8f9fa',
      surface: '#ffffff',
      primary: '#1a3c34',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      sidebar: 'rgba(255, 255, 255, 0.95)',
      card: '#ffffff',
      button: '#1a3c34',
      buttonHover: '#e0e0e0',
      danger: '#d90429',
      success: '#38b000',
      warning: '#ff6b35'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}; 