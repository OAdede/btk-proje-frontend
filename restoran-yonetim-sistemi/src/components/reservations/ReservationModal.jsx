import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function ReservationModal({ visible, masaNo, onClose, onSubmit, defaultDate }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    email: "",
    tarih: defaultDate || "",
    saat: "",
    kisiSayisi: "",
    not: "",
  });


  // Tarih alanını otomatik doldur
  useEffect(() => {
    if (defaultDate) {
      setFormData(prev => ({ ...prev, tarih: defaultDate }));
    }
  }, [defaultDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefon') {
      // Sadece rakamları al
      const numbers = value.replace(/\D/g, '');
      
      // İlk rakam 5 değilse kabul etme
      if (numbers.length > 0 && numbers[0] !== '5') {
        return;
      }
      
      // Maksimum 10 rakam
      if (numbers.length > 10) {
        return;
      }
      
      // Format: 555 555 55 55
      let formatted = '';
      if (numbers.length > 0) {
        formatted = numbers[0];
        if (numbers.length > 1) {
          formatted += numbers[1];
          if (numbers.length > 2) {
            formatted += numbers[2];
            if (numbers.length > 3) {
              formatted += ' ' + numbers[3];
              if (numbers.length > 4) {
                formatted += numbers[4];
                if (numbers.length > 5) {
                  formatted += numbers[5];
                  if (numbers.length > 6) {
                    formatted += ' ' + numbers[6];
                    if (numbers.length > 7) {
                      formatted += numbers[7];
                      if (numbers.length > 8) {
                        formatted += ' ' + numbers[8];
                        if (numbers.length > 9) {
                          formatted += numbers[9];
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === 'email') {
      // E-mail validasyonu - sadece yazma sırasında kontrol etme, submit sırasında kontrol edeceğiz
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Telefon numarası validasyonu
    const phoneNumbers = formData.telefon.replace(/\D/g, '');
    if (phoneNumbers.length !== 10 || phoneNumbers[0] !== '5') {
      alert('Lütfen geçerli bir telefon numarası girin (0(5XX XXX XX XX) formatında)');
      return;
    }
    
    // E-mail validasyonu (eğer e-mail girilmişse)
    if (formData.email && (!formData.email.includes('@') || !formData.email.includes('.com'))) {
      alert('Lütfen geçerli bir e-mail adresi girin (@ ve .com içermeli)');
      return;
    }
    
    // Tarih validasyonu - bugünden önceki tarihleri kabul etme
    const selectedDate = new Date(formData.tarih);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcını al
    
    if (selectedDate < today) {
      alert('Geçmiş tarihler için rezervasyon yapılamaz. Lütfen bugün veya gelecek bir tarih seçin.');
      return;
    }
    
    // Saat validasyonu
    if (!formData.saat) {
      alert('Lütfen önce tarih seçin, sonra saat seçin.');
      return;
    }
    
    // Bugün için saat kontrolü
    if (selectedDate.getTime() === today.getTime()) {
      const currentTime = new Date();
      const selectedTime = new Date();
      const [hours, minutes] = formData.saat.split(':');
      selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (selectedTime <= currentTime) {
        alert('Bugün için sadece şu anki saatten sonraki saatler seçilebilir.');
        return;
      }
    }
    
    // Formu temizle
    setFormData({
      ad: "",
      soyad: "",
      telefon: "",
      email: "",
      tarih: defaultDate || "",
      saat: "",
      kisiSayisi: "",
      not: "",
    });
    
    // onSubmit'i çağır
    onSubmit(formData);
  };

  // Tema renklerini dinamik olarak belirle
  const colors = isDarkMode ? {
    modalBg: "#513653",
    modalBorder: "#473653",
    inputBg: "#32263A",
    inputBorder: "#473653",
    textColor: "#ffffff",
    labelColor: "#ffffff",
    submitButtonBg: "#473653",
    submitButtonBorder: "#513653",
    cancelButtonBg: "#32263A",
    cancelButtonBorder: "#473653",
    overlayBg: "rgba(0,0,0,0.7)"
  } : {
    modalBg: "#F5EFFF",
    modalBorder: "#CDC1FF",
    inputBg: "#E5D9F2",
    inputBorder: "#A294F9",
    textColor: "#2D1B69",
    labelColor: "#4A3B76",
    submitButtonBg: "#A294F9",
    submitButtonBorder: "#CDC1FF",
    cancelButtonBg: "#E5D9F2",
    cancelButtonBorder: "#A294F9",
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
      zIndex: 9998,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        backgroundColor: colors.modalBg,
        padding: "2rem",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        zIndex: 9999,
        maxWidth: "500px",
        width: "90%",
        maxHeight: "90vh",
        overflowY: "auto",
        border: `2px solid ${colors.modalBorder}`
      }}>
        <h2 style={{ 
          marginBottom: '20px', 
          color: colors.textColor 
        }}>
          📅 Masa {masaNo} - Yeni Rezervasyon
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     <div style={{ display: "flex", gap: "10px" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
               <label style={{ 
                 fontWeight: "bold", 
                 color: colors.labelColor, 
                 fontSize: "14px" 
               }}>
                 Ad:
               </label>
               <input
                 type="text"
                 name="ad"
                 placeholder="Ad"
                 value={formData.ad}
                 onChange={handleChange}
                 required
                 style={{
                   padding: "12px",
                   border: `2px solid ${colors.inputBorder}`,
                   borderRadius: "8px",
                   fontSize: "14px",
                   transition: "border-color 0.3s ease",
                   outline: "none",
                   backgroundColor: colors.inputBg,
                   color: colors.textColor
                 }}
               />
             </div>
             <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
               <label style={{ 
                 fontWeight: "bold", 
                 color: colors.labelColor, 
                 fontSize: "14px" 
               }}>
                 Soyad:
               </label>
               <input
                 type="text"
                 name="soyad"
                 placeholder="Soyad"
                 value={formData.soyad}
                 onChange={handleChange}
                 required
                 style={{
                   padding: "12px",
                   border: `2px solid ${colors.inputBorder}`,
                   borderRadius: "8px",
                   fontSize: "14px",
                   transition: "border-color 0.3s ease",
                   outline: "none",
                   backgroundColor: colors.inputBg,
                   color: colors.textColor
                 }}
               />
             </div>
           </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Telefon:
            </label>
            <input
              type="tel"
              name="telefon"
              placeholder="5XX XXX XX XX"
              value={formData.telefon}
              onChange={handleChange}
              required
              style={{
                padding: "12px",
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.3s ease",
                outline: "none",
                backgroundColor: colors.inputBg,
                color: colors.textColor
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              E-mail (İsteğe bağlı):
            </label>
            <input
              type="email"
              name="email"
              placeholder="E-mail adresi"
              value={formData.email}
              onChange={handleChange}
              style={{
                padding: "12px",
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.3s ease",
                outline: "none",
                backgroundColor: colors.inputBg,
                color: colors.textColor
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Tarih:
            </label>
                         <input
               type="date"
               name="tarih"
               value={formData.tarih}
               onChange={handleChange}
               required
               min={new Date().toISOString().split('T')[0]}
               style={{
                 padding: "12px",
                 border: `2px solid ${colors.inputBorder}`,
                 borderRadius: "8px",
                 fontSize: "14px",
                 transition: "border-color 0.3s ease",
                 outline: "none",
                 backgroundColor: colors.inputBg,
                 color: colors.textColor
               }}
             />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Saat:
            </label>
                         <input
               type="time"
               name="saat"
               value={formData.saat}
               onChange={handleChange}
               required
               disabled={!formData.tarih}
               min={formData.tarih === new Date().toISOString().split('T')[0] ? new Date().toTimeString().slice(0, 5) : undefined}
               placeholder={formData.tarih ? "Saat seçin" : "Önce tarih seçin"}
               style={{
                 padding: "12px",
                 border: `2px solid ${colors.inputBorder}`,
                 borderRadius: "8px",
                 fontSize: "14px",
                 transition: "border-color 0.3s ease",
                 outline: "none",
                 backgroundColor: formData.tarih ? colors.inputBg : (isDarkMode ? "#2a2a2a" : "#f5f5f5"),
                 color: formData.tarih ? colors.textColor : (isDarkMode ? "#666666" : "#999999"),
                 cursor: formData.tarih ? "text" : "not-allowed"
               }}
             />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Kişi Sayısı:
            </label>
            <input
              type="number"
              name="kisiSayisi"
              placeholder="Kişi sayısı"
              value={formData.kisiSayisi}
              onChange={handleChange}
              required
              min="1"
              max="20"
              style={{
                padding: "12px",
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.3s ease",
                outline: "none",
                backgroundColor: colors.inputBg,
                color: colors.textColor
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Not (İsteğe bağlı):
            </label>
            <textarea
              name="not"
              placeholder="Özel istekler, doğum günü vb."
              value={formData.not}
              onChange={handleChange}
              style={{
                padding: "12px",
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.3s ease",
                outline: "none",
                backgroundColor: colors.inputBg,
                color: colors.textColor,
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" style={{
              background: colors.submitButtonBg,
              color: "white",
              border: `2px solid ${colors.submitButtonBorder}`,
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              flex: 1,
              transition: "all 0.3s ease"
            }}>
              ✅ Rezervasyon Oluştur
            </button>
            <button type="button" onClick={onClose} style={{
              background: colors.cancelButtonBg,
              color: colors.textColor,
              border: `2px solid ${colors.cancelButtonBorder}`,
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              flex: 1,
              transition: "all 0.3s ease"
            }}>
              ❌ İptal
            </button>
          </div>
                 </form>
       </div>
     </div>
   );
 }
