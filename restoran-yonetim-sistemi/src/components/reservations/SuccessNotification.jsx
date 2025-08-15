import React, { useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function SuccessNotification({ visible, onClose, reservationData }) {
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // 4 saniye sonra otomatik kapanır

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const colors = isDarkMode ? {
    modalBg: "#2a2a2a",
    modalBorder: "#4a4a4a",
    textColor: "#ffffff",
    successColor: "#4CAF50",
    buttonBg: "#4a4a4a",
    buttonHover: "#5a5a5a"
  } : {
    modalBg: "#ffffff",
    modalBorder: "#e0e0e0",
    textColor: "#333333",
    successColor: "#4CAF50",
    buttonBg: "#f5f5f5",
    buttonHover: "#e8e8e8"
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 10002,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        backgroundColor: colors.modalBg,
        padding: "2rem",
        borderRadius: "20px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        maxWidth: "400px",
        width: "90%",
        textAlign: "center",
        border: `2px solid ${colors.modalBorder}`,
        animation: "slideIn 0.5s ease-out"
      }}>
        {/* Başarı İkonu Animasyonu */}
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: colors.successColor,
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "scaleIn 0.6s ease-out"
        }}>
          <div style={{
            fontSize: "40px",
            color: "white",
            fontWeight: "bold",
            animation: "tickDraw 0.8s ease-out 0.3s both"
          }}>
            ✓
          </div>
        </div>

        {/* Başlık */}
        <h2 style={{
          color: colors.textColor,
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "15px",
          animation: "fadeInUp 0.6s ease-out 0.4s both"
        }}>
          {reservationData?.isEdit ? "✅ Rezervasyon Güncellendi!" : "✅ Rezervasyon Başarılı!"}
        </h2>

        {/* Rezervasyon Detayları */}
        <div style={{
          backgroundColor: isDarkMode ? "#3a3a3a" : "#f8f9fa",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
          animation: "fadeInUp 0.6s ease-out 0.5s both"
        }}>
          <div style={{ color: colors.textColor, fontSize: "0.9rem", lineHeight: "1.6" }}>
            {reservationData?.masaNo && <div><strong>Masa:</strong> {reservationData?.masaNo}</div>}
            <div><strong>Müşteri:</strong> {reservationData?.ad} {reservationData?.soyad}</div>
            <div><strong>Tarih:</strong> {reservationData?.tarih}</div>
            <div><strong>Saat:</strong> {reservationData?.saat}</div>
            <div><strong>Kişi Sayısı:</strong> {reservationData?.kisiSayisi}</div>
            {reservationData?.telefon && <div><strong>Telefon:</strong> {reservationData?.telefon}</div>}
            {reservationData?.email && <div><strong>E-mail:</strong> {reservationData?.email}</div>}
          </div>
        </div>

        {/* Tamam Butonu */}
        <button
          onClick={onClose}
          style={{
            background: colors.buttonBg,
            color: colors.textColor,
            border: `2px solid ${colors.modalBorder}`,
            padding: "12px 30px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            animation: "fadeInUp 0.6s ease-out 0.6s both"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = colors.buttonHover;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = colors.buttonBg;
          }}
        >
          Tamam
        </button>

        <style>{`
          @keyframes slideIn {
            from {
              transform: translateY(-50px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes scaleIn {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1);
            }
          }

          @keyframes tickDraw {
            from {
              opacity: 0;
              transform: scale(0.5);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
