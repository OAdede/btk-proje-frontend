import React, { useState, useEffect } from 'react';
import { personnelService } from '../../services/personnelService';
import { validationUtils } from '../../utils/validation';
import { cameraUtils } from '../../utils/cameraUtils';
import './PersonelEkleme.css';

const PersonelEkleme = () => {
  const [personnel, setPersonnel] = useState([
  
  ]);

  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "garson",
    photo: null
  });

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);

  const [activeTab, setActiveTab] = useState("aktif");
  const [roleFilter, setRoleFilter] = useState("tümü");
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  
  // API states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    const validation = validationUtils.validatePersonnelForm(newPerson);
    if (!validation.isValid) {
      setError(validation.errors[0]); // Show first error
      return false;
    }
    return true;
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const responseData = await personnelService.registerPersonnel(newPerson);
      
      // Add the new person to local state with the response data
      const newPersonWithId = {
        id: responseData.id || Date.now(),
        name: newPerson.name,
        phone: newPerson.phone,
        email: newPerson.email,
        role: newPerson.role,
        photo: capturedImage,
        isActive: true
      };

      setPersonnel([...personnel, newPersonWithId]);
      
      // Reset form
      setNewPerson({ name: "", phone: "", email: "", password: "", role: "garson", photo: null });
      setCapturedImage(null);
      setSuccess("Personel başarıyla eklendi!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fotoğraf modalını açma
  const openPhotoModal = () => {
    setShowPhotoModal(true);
    setTempImage(null);
  };

  // Fotoğraf modalını kapatma
  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setTempImage(null);
    cameraUtils.stopCamera(cameraStream);
    setCameraStream(null);
  };

  // Kamera açma
  const startCamera = async () => {
    try {
      const stream = await cameraUtils.startCamera();
      setCameraStream(stream);
    } catch (error) {
      alert(error.message);
    }
  };

  // Kamera kapatma
  const stopCamera = () => {
    cameraUtils.stopCamera(cameraStream);
    setCameraStream(null);
  };

  // Fotoğraf çekme
  const capturePhoto = () => {
    if (cameraStream) {
      const video = document.getElementById('camera-video');
      try {
        const imageData = cameraUtils.capturePhoto(video);
        setTempImage(imageData);
        stopCamera();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // Dosyadan fotoğraf seçme
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        cameraUtils.validateImageFile(file);
        const imageData = await cameraUtils.handlePhotoUpload(file);
        const resizedImage = await cameraUtils.resizeImage(imageData);
        setTempImage(resizedImage);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // Fotoğrafı kabul etme
  const acceptPhoto = () => {
    if (tempImage) {
      setCapturedImage(tempImage);
      setNewPerson({ ...newPerson, photo: tempImage });
    }
    closePhotoModal();
  };

  // Fotoğrafı reddetme
  const rejectPhoto = () => {
    setTempImage(null);
  };

  // Fotoğrafı kaldırma
  const removePhoto = () => {
    setCapturedImage(null);
    setNewPerson({ ...newPerson, photo: null });
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
        <div className="add-personnel-form" style={{ position: 'relative' }}>
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
            <input
              name="password"
              type="password"
              value={newPerson.password}
              onChange={handleInputChange}
              placeholder="Şifre (aA1@)"
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

            {/* Fotoğraf Ekleme Bölümü */}
            {capturedImage ? (
              <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                <img 
                  src={capturedImage} 
                  alt="Seçilen fotoğraf" 
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #ddd',
                    marginBottom: '10px'
                  }}
                />
                <div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ❌ Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={openPhotoModal}
                style={{
                  background: '#513653',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                📷 Fotoğraf Ekle
              </button>
            )}

            {error && (
              <div style={{ color: 'red', marginTop: '10px', fontSize: '14px', textAlign: 'center' }}>{error}</div>
            )}
            {success && (
              <div style={{ color: 'green', marginTop: '10px', fontSize: '14px', textAlign: 'center' }}>{success}</div>
            )}

            <button type="submit" className="add-personnel-btn" disabled={isLoading}>
              {isLoading ? "Eklemek için bekleyin..." : "Personel Ekle"}
            </button>
          </form>

          {/* Fotoğraf Ekleme Modal */}
          {showPhotoModal && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--card)',
              color: 'var(--text)',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              width: '300px',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              zIndex: 1000
            }}>
              {/* Kapatma butonu */}
              <button
                onClick={closePhotoModal}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '25px',
                  height: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(220, 53, 69, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                ✕
              </button>

              <h3 style={{ margin: '0 0 15px 0', color: 'var(--text)', fontSize: '16px' }}>Fotoğraf Ekle</h3>

              {/* Fotoğraf önizlemesi */}
              {tempImage && (
                <div style={{ marginBottom: '15px' }}>
                  <img 
                    src={tempImage} 
                    alt="Önizleme" 
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--border)',
                      margin: '0 auto'
                    }}
                  />
                </div>
              )}

              {/* Kamera görüntüsü */}
              {cameraStream && !tempImage && (
                <div style={{ marginBottom: '15px' }}>
                  <video
                    id="camera-video"
                    autoPlay
                    playsInline
                    style={{
                      width: '200px',
                      height: '150px',
                      borderRadius: '8px',
                      margin: '0 auto',
                      border: '2px solid var(--border)'
                    }}
                    ref={(video) => {
                      if (video && cameraStream) {
                        video.srcObject = cameraStream;
                      }
                    }}
                  />
                </div>
              )}

              {/* Butonlar */}
              {!tempImage && !cameraStream && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
                  <button
                    onClick={startCamera}
                    style={{
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    📷 Kamera ile Çek
                  </button>
                  <label style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}>
                    📁 Dosyadan Seç
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}

              {/* Kamera butonları */}
              {cameraStream && !tempImage && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
                  <button
                    onClick={capturePhoto}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    📸 Fotoğraf Çek
                  </button>
                  <button
                    onClick={stopCamera}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    ❌ İptal
                  </button>
                </div>
              )}

              {/* Kabul/Ret butonları */}
              {tempImage && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={acceptPhoto}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    ✅ Kabul Et
                  </button>
                  <button
                    onClick={rejectPhoto}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    ❌ Reddet
                  </button>
                </div>
              )}
            </div>
          )}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img 
                  src={person.photo || '/default-avatar.png'} 
                  alt={person.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ddd'
                  }}
                />
                <div className="personnel-info">
                  <div className="personnel-name">{person.name}</div>
                  <div className="personnel-details">
                    {person.phone} • {person.email} • {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
                  </div>
                </div>
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

              <div className={`personnel-status ${person.isActive ? 'active' : 'inactive'}`}>
                {person.isActive ? "Aktif" : "Pasif"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PersonelEkleme;
