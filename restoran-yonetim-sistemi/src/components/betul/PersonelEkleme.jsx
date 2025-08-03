import React, { useState, useEffect } from "react";
import "./App.css";

const varsayilanPersonel = {
  "Garson": [
    { id: 1, ad: "Ahmet Yılmaz", telefon: "0532 123 4567", email: "ahmet@restoran.com", baslangicTarihi: "2024-01-15", durum: "Aktif" },
    { id: 2, ad: "Fatma Demir", telefon: "0533 234 5678", email: "fatma@restoran.com", baslangicTarihi: "2024-02-01", durum: "Aktif" },
  ],
  "Kasiyer": [
    { id: 4, ad: "Ayşe Özkan", telefon: "0535 456 7890", email: "ayse@restoran.com", baslangicTarihi: "2024-01-10", durum: "Aktif" },
  ]
};

const pozisyonlar = ["Garson", "Kasiyer"];

function PersonelEkleme() {
  const [personel, setPersonel] = useState(() => {
    const kayitliPersonel = localStorage.getItem('personelData');
    return kayitliPersonel ? JSON.parse(kayitliPersonel) : varsayilanPersonel;
  });

  const [aktifPozisyon, setAktifPozisyon] = useState("Garson");
  const [yeniPersonel, setYeniPersonel] = useState({
    ad: "",
    telefon: "",
    email: "",
    baslangicTarihi: "",
    pozisyon: "Garson"
  });
  const [duzenleModal, setDuzenleModal] = useState({ acik: false, personel: null, pozisyon: "" });

  useEffect(() => {
    localStorage.setItem('personelData', JSON.stringify(personel));
  }, [personel]);

  const gosterilecekPersonel = aktifPozisyon === "Tümü"
    ? Object.values(personel).flat()
    : personel[aktifPozisyon] || [];

  const personelEkle = () => {
    if (!yeniPersonel.ad || !yeniPersonel.telefon || !yeniPersonel.email || !yeniPersonel.baslangicTarihi) return;

    // Benzersiz bir token oluştur (simülasyon)
    const token = Math.random().toString(36).substr(2);

    const yeniPersonelKaydi = {
      id: Date.now(),
      ...yeniPersonel,
      durum: "Onay Bekliyor", // Başlangıç durumu
      resetToken: token // Şifre belirleme için token
    };

    setPersonel(prev => ({
      ...prev,
      [yeniPersonel.pozisyon]: [...(prev[yeniPersonel.pozisyon] || []), yeniPersonelKaydi],
    }));

    // Geliştirme için konsola tıklanabilir link yazdır
    const resetLink = `${window.location.origin}/reset-password/${token}`;
    console.log(`%cYeni Personel İçin Şifre Belirleme Linki:`, 'color: blue; font-weight: bold;');
    console.log(resetLink);

    setYeniPersonel({ ad: "", telefon: "", email: "", baslangicTarihi: "", pozisyon: "Garson" });
  };

  const personelSil = (id, pozisyon) => {
    setPersonel(prev => ({
      ...prev,
      [pozisyon]: prev[pozisyon].filter(p => p.id !== id)
    }));
  };

  const handleDuzenleKaydet = (duzenlenmisPersonel) => {
    setPersonel(prev => {
      const guncelPersonel = { ...prev };
      const pozisyonPersoneli = [...guncelPersonel[duzenlenmisPersonel.pozisyon]];
      const index = pozisyonPersoneli.findIndex(p => p.id === duzenlenmisPersonel.id);
      if (index !== -1) {
        pozisyonPersoneli[index] = duzenlenmisPersonel;
        guncelPersonel[duzenlenmisPersonel.pozisyon] = pozisyonPersoneli;
      }
      return guncelPersonel;
    });
    setDuzenleModal({ acik: false, personel: null, pozisyon: "" });
  };


  return (
    <div style={{ maxWidth: 1000, margin: "32px auto", background: "#f8f9fa", borderRadius: 16, padding: 32 }}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1a3c34", fontWeight: 700 }}>Personel Yönetimi</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["Tümü", ...pozisyonlar].map((pozisyon) => (
          <button key={pozisyon} onClick={() => setAktifPozisyon(pozisyon)} style={{ background: aktifPozisyon === pozisyon ? "#1a3c34" : "#e0e0e0", color: aktifPozisyon === pozisyon ? "#fff" : "#1a3c34", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            {pozisyon}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 6px #0001" }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#1a3c34" }}>Yeni Personel Ekle</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Ad Soyad:</label>
            <input type="text" placeholder="Ad Soyad" value={yeniPersonel.ad} onChange={e => setYeniPersonel({ ...yeniPersonel, ad: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Telefon:</label>
            <input type="tel" placeholder="0532 123 4567" value={yeniPersonel.telefon} onChange={e => setYeniPersonel({ ...yeniPersonel, telefon: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>E-posta:</label>
            <input type="email" placeholder="ornek@restoran.com" value={yeniPersonel.email} onChange={e => setYeniPersonel({ ...yeniPersonel, email: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Başlangıç Tarihi:</label>
            <input type="date" value={yeniPersonel.baslangicTarihi} onChange={e => setYeniPersonel({ ...yeniPersonel, baslangicTarihi: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Pozisyon:</label>
            <select value={yeniPersonel.pozisyon} onChange={e => setYeniPersonel({ ...yeniPersonel, pozisyon: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: "100%" }}>
              {pozisyonlar.map(pozisyon => <option key={pozisyon} value={pozisyon}>{pozisyon}</option>)}
            </select>
          </div>
        </div>
        <button onClick={personelEkle} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer", marginTop: 16 }}>
          Personel Ekle
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {gosterilecekPersonel.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 10, padding: "16px 20px", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 17, color: "#1a3c34" }}>{p.ad}</div>
              <div style={{ fontSize: 14, color: "#666" }}>{p.telefon} • {p.email}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Başlangıç: {p.baslangicTarihi}</div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#fff", background: p.durum === "Aktif" ? "#38b000" : (p.durum === "Pasif" ? "#6c757d" : "#ff6b35"), padding: "4px 12px", borderRadius: 12, minWidth: 110, textAlign: "center" }}>
              {p.durum}
            </div>
            <button onClick={() => setDuzenleModal({ acik: true, personel: p, pozisyon: p.pozisyon })} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Düzenle</button>
            <button onClick={() => personelSil(p.id, p.pozisyon)} style={{ background: "#d90429", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Sil</button>
          </div>
        ))}
      </div>

      {duzenleModal.acik && <DuzenleModal personel={duzenleModal.personel} onKaydet={handleDuzenleKaydet} onIptal={() => setDuzenleModal({ acik: false, personel: null, pozisyon: "" })} />}
    </div>
  );
}

function DuzenleModal({ personel, onKaydet, onIptal }) {
  const [duzenlenenPersonel, setDuzenlenenPersonel] = useState(personel);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDuzenlenenPersonel(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, minWidth: 500 }}>
        <h3>Personel Bilgilerini Düzenle</h3>
        {/* Düzenleme form alanları */}
        <div style={{ marginBottom: 12 }}>
          <label>Ad Soyad:</label>
          <input name="ad" value={duzenlenenPersonel.ad} onChange={handleChange} style={{ width: "100%", padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Telefon:</label>
          <input name="telefon" value={duzenlenenPersonel.telefon} onChange={handleChange} style={{ width: "100%", padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>E-posta:</label>
          <input name="email" type="email" value={duzenlenenPersonel.email} onChange={handleChange} style={{ width: "100%", padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Durum:</label>
          <select name="durum" value={duzenlenenPersonel.durum} onChange={handleChange} style={{ width: "100%", padding: 8 }}>
            <option value="Aktif">Aktif</option>
            <option value="Pasif">Pasif</option>
            <option value="Onay Bekliyor">Onay Bekliyor</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onIptal}>İptal</button>
          <button onClick={() => onKaydet(duzenlenenPersonel)}>Kaydet</button>
        </div>
      </div>
    </div>
  );
}

export default PersonelEkleme;