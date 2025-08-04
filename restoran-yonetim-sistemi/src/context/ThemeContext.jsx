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
      // Koyu tema renkleri
      background: '#1a252f',
      cardBackground: '#2c3e50',
      text: '#ffffff',
      textSecondary: '#bdc3c7',
      tableRowBackground: '#1b345c',
      tableHeaderBackground: '#34495e',
      border: '#34495e',
      success: '#27ae60',
      danger: '#e74c3c',
      primary: '#3498db',
      warning: '#f39c12'
    } : {
      // Açık tema renkleri
      background: '#f8f9fa',
      cardBackground: '#ffffff',
      text: '#2c3e50',
      textSecondary: '#6c757d',
      tableRowBackground: '#ffffff',
      tableHeaderBackground: '#e9ecef',
      border: '#dee2e6',
      success: '#28a745',
      danger: '#dc3545',
      primary: '#007bff',
      warning: '#ffc107'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
