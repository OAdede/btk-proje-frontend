import React, { useState, useEffect } from 'react';
import { personnelService } from '../../services/personnelService';
import { validationUtils } from '../../utils/validation';
import './PersonelEkleme.css';

const PersonelEkleme = () => {
  const [personnel, setPersonnel] = useState([]);

  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "waiter" // Default olarak waiter seçili
  });
  
  // Debug: State'i sürekli log'la
  console.log('Current newPerson state:', newPerson);

  const [activeTab, setActiveTab] = useState("aktif");
  const [roleFilter, setRoleFilter] = useState("tümü");
  
  // API states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

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
        console.log('Starting to load users...');
        
        const users = await personnelService.getAllUsers();
        
        // Check if component is still mounted and not aborted
        if (!isMounted || isAborted) return;
        
                 console.log('Users received:', users);
         
                   // Log first user data to debug
          if (users.length > 0) {
            console.log('First user data for debugging:', {
              id: users[0].id,
              name: users[0].name,
              hasPhoto: users[0].hasPhoto,
              photoBase64: users[0].photoBase64 ? 'exists' : 'null',
              roles: users[0].roles,
              rolesType: typeof users[0].roles,
              rolesLength: users[0].roles ? users[0].roles.length : 0
            });
          }
          
          // Log all users' roles for debugging
          console.log('All users roles:', users.map(user => ({
            name: user.name,
            roles: user.roles,
            rolesType: typeof user.roles
          })));
         
         // Transform backend data to match component format
         const transformedUsers = users.map(user => {
                       // Map role from backend - convert number to string role name
                         let roleName = 'Garson'; // default
            if (user.roles && user.roles.length > 0) {
              const roleId = user.roles[0];
              console.log(`Mapping role for user ${user.name}: roleId = ${roleId}, type = ${typeof roleId}, roles array = [${user.roles}]`);
              
                                        // Map role ID to display name (backend returns: 0=admin, 1=garson, 2=kasiyer)
              if (roleId === 0 || roleId === 'admin') {
                roleName = 'Admin';
                console.log(`  → Mapped ${roleId} to 'Admin'`);
              }
              else if (roleId === 1 || roleId === 'waiter') {
                roleName = 'Garson';
                console.log(`  → Mapped ${roleId} to 'Garson'`);
              }
              else if (roleId === 2 || roleId === 'cashier') {
                roleName = 'Kasiyer';
                console.log(`  → Mapped ${roleId} to 'Kasiyer'`);
              }
                             else {
                 console.warn(`Unknown role ID for user ${user.name}: ${roleId}, defaulting to Garson`);
                 roleName = 'Garson';
               }
            } else {
              console.log(`User ${user.name} has no roles or empty roles array`);
            }
           
           // Handle photo - check multiple possible photo fields
           let photoUrl = null;
           
           // First check if user has photoBase64 (old format)
           if (user.photoBase64 && user.photoBase64.length > 0) {
             photoUrl = `data:image/jpeg;base64,${user.photoBase64}`;
             console.log(`User ${user.name} has photoBase64, using data URL`);
           }
           // Then check hasPhoto boolean (new format)
           else if (user.hasPhoto === true) {
             photoUrl = `/api/users/${user.id}/photo`;
             console.log(`User ${user.name} has photo (hasPhoto: ${user.hasPhoto}), URL: ${photoUrl}`);
           }
           // If neither exists, user has no photo
           else {
             photoUrl = null;
             console.log(`User ${user.name} has no photo (hasPhoto: ${user.hasPhoto}, photoBase64: ${user.photoBase64 ? 'exists' : 'null'})`);
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
        });
        
        if (isMounted && !isAborted) {
          setPersonnel(transformedUsers);
          console.log('Users loaded and transformed:', transformedUsers.length);
          
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
    console.log(`Form field changed: ${name} = ${value}`);
    console.log('Previous state:', newPerson);
    
    const updatedPerson = { ...newPerson, [name]: value };
    console.log('Updated state:', updatedPerson);
    
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
    
    console.log('Form submitted with data:', newPerson);
    
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
         role: newPerson.role, // Keep the original role from form
         photo: '/default-avatar.png',
         isActive: responseData.isActive !== undefined ? responseData.isActive : true
       };
       
               console.log('New person added to state:', {
          id: newPersonWithId.id,
          name: newPersonWithId.name,
          role: newPersonWithId.role,
          backendRole: responseData.roles,
          backendRoleType: typeof responseData.roles,
          backendRoleLength: responseData.roles ? responseData.roles.length : 0
        });

      setPersonnel([...personnel, newPersonWithId]);
      
             // Reset form - default olarak waiter seçili
       setNewPerson({ name: "", phone: "", email: "", password: "", role: "waiter" });
      setSuccess("Personel başarıyla eklendi!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
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
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
              >
                <option value="waiter">Garson</option>
                <option value="cashier">Kasiyer</option>
              </select>
              
             {/* Debug: Seçilen değeri göster */}
             <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' }}>
               Seçilen rol: {newPerson.role}
             </div>

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
                         console.log(`Photo failed to load for ${person.name}, using default avatar`);
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
