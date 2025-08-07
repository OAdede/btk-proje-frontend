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
      setNewPerson({ name: "", phone: "", email: "", role: "garson", photo: null });
      setCapturedImage(null);
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
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Kamera açma
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
    } catch (error) {
      alert('Kamera erişimi sağlanamadı: ' + error.message);
    }
  };

  // Kamera kapatma
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Fotoğraf çekme
  const capturePhoto = () => {
    if (cameraStream) {
      const video = document.getElementById('camera-video');
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setTempImage(imageData);
      stopCamera();
    }
  };

  // Dosyadan fotoğraf seçme
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setTempImage(imageData);
      };
      reader.readAsDataURL(file);
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

            <button type="submit" className="add-personnel-btn">
              Personel Ekle
            </button>
          </form>
        </div>
      )}

             {/* Fotoğraf Ekleme Modal */}
       {showPhotoModal && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           width: '100vw',
           height: '100vh',
           background: 'rgba(0, 0, 0, 0.8)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 9999
         }}>
           <div style={{
             background: 'white',
             padding: '30px',
             borderRadius: '12px',
             textAlign: 'center',
             position: 'relative',
             maxWidth: '500px',
             width: '90%'
           }}>
             {/* Kapatma butonu */}
             <button
               onClick={closePhotoModal}
               style={{
                 position: 'absolute',
                 top: '15px',
                 right: '20px',
                 background: 'none',
                 border: 'none',
                 fontSize: '24px',
                 color: '#dc3545',
                 cursor: 'pointer',
                 fontWeight: 'bold',
                 width: '30px',
                 height: '30px',
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

             <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Fotoğraf Ekle</h3>

             {/* Fotoğraf önizlemesi */}
             {tempImage && (
               <div style={{ marginBottom: '20px' }}>
                 <img 
                   src={tempImage} 
                   alt="Önizleme" 
                   style={{
                     width: '200px',
                     height: '200px',
                     borderRadius: '50%',
                     objectFit: 'cover',
                     border: '3px solid #ddd',
                     margin: '0 auto'
                   }}
                 />
               </div>
             )}

             {/* Kamera görüntüsü */}
             {cameraStream && !tempImage && (
               <div style={{ marginBottom: '20px' }}>
                 <video
                   id="camera-video"
                   autoPlay
                   playsInline
                   style={{
                     width: '300px',
                     height: '225px',
                     borderRadius: '8px',
                     margin: '0 auto'
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
               <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
                 <button
                   onClick={startCamera}
                   style={{
                     background: '#007bff',
                     color: 'white',
                     border: 'none',
                     padding: '10px 20px',
                     borderRadius: '6px',
                     cursor: 'pointer',
                     fontSize: '14px',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '6px'
                   }}
                 >
                   📷 Kamera ile Çek
                 </button>
                 <label style={{
                   background: '#28a745',
                   color: 'white',
                   border: 'none',
                   padding: '10px 20px',
                   borderRadius: '6px',
                   cursor: 'pointer',
                   fontSize: '14px',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '6px'
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
               <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                 <button
                   onClick={capturePhoto}
                   style={{
                     background: '#28a745',
                     color: 'white',
                     border: 'none',
                     padding: '10px 20px',
                     borderRadius: '6px',
                     cursor: 'pointer',
                     fontSize: '14px',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '6px'
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
                     padding: '10px 20px',
                     borderRadius: '6px',
                     cursor: 'pointer',
                     fontSize: '14px'
                   }}
                 >
                   ❌ İptal
                 </button>
               </div>
             )}

             {/* Kabul/Ret butonları */}
             {tempImage && (
               <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                 <button
                   onClick={acceptPhoto}
                   style={{
                     background: '#28a745',
                     color: 'white',
                     border: 'none',
                     padding: '10px 20px',
                     borderRadius: '6px',
                     cursor: 'pointer',
                     fontSize: '14px',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '6px'
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
                     padding: '10px 20px',
                     borderRadius: '6px',
                     cursor: 'pointer',
                     fontSize: '14px',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '6px'
                   }}
                 >
                   ❌ Reddet
                 </button>
               </div>
             )}
           </div>
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
