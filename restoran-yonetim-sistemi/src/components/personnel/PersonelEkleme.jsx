import React, { useState, useEffect } from "react";
import "./PersonelEkleme.css";

// Başlangıç için varsayılan personel verisi
const defaultPersonnel = [
  { id: 1, name: "Ahmet Yılmaz", email: "ahmet@restoran.com", phone: "05321234567", role: "garson", isActive: true },
  { id: 2, name: "Ayşe Kaya", email: "ayse@restoran.com", phone: "05331234567", role: "kasiyer", isActive: true },
  { id: 3, name: "Mehmet Demir", email: "mehmet@restoran.com", phone: "05341234567", role: "garson", isActive: false },
  { id: 4, name: "Fatma Özkan", email: "fatma@restoran.com", phone: "05351234567", role: "kasiyer", isActive: false },
];

const PersonelEkleme = () => {
  const [personnel, setPersonnel] = useState(() => {
    try {
      const savedPersonnel = localStorage.getItem('personnel');
      return savedPersonnel ? JSON.parse(savedPersonnel) : defaultPersonnel;
    } catch (error) {
      console.error("Personel verileri okunurken hata:", error);
      return defaultPersonnel;
    }
  });

  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [activeRole, setActiveRole] = useState("Tümü");
  const [activeTab, setActiveTab] = useState("aktif"); // "aktif" veya "gecmis"

  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
    email: "",
    role: "garson",
  });

  // Personel listesi her değiştiğinde localStorage'ı güncelle
  useEffect(() => {
    localStorage.setItem('personnel', JSON.stringify(personnel));
    updateFilteredPersonnel();
  }, [personnel, activeRole, activeTab]);

  const updateFilteredPersonnel = () => {
    let filtered = personnel;
    
    // Aktif/Pasif filtreleme
    if (activeTab === "aktif") {
      filtered = personnel.filter(p => p.isActive);
    } else {
      filtered = personnel.filter(p => !p.isActive);
    }
    
    // Rol filtreleme
    if (activeRole !== "Tümü") {
      filtered = filtered.filter(p => p.role === activeRole.toLowerCase());
    }
    
    setFilteredPersonnel(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPerson(prevState => ({ ...prevState, [name]: value }));
  };

  // Yeni personel ekleme
  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!newPerson.name || !newPerson.email || !newPerson.phone) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    const newId = personnel.length > 0 ? Math.max(...personnel.map(p => p.id)) + 1 : 1;

    const personToAdd = {
      id: newId,
      ...newPerson,
      role: newPerson.role.toLowerCase(),
      isActive: true,
    };

    setPersonnel(prev => [...prev, personToAdd]);
    setNewPerson({ name: "", phone: "", email: "", role: "garson" });

    console.log("Yeni personel lokal olarak eklendi:", personToAdd);
    alert("Personel başarıyla eklendi!");
  };

  // Personel durumunu değiştirme (aktif/pasif)
  const togglePersonStatus = (personId) => {
    setPersonnel(prev => 
      prev.map(person => 
        person.id === personId 
          ? { ...person, isActive: !person.isActive }
          : person
      )
    );
  };



  return (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    <div className="personnel-container">
      <h2 className="personnel-title">Personel Yönetimi</h2>
=======
=======
>>>>>>> Stashed changes
    <div style={{ maxWidth: 1200, margin: "32px auto", background: "#f8f9fa", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: 32 }}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1a3c34", fontWeight: 700 }}>Personel Yönetimi</h2>
>>>>>>> Stashed changes

      {/* Ana Sekmeler */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab("aktif")}
          style={{
            background: activeTab === "aktif" ? "#1a3c34" : "#e0e0e0",
            color: activeTab === "aktif" ? "#fff" : "#1a3c34",
            border: "none", borderRadius: 8, padding: "12px 24px", cursor: "pointer", fontWeight: 600,
          }}
        >
          Aktif Personel
        </button>
        <button
          onClick={() => setActiveTab("gecmis")}
          style={{
            background: activeTab === "gecmis" ? "#1a3c34" : "#e0e0e0",
            color: activeTab === "gecmis" ? "#fff" : "#1a3c34",
            border: "none", borderRadius: 8, padding: "12px 24px", cursor: "pointer", fontWeight: 600,
          }}
        >
          Geçmiş Personel
        </button>
      </div>

      {/* Ana Sekmeler */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab("aktif")}
          style={{
            background: activeTab === "aktif" ? "#1a3c34" : "#e0e0e0",
            color: activeTab === "aktif" ? "#fff" : "#1a3c34",
            border: "none", borderRadius: 8, padding: "12px 24px", cursor: "pointer", fontWeight: 600,
          }}
        >
          Aktif Personel
        </button>
        <button
          onClick={() => setActiveTab("gecmis")}
          style={{
            background: activeTab === "gecmis" ? "#1a3c34" : "#e0e0e0",
            color: activeTab === "gecmis" ? "#fff" : "#1a3c34",
            border: "none", borderRadius: 8, padding: "12px 24px", cursor: "pointer", fontWeight: 600,
          }}
        >
          Geçmiş Personel
        </button>
      </div>

      {/* Rol Filtresi */}
      <div className="role-filter">
        {["Tümü", "Garson", "Kasiyer"].map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={activeRole === role ? "active" : ""}
          >
            {role}
          </button>
        ))}
      </div>

