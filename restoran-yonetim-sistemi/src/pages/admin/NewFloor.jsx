import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonService } from '../../services/salonService';
import { diningTableService } from '../../services/diningTableService';
import { TableContext } from '../../context/TableContext.jsx';

export default function NewFloor() {
  const navigate = useNavigate();
  const { tables = [], salons = [], isLoading, loadTablesAndSalons } = useContext(TableContext);

  const [name, setName] = useState('');
  const [tableCount, setTableCount] = useState(6);
  const [defaultCapacity, setDefaultCapacity] = useState(4);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mevcut en yüksek masa no +1 önerisi
  const recommendedFirstNumber = useMemo(() => {
    try {
      const nums = (tables || [])
        .map(t => Number(t?.tableNumber ?? t?.number ?? t?.id))
        .filter(n => !Number.isNaN(n));
      const max = nums.length > 0 ? Math.max(...nums) : 0;
      return max + 1;
    } catch {
      return 1;
    }
  }, [tables]);

  const [firstTableNumber, setFirstTableNumber] = useState(recommendedFirstNumber);
  const [userEditedFirstNumber, setUserEditedFirstNumber] = useState(false);

  // Var olan masa numaraları
  const existingNumbers = useMemo(() => {
    const set = new Set();
    (tables || []).forEach(t => {
      const n = Number(t?.tableNumber ?? t?.number ?? t?.id);
      if (!Number.isNaN(n)) set.add(n);
    });
    return set;
  }, [tables]);

  const nextTableNumberStart = Number(firstTableNumber) || 1;

  const collisions = useMemo(() => {
    const cnt = Number(tableCount) || 0;
    const start = Number(nextTableNumberStart) || 0;
    const list = [];
    for (let i = 0; i < cnt; i++) {
      const n = start + i;
      if (existingNumbers.has(n)) list.push(n);
    }
    return list;
  }, [tableCount, nextTableNumberStart, existingNumbers]);

  // İlk öneriyi, kullanıcı elle değiştirmediyse otomatik uygula
  useEffect(() => {
    if (!userEditedFirstNumber) {
      setFirstTableNumber(recommendedFirstNumber);
    }
  }, [recommendedFirstNumber, userEditedFirstNumber]);

  // Sayfa açıldığında kritik verileri tazele
  useEffect(() => {
    try { loadTablesAndSalons?.(); } catch {}
  }, [loadTablesAndSalons]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (submitting) return;

    const validName = (name?.trim() || '').trim();
    const count = Number(tableCount);
    const capacity = Number(defaultCapacity);
    const start = Number(nextTableNumberStart);

    if (!count || count < 1) {
      setError('Masa sayısı en az 1 olmalıdır.');
      return;
    }
    if (!capacity || capacity < 1) {
      setError('Varsayılan kapasite en az 1 olmalıdır.');
      return;
    }
    if (!start || start < 1) {
      setError('İlk masa numarası en az 1 olmalıdır.');
      return;
    }
    if (collisions.length > 0) {
      setError(`Seçilen aralıkta mevcut masalar var: ${collisions.slice(0, 8).join(', ')}${collisions.length > 8 ? '…' : ''}. Öneri: ${recommendedFirstNumber}`);
      return;
    }

    setSubmitting(true);
    try {
      // 1) Kat oluştur
      const nextSalonId = (salons?.length || 0) + 1;
      const salonPayload = { 
        id: nextSalonId,
        name: validName || (salons?.length <= 0 ? 'Zemin' : `Kat ${salons.length}`),
        capacity: count * capacity, // Toplam salon kapasitesi = masa sayısı × masa kapasitesi
        description: `Kat ${nextSalonId}`,
        total_tables: count
      };
      console.log('Salon payload:', salonPayload);
      
      const createdSalon = await salonService.createSalon(salonPayload);
      console.log('Created salon response:', createdSalon);
      
      const salonId = createdSalon?.id;
      if (!salonId) throw new Error('Salon oluşturuldu ancak ID okunamadı.');

      // 2) Masaları oluştur
      const ops = [];
      for (let i = 0; i < count; i++) {
        const num = start + i;
        const payload = {
          salonId: Number(salonId),
          statusId: 1, // 1 = AVAILABLE durumu
          tableNumber: num,
          capacity: Number(capacity),
          description: `Masa ${num}`,
          total_tables: 1
        };
        console.log(`Table ${num} payload:`, payload);
        ops.push(
          diningTableService.createTable(payload).catch(err => {
            throw new Error(`Masa ${num} oluşturulurken hata: ${err?.message || 'Bilinmeyen hata'}`);
          })
        );
      }
      await Promise.all(ops);

      // 3) Verileri tazele ve dashboard'a dön
      try { await loadTablesAndSalons?.(); } catch {}
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err?.message || 'Beklenmeyen bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Yeni Kat Oluştur</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 520, display: 'grid', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Kat Adı</label>
          <input
            type="text"
            placeholder={salons?.length <= 0 ? 'Zemin' : `Kat ${salons.length}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Masa Sayısı</label>
          <input
            type="number"
            min={1}
            value={tableCount}
            onChange={(e) => setTableCount(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6 }}
            required
          />
          <div style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
            Önerilen ilk masa numarası: {recommendedFirstNumber}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>İlk Masa Numarası</label>
          <input
            type="number"
            min={1}
            value={firstTableNumber}
            onChange={(e) => { setFirstTableNumber(e.target.value); setUserEditedFirstNumber(true); }}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6 }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Varsayılan Kapasite</label>
          <input
            type="number"
            min={1}
            value={defaultCapacity}
            onChange={(e) => setDefaultCapacity(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6 }}
            required
          />
        </div>

        {error && (
          <div style={{ color: '#d32f2f', background: '#fdecea', border: '1px solid #f5c2c7', padding: '10px 12px', borderRadius: 6 }}>
            {error}
          </div>
        )}
        {!error && collisions.length > 0 && (
          <div style={{ color: '#7a5300', background: '#fff4e5', border: '1px solid #ffe8cc', padding: '10px 12px', borderRadius: 6 }}>
            Uyarı: Seçilen aralıkta mevcut masalar var: {collisions.slice(0, 8).join(', ')}{collisions.length > 8 ? '…' : ''}. Öneri: {recommendedFirstNumber}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            style={{ padding: '10px 16px', background: '#6c757d', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}
          >
            Geri
          </button>
          <button
            type="submit"
            disabled={submitting || collisions.length > 0 || (tables?.length === 0 && isLoading)}
            style={{ padding: '10px 16px', background: '#513653', color: '#fff', border: 0, borderRadius: 6, cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'Oluşturuluyor...' : 'Katı ve Masaları Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}

