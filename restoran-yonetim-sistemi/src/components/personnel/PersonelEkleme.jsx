import React, { useState, useEffect } from "react";
import "./PersonelEkleme.css";

// Başlangıç için varsayılan personel verisi
const defaultPersonnel = [
  { id: 1, name: "Ahmet Yılmaz", email: "ahmet@restoran.com", phone: "05321234567", role: "garson", isActive: true },
  { id: 2, name: "Ayşe Kaya", email: "ayse@restoran.com", phone: "05331234567", role: "kasiyer", isActive: true },
  { id: 3, name: "Mehmet Demir", email: "mehmet@restoran.com", phone: "05341234567", role: "garson", isActive: false },
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

  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
    email: "",
    role: "garson",
  });

  // Personel listesi her değiştiğinde localStorage'ı güncelle
  useEffect(() => {
    localStorage.setItem('personnel', JSON.stringify(personnel));
    // Filtreyi de güncelle
    if (activeRole === "Tümü") {
      setFilteredPersonnel(personnel);
    } else {
      setFilteredPersonnel(personnel.filter(p => p.role === activeRole.toLowerCase()));
    }
  }, [personnel, activeRole]);

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
    // Backend ekibi için not: Bu noktada backend'e istek gönderilip şifre oluşturma maili tetiklenebilir.
    alert("Personel başarıyla (lokal olarak) eklendi. Şifre belirleme e-postası gönderilmiş gibi varsayılıyor.");
  };

  // TODO: Personel Silme ve Düzenleme Fonksiyonları eklenecek (localStorage kullanarak)

  return (
    <div className="personnel-container">
      <h2 className="personnel-title">Personel Yönetimi</h2>

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
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonelEkleme;
