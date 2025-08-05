import React, { useState, useEffect } from 'react';
import './PersonelEkleme.css';

const PersonelEkleme = () => {
  const [personnel, setPersonnel] = useState([
    {
      id: 1,
      name: "Ahmet Yılmaz",
      phone: "05321234567",
      email: "ahmet@restoran.com",
      role: "garson",
      isActive: true
    },
    {
      id: 2,
      name: "Ayşe Kaya",
      phone: "05331234567",
      email: "ayse@restoran.com",
      role: "kasiyer",
      isActive: true
    }
  ]);

  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
    email: "",
    role: "garson"
  });

  const [activeTab, setActiveTab] = useState("aktif");
  const [roleFilter, setRoleFilter] = useState("tümü");
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);

  const updateFilteredPersonnel = () => {
    let filtered = personnel.filter(person => {
      const matchesTab = activeTab === "aktif" ? person.isActive : !person.isActive;
      const matchesRole = roleFilter === "tümü" || person.role === roleFilter;
      return matchesTab && matchesRole;
    });
    setFilteredPersonnel(filtered);
  };

  useEffect(() => {
    updateFilteredPersonnel();
  }, [personnel, activeTab, roleFilter]);

  const handleInputChange = (e) => {
    setNewPerson({ ...newPerson, [e.target.name]: e.target.value });
  };

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (newPerson.name && newPerson.phone && newPerson.email) {
      const newPersonWithId = {
        ...newPerson,
        id: Date.now(),
        isActive: true
      };
      setPersonnel([...personnel, newPersonWithId]);
      setNewPerson({ name: "", phone: "", email: "", role: "garson" });
    }
  };

  const togglePersonStatus = (personId) => {
    setPersonnel(personnel.map(person =>
      person.id === personId ? { ...person, isActive: !person.isActive } : person
    ));
  };

  return (
    <div className="personnel-container">
      <h1 className="personnel-title">Personel Yönetimi</h1>

      {/* Tab Filtreleri */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, justifyContent: "center" }}>
        <button
          onClick={() => setActiveTab("aktif")}
          style={{
            background: activeTab === "aktif" ? "var(--success)" : "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 18px",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Aktif Personel
        </button>
        <button
          onClick={() => setActiveTab("geçmiş")}
          style={{
            background: activeTab === "geçmiş" ? "var(--success)" : "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 18px",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Geçmiş Personel
        </button>
      </div>

      {/* Rol Filtreleri */}
      <div className="role-filter">
        <button
          onClick={() => setRoleFilter("tümü")}
          className={roleFilter === "tümü" ? "active" : ""}
        >
          Tümü
        </button>
        <button
          onClick={() => setRoleFilter("garson")}
          className={roleFilter === "garson" ? "active" : ""}
        >
          Garson
        </button>
        <button
          onClick={() => setRoleFilter("kasiyer")}
          className={roleFilter === "kasiyer" ? "active" : ""}
        >
          Kasiyer
        </button>
      </div>

      {/* Yeni Personel Ekleme Formu */}
      {activeTab === "aktif" && (
        <div className="add-personnel-form">
          <h3 className="add-personnel-title">Yeni Personel Ekle</h3>
          <form onSubmit={handleAddPerson} className="personnel-form">
            <input
              name="name"
              type="text"
              value={newPerson.name}
              onChange={handleInputChange}
              placeholder="Ad Soyad"
              required
            />
            <input
              name="phone"
              type="tel"
              value={newPerson.phone}
              onChange={handleInputChange}
              placeholder="Telefon"
              required
            />
            <input
              name="email"
              type="email"
              value={newPerson.email}
              onChange={handleInputChange}
              placeholder="E-posta"
              required
            />
            <select
              name="role"
              value={newPerson.role}
              onChange={handleInputChange}
            >
              <option value="garson">Garson</option>
              <option value="kasiyer">Kasiyer</option>
            </select>
            <button type="submit" className="add-personnel-btn">
              Personel Ekle
            </button>
          </form>
        </div>
      )}

      {/* Personel Listesi */}
      <div className="personnel-list">
        {filteredPersonnel.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--text-secondary)",
            background: "var(--surface)",
            borderRadius: 12,
            boxShadow: "0 1px 6px var(--shadow)",
            border: "1px solid var(--border)"
          }}>
            {activeTab === "aktif" ? "Aktif personel bulunamadı." : "Geçmiş personel bulunamadı."}
          </div>
        ) : (
          filteredPersonnel.map((person) => (
            <div key={person.id} className="personnel-item">
              <div className="personnel-info">
                <div className="personnel-name">{person.name}</div>
                <div className="personnel-details">
                  {person.phone} • {person.email} • {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
                </div>
              </div>

              <div className={`personnel-status ${person.isActive ? 'active' : 'inactive'}`}>
                {person.isActive ? "Aktif" : "Pasif"}
              </div>

              <button
                onClick={() => togglePersonStatus(person.id)}
                style={{
                  background: person.isActive ? "var(--warning)" : "var(--success)",
                  color: "var(--text)",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600
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
