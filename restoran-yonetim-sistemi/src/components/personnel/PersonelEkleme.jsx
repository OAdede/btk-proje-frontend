import React, { useState, useEffect } from 'react';
import { personnelService } from '../../services/personnelService';
import { validationUtils } from '../../utils/validation';
import { authService } from '../../services/authService';
import './PersonelEkleme.css';

const PersonelEkleme = () => {
  const [personnel, setPersonnel] = useState([]);

  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
    email: "",
    role: "waiter" // Default olarak waiter seçili
  });
  


  const [activeTab, setActiveTab] = useState("aktif");
  const [roleFilter, setRoleFilter] = useState("tümü");
  
  // API states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Telefon numarası formatı: 0 5xx xxx xx xx
  const formatPhoneNumber = (value) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    
    // 0 ile başlamıyorsa 0 ekle
    let formatted = numbers;
    if (numbers.length > 0 && numbers[0] !== '0') {
      formatted = '0' + numbers;
    }
    
    // Maksimum 11 hane olacak şekilde kes (0 + 10 digit)
    formatted = formatted.slice(0, 11);
    
    // Format uygula: 0 5xx xxx xx xx
    if (formatted.length >= 1) {
      if (formatted.length <= 1) {
        formatted = formatted;
      } else if (formatted.length <= 4) {
        formatted = formatted.slice(0, 1) + ' ' + formatted.slice(1);
      } else if (formatted.length <= 7) {
        formatted = formatted.slice(0, 1) + ' ' + formatted.slice(1, 4) + ' ' + formatted.slice(4);
      } else if (formatted.length <= 9) {
        formatted = formatted.slice(0, 1) + ' ' + formatted.slice(1, 4) + ' ' + formatted.slice(4, 7) + ' ' + formatted.slice(7);
      } else {
        formatted = formatted.slice(0, 1) + ' ' + formatted.slice(1, 4) + ' ' + formatted.slice(4, 7) + ' ' + formatted.slice(7, 9) + ' ' + formatted.slice(9);
      }
    }
    
    return formatted;
  };

  // Telefon input değişikliği
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNewPerson(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  // Load users from backend on component mount - with strict controls
  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;
    let isAborted = false;
    
    const loadUsers = async () => {
      // Prevent multiple calls
      if (hasLoaded || isAborted) return;
      hasLoaded = true;
      
      try {
        setIsLoadingUsers(true);


        // Load active and inactive lists in parallel
        const [activeUsersRaw, inactiveUsersRaw] = await Promise.all([
          personnelService.getActiveUsers(),
          personnelService.getInactiveUsers()
        ]);

        if (!isMounted || isAborted) return;

        const mapUser = (user) => {
                       // Map role from backend - convert number to string role name
                         let roleName = 'Garson'; // default
            if (user.roles && user.roles.length > 0) {
              const roleId = user.roles[0];

              
                                        // Map role ID to display name (backend returns: 0=admin, 1=garson, 2=kasiyer)
              if (roleId === 0 || roleId === 'admin') {
                roleName = 'Admin';

              }
              else if (roleId === 1 || roleId === 'waiter') {
                roleName = 'Garson';

              }
              else if (roleId === 2 || roleId === 'cashier') {
                roleName = 'Kasiyer';

              }
                             else {
                 console.warn(`Unknown role ID for user ${user.name}: ${roleId}, defaulting to Garson`);
                 roleName = 'Garson';
               }
            } else {

            }
           
           // Handle photo - check multiple possible photo fields
           let photoUrl = null;
           
           // First check if user has photoBase64 (old format)
           if (user.photoBase64 && user.photoBase64.length > 0) {
             photoUrl = `data:image/jpeg;base64,${user.photoBase64}`;

           }
           // Then check hasPhoto boolean (new format)
           else if (user.hasPhoto === true) {
             photoUrl = `/api/users/${user.id}/photo`;

           }
           // If neither exists, user has no photo
           else {
             photoUrl = null;

           }
          
                     return {
             id: user.id,
             name: user.name,
             phone: user.phoneNumber,
             email: user.email,
             role: roleName,
             photo: photoUrl,
             isActive: user.isActive !== undefined ? user.isActive : true // Use backend value or default to true
            };
        };

        // Transform both lists and merge
        const transformedUsers = [
          ...activeUsersRaw.map(mapUser).map(u => ({ ...u, isActive: true })),
          ...inactiveUsersRaw.map(mapUser).map(u => ({ ...u, isActive: false })),
        ];
        
        if (isMounted && !isAborted) {
          setPersonnel(transformedUsers);

          
          // Clear any previous errors
          setError(null);
        }
        
      } catch (err) {
        console.error('Kullanıcılar yüklenemedi:', err);
        // Don't set error for network issues, just log them
        if (isMounted && !isAborted) {
          setError(null); // Clear any existing errors
        }
      } finally {
        if (isMounted && !isAborted) {
          setIsLoadingUsers(false);
        }
      }
    };

    loadUsers();
    
    // Cleanup function
    return () => {
      isMounted = false;
      isAborted = true;
    };
  }, []); // Empty dependency array - only run once on mount

  // Calculate filtered personnel directly in render
  const filteredPersonnel = React.useMemo(() => {
    if (!Array.isArray(personnel)) return [];
    
    return personnel.filter(person => {
      const matchesTab = activeTab === "aktif" ? person.isActive : !person.isActive;
      const matchesRole = roleFilter === "tümü" || person.role === roleFilter;
      return matchesTab && matchesRole;
    });
  }, [personnel, activeTab, roleFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    
    const updatedPerson = { ...newPerson, [name]: value };
    
    setNewPerson(updatedPerson);
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
    
    // Telefon numarasından boşlukları temizle
    const cleanPhone = newPerson.phone.replace(/\s/g, '');
    const personDataToSend = {
      ...newPerson,
      phone: cleanPhone
    };
    

    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const responseData = await personnelService.registerPersonnel(personDataToSend);
      
             // Add the new person to local state with the response data
       const newPersonWithId = {
         id: responseData.id || Date.now(),
         name: newPerson.name,
         phone: newPerson.phone,
         email: newPerson.email,
          role: newPerson.role, // Keep the original role from form
         photo: '/default-avatar.png',
         isActive: responseData.isActive !== undefined ? responseData.isActive : true
       };
       
        

      setPersonnel([...personnel, newPersonWithId]);

      // Send forgot-password email to the new user to set password
      try {
        await authService.requestPasswordReset(newPerson.email);
      } catch (e) {
        console.warn('Şifre belirleme e-postası gönderilemedi:', e?.message);
      }
      
             // Reset form - default olarak waiter seçili
       setNewPerson({ name: "", phone: "", email: "", role: "waiter" });
      setSuccess("Personel başarıyla eklendi!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };



  const togglePersonStatus = async (personId) => {
    try {
      const current = personnel.find(p => p.id === personId);
      if (!current) return;
      const nextActive = !current.isActive;

      // Optimistic update
      setPersonnel(prev => prev.map(p => p.id === personId ? { ...p, isActive: nextActive } : p));

      // Persist
      const updated = await personnelService.setUserActiveStatus(personId, nextActive);

      // Reconcile
      if (typeof updated?.isActive === 'boolean') {
        setPersonnel(prev => prev.map(p => p.id === personId ? { ...p, isActive: updated.isActive } : p));
      }
    } catch (err) {
      setError(err.message || 'Durum güncellenemedi.');
    }
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
           onClick={() => setRoleFilter("Garson")}
           className={roleFilter === "Garson" ? "active" : ""}
         >
           Garson
         </button>
         <button
           onClick={() => setRoleFilter("Kasiyer")}
           className={roleFilter === "Kasiyer" ? "active" : ""}
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
              onChange={handlePhoneChange}
              placeholder="0 5xx xxx xx xx"
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
            {/* Şifre alanı kaldırıldı: kullanıcı mail ile gelen linkten şifre belirleyecek */}
                                      <select
                name="role"
                value={newPerson.role}
                onChange={handleInputChange}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
              >
                <option value="waiter">Garson</option>
                <option value="cashier">Kasiyer</option>
              </select>
              


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
        </div>
      )}

      {/* Personel Listesi */}
      <div className="personnel-list">
        {isLoadingUsers ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--text-secondary)",
            background: "var(--surface)",
            borderRadius: 12,
            boxShadow: "0 1px 6px var(--shadow)",
            border: "1px solid var(--border)"
          }}>
            Kullanıcılar yükleniyor...
          </div>
        ) : filteredPersonnel.length === 0 ? (
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
                                    <div key={person.id || crypto.randomUUID()} className="personnel-item">
                             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                 {/* Check if user has photo before making request */}
                 {person.photo ? (
                   <img 
                     src={person.photo} 
                     alt={person.name}
                     style={{
                       width: '50px',
                       height: '50px',
                       borderRadius: '50%',
                       objectFit: 'cover',
                       border: '2px solid #ddd'
                     }}
                     onError={(e) => {
                       // If photo fails to load, show default avatar
                       if (e.target.src !== '/default-avatar.png') {
  
                         e.target.src = '/default-avatar.png';
                       }
                     }}
                   />
                 ) : (
                   <img 
                     src="/default-avatar.png" 
                     alt={person.name}
                     style={{
                       width: '50px',
                       height: '50px',
                       borderRadius: '50%',
                       objectFit: 'cover',
                       border: '2px solid #ddd'
                     }}
                   />
                 )}
                <div className="personnel-info">
                  <div className="personnel-name">{person.name}</div>
                                     <div className="personnel-details">
                     {person.phone} • {person.email} • {person.role || 'Garson'}
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