<<<<<<< Updated upstream
<<<<<<< Updated upstream
      {/* Yeni Personel Ekleme Formu */}
      <div className="add-personnel-form">
        <h3 className="add-personnel-title">Yeni Personel Ekle</h3>
        <form onSubmit={handleAddPerson} className="personnel-form">
          <input name="name" value={newPerson.name} onChange={handleInputChange} placeholder="Ad Soyad" required />
          <input name="phone" value={newPerson.phone} onChange={handleInputChange} placeholder="Telefon" required />
          <input name="email" type="email" value={newPerson.email} onChange={handleInputChange} placeholder="E-posta" required />
          <select name="role" value={newPerson.role} onChange={handleInputChange}>
            <option value="garson">Garson</option>
            <option value="kasiyer">Kasiyer</option>
          </select>
          <button type="submit" className="add-personnel-btn">
            Personel Ekle
          </button>
        </form>
      </div>

      {/* Personel Listesi */}
      <div className="personnel-list">
        {filteredPersonnel.map((person) => (
          <div key={person.id} className="personnel-item">
            <div className="personnel-info">
              <div className="personnel-name">{person.name}</div>
              <div className="personnel-details">{person.phone} • {person.email}</div>
            </div>
            <div className={`personnel-status ${person.isActive ? 'active' : 'inactive'}`}>
              {person.isActive ? "Aktif" : "Pasif"}
            </div>
            {/* TODO: Düzenle ve Sil butonları eklenecek */}
=======
      {/* Yeni Personel Ekleme Formu - Sadece Aktif Personel sekmesinde göster */}
      {activeTab === "aktif" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 6px #0001" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#1a3c34" }}>Yeni Personel Ekle</h3>
          <form onSubmit={handleAddPerson} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <input 
              name="name" 
              value={newPerson.name} 
              onChange={handleInputChange} 
              placeholder="Ad Soyad" 
              required 
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }} 
            />
            <input 
              name="phone" 
              value={newPerson.phone} 
              onChange={handleInputChange} 
              placeholder="Telefon" 
              required 
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }} 
            />
            <input 
              name="email" 
              type="email" 
              value={newPerson.email} 
              onChange={handleInputChange} 
              placeholder="E-posta" 
              required 
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }} 
            />
            <select 
              name="role" 
              value={newPerson.role} 
              onChange={handleInputChange} 
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
            >
              <option value="garson">Garson</option>
              <option value="kasiyer">Kasiyer</option>
            </select>
            <button 
              type="submit" 
              style={{ 
                background: "#1a3c34", 
                color: "#fff", 
                border: "none", 
                borderRadius: 6, 
                padding: "10px 24px",
                cursor: "pointer"
              }}
            >
              Personel Ekle
            </button>
          </form>
        </div>
      )}

      {/* Personel Listesi */}
=======
      {/* Yeni Personel Ekleme Formu - Sadece Aktif Personel sekmesinde göster */}
      {activeTab === "aktif" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 6px #0001" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#1a3c34" }}>Yeni Personel Ekle</h3>
          <form onSubmit={handleAddPerson} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <input 
              name="name" 
              value={newPerson.name} 
              onChange={handleInputChange} 
              placeholder="Ad Soyad" 
              required 
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }} 
            />
            <input 
              name="phone" 
              value={newPerson.phone} 
              onChange={handleInputChange} 
              placeholder="Telefon" 
              required 
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }} 
            />
            <input 
              name="email" 
              type="email" 
              value={newPerson.email} 
              onChange={handleInputChange} 
              placeholder="E-posta" 
              required 
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }} 
            />
            <select 
              name="role" 
              value={newPerson.role} 
              onChange={handleInputChange} 
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
            >
              <option value="garson">Garson</option>
              <option value="kasiyer">Kasiyer</option>
            </select>
            <button 
              type="submit" 
              style={{ 
                background: "#1a3c34", 
                color: "#fff", 
                border: "none", 
                borderRadius: 6, 
                padding: "10px 24px",
                cursor: "pointer"
              }}
            >
              Personel Ekle
            </button>
          </form>
        </div>
      )}

      {/* Personel Listesi */}
>>>>>>> Stashed changes
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredPersonnel.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            color: "#666", 
            background: "#fff", 
            borderRadius: 12,
            boxShadow: "0 1px 6px #0001"
          }}>
            {activeTab === "aktif" ? "Aktif personel bulunamadı." : "Geçmiş personel bulunamadı."}
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
          </div>
        ) : (
          filteredPersonnel.map((person) => (
            <div key={person.id} style={{ 
              display: "flex", 
              alignItems: "center", 
              background: "#fff", 
              borderRadius: 10, 
              padding: "16px 20px", 
              gap: 20,
              boxShadow: "0 1px 6px #0001"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 17, color: "#1a3c34" }}>{person.name}</div>
                <div style={{ fontSize: 14, color: "#666" }}>
                  {person.phone} • {person.email} • {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
                </div>
              </div>
              
              <div style={{ 
                fontWeight: 600, 
                color: "#fff", 
                background: person.isActive ? "#38b000" : "#6c757d", 
                padding: "4px 12px", 
                borderRadius: 12 
              }}>
                {person.isActive ? "Aktif" : "Pasif"}
              </div>
              
                             <button
                 onClick={() => togglePersonStatus(person.id)}
                 style={{
                   background: person.isActive ? "#ff6b35" : "#38b000",
                   color: "#fff",
                   border: "none",
                   borderRadius: 6,
                   padding: "6px 12px",
                   cursor: "pointer",
                   fontSize: "12px"
                 }}
               >
                 {person.isActive ? "Pasif Yap" : "Aktif Yap"}
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PersonelEkleme;
