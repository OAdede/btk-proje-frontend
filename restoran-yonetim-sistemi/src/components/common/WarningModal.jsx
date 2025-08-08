import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

export default function WarningModal({ visible, message, onClose }) {
  const { isDarkMode } = useContext(ThemeContext);

  // Tema renklerini dinamik olarak belirle
  const colors = isDarkMode ? {
    modalBg: "#513653",
    modalBorder: "#473653",
    textColor: "#ffffff",
    buttonBg: "#473653",
    buttonBorder: "#513653",
    overlayBg: "rgba(0,0,0,0.7)"
  } : {
    modalBg: "#F5EFFF",
    modalBorder: "#CDC1FF",
    textColor: "#2D1B69",
    buttonBg: "#A294F9",
    buttonBorder: "#CDC1FF",
    overlayBg: "rgba(0,0,0,0.5)"
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: colors.overlayBg,
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        backgroundColor: colors.modalBg,
        padding: "2rem",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        maxWidth: "400px",
        width: "90%",
        textAlign: "center",
        border: `2px solid ${colors.modalBorder}`
      }}>
        <div style={{
          fontSize: "3rem",
          marginBottom: "1rem"
        }}>
          ⚠️
        </div>
        
        <h3 style={{
          color: colors.textColor,
          marginBottom: "1rem",
          fontSize: "1.3rem",
          fontWeight: "bold"
        }}>
          Uyarı
        </h3>
        
        <p style={{
          color: colors.textColor,
          marginBottom: "2rem",
          lineHeight: "1.5",
          fontSize: "1rem"
        }}>
          {message}
        </p>
        
        <button
          onClick={onClose}
          style={{
            background: colors.buttonBg,
            color: "white",
            border: `2px solid ${colors.buttonBorder}`,
            padding: "12px 30px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            minWidth: "120px"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Tamam
        </button>
      </div>
    </div>
  );
}
