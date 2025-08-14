import React, { useEffect, useMemo, useState, useContext } from 'react';
import { activityLogService, extractLogMessage } from '../../services/activityLogService';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

const ActionBadge = ({ action }) => {
    const colorMap = {
        LOGIN: '#4caf50',
        LOGOUT: '#6b7280',
        CREATE: '#3b82f6',
        UPDATE: '#f59e0b',
        STATUS_UPDATE: '#8b5cf6',
        DELETE: '#ef4444',
        DEFAULT: '#64748b'
    };
    const bg = colorMap[action] || colorMap.DEFAULT;
    return (
        <span style={{
            background: bg,
            color: 'white',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.3px'
        }}>{action}</span>
    );
};

export default function ActivityLogs() {
    const { colors, isDarkMode } = useTheme();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [logs, setLogs] = useState([]);

    // Filters
    const [sortOrder, setSortOrder] = useState('desc'); // desc: now -> past, asc: past -> now
    const [userId, setUserId] = useState('');
    const [entityType, setEntityType] = useState('');
    const [entityId, setEntityId] = useState('');
    const [actionType, setActionType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 100;

    useEffect(() => {
        // Varsayılan: tüm kayıtları yükle
        fetchAll();
    }, []);

    const fetchAll = async () => {
        await run(async () => activityLogService.getAll());
    };
    const fetchByUser = async () => {
        if (!userId) return;
        await run(async () => activityLogService.getByUser(userId));
    };
    const fetchByEntity = async () => {
        const typeRaw = String(entityType || '').trim();
        const idRaw = String(entityId || '').trim();
        if (!typeRaw && !idRaw) return;
        const type = typeRaw.toUpperCase().replace(/[\s-]+/g, '_');
        const id = idRaw;
        await run(async () => {
            // Sunucuya yalnızca her ikisi varken gidelim; aksi halde istemci tarafında filtreleyelim
            if (type && id) {
                try {
                    return await activityLogService.getByEntity(type, id);
                } catch { }
            }
            const all = await activityLogService.getAll();
            return (all || []).filter(l => {
                const t = String(l.entity_type || l.entityType || '').toUpperCase();
                const i = String(l.entity_id ?? l.entityId ?? '');
                const typeOk = type ? t === type : true;
                const idOk = id ? i === id : true;
                return typeOk && idOk;
            });
        });
    };
    const fetchByAction = async () => {
        const actionRaw = String(actionType || '').trim();
        if (!actionRaw) return;
        const action = actionRaw.toUpperCase().replace(/\s+/g, '_');
        await run(async () => {
            try {
                return await activityLogService.getByActionType(action);
            } catch {
                const all = await activityLogService.getAll();
                return (all || []).filter(l => String(l.action_type || l.actionType || '').toUpperCase() === action);
            }
        });
    };
    const fetchByDateRange = async () => {
        if (!startDate || !endDate) return;
        await run(async () => activityLogService.getByDateRange(startDate, endDate));
    };

    const resetFiltersToAll = async () => {
        setUserId('');
        setEntityType('');
        setEntityId('');
        setActionType('');
        setStartDate('');
        setEndDate('');
        setSearch('');
        await fetchAll();
    };

    const run = async (fn) => {
        try {
            setLoading(true);
            setError('');
            const data = await fn();
            setLogs(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Loglar yüklenirken bir hata oluştu');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = useMemo(() => {
        const list = !search
            ? logs
            : logs.filter(l => {
                const message = extractLogMessage(l.details || l.message || '').toLowerCase();
                const action = String(l.action_type || l.actionType || '').toLowerCase();
                const entity = String(l.entity_type || l.entityType || '').toLowerCase();
                const email = String(l.email || '').toLowerCase();
                const q = search.toLowerCase();
                return message.includes(q) || action.includes(q) || entity.includes(q) || email.includes(q);
            });

        const parseTs = (v) => {
            if (!v) return 0;
            if (typeof v === 'number') return v;
            try {
                let str = String(v);
                if (str.includes(' ') && !str.includes('T')) str = str.replace(' ', 'T');
                str = str.replace(/\.(\d{3})\d+$/, '.$1');
                const d = new Date(str);
                const t = d.getTime();
                return isNaN(t) ? 0 : t;
            } catch {
                return 0;
            }
        };

        const sorted = [...list].sort((a, b) => {
            const ta = parseTs(a.created_at || a.createdAt || a.timestamp);
            const tb = parseTs(b.created_at || b.createdAt || b.timestamp);
            return sortOrder === 'desc' ? (tb - ta) : (ta - tb);
        });
        return sorted;
    }, [logs, search, sortOrder]);

    // Arama/sıralama veya yeni veri geldiğinde sayfayı başa al
    useEffect(() => {
        setPage(1);
    }, [logs, search, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageItems = filteredLogs.slice(startIndex, endIndex);

    const styles = {
        page: {
            padding: '20px',
            background: colors.background,
            color: colors.text,
            minHeight: '100%'
        },
        header: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '16px'
        },
        tabs: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
        },
        tabBtn: (active) => ({
            background: active ? colors.primary : (isDarkMode ? '#473653' : '#E5D9F2'),
            color: active ? '#fff' : colors.text,
            border: 'none',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
        }),
        filters: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '12px'
        },
        input: {
            background: colors.background,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '10px',
            width: '100%'
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            overflow: 'hidden',
            background: colors.card
        },
        th: {
            textAlign: 'left',
            fontWeight: 700,
            fontSize: '13px',
            color: colors.textSecondary,
            padding: '12px',
            borderBottom: `1px solid ${colors.border}`,
            background: isDarkMode ? '#473653' : '#E5D9F2'
        },
        td: {
            padding: '12px',
            borderBottom: `1px solid ${colors.border}`,
            color: colors.text,
            fontSize: '14px'
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h2 style={{ margin: 0 }}>🧭 Aktivite Logları</h2>
                <div style={styles.tabs}>
                    <button style={styles.tabBtn(sortOrder === 'asc')} onClick={() => setSortOrder('asc')}>Eskiden Yeniye</button>
                    <button style={styles.tabBtn(sortOrder === 'desc')} onClick={() => setSortOrder('desc')}>Yeniden Eskiye</button>
                </div>
            </div>

            <div style={styles.filters}>
                <input placeholder="Kullanıcı ID" value={userId} onChange={e => setUserId(e.target.value)} style={styles.input} />
                <button onClick={fetchByUser} style={styles.tabBtn(false)}>Kullanıcıya göre getir</button>

                <input placeholder="Varlık tipi (USER, PRODUCT, ORDER...)" value={entityType} onChange={e => setEntityType(e.target.value)} style={styles.input} />
                <input placeholder="Varlık ID" value={entityId} onChange={e => setEntityId(e.target.value)} style={styles.input} />
                <button onClick={fetchByEntity} style={styles.tabBtn(false)}>Varlığa göre getir</button>

                <input placeholder="Aksiyon (LOGIN, CREATE, DELETE, STATUS_UPDATE...)" value={actionType} onChange={e => setActionType(e.target.value)} style={styles.input} />
                <button onClick={fetchByAction} style={styles.tabBtn(false)}>Aksiyona göre getir</button>

                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.input} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.input} />
                <button onClick={fetchByDateRange} style={styles.tabBtn(false)}>Tarih aralığı</button>

                <input placeholder="Ara (mesaj, aksiyon, varlık, e-posta)" value={search} onChange={e => setSearch(e.target.value)} style={{ ...styles.input, gridColumn: '1 / -1' }} />

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={resetFiltersToAll} style={styles.tabBtn(false)}>Tümünü getir (Filtreleri sıfırla)</button>
                </div>
            </div>

            {error && (
                <div style={{
                    marginBottom: 12,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: isDarkMode ? '#5b2731' : '#fde2e2',
                    color: isDarkMode ? '#fff' : '#991b1b'
                }}>{error}</div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Kullanıcı ID</th>
                            <th style={styles.th}>Aksiyon</th>
                            <th style={styles.th}>Varlık Türü</th>
                            <th style={styles.th}>Varlık ID</th>
                            <th style={styles.th}>Mesaj</th>
                            <th style={styles.th}>Tarih</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td style={styles.td} colSpan={7}>Yükleniyor...</td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td style={styles.td} colSpan={7}>Kayıt bulunamadı</td>
                            </tr>
                        ) : (
                            pageItems.map((log) => {
                                const id = log.id ?? log.log_id ?? Math.random().toString(36).slice(2);
                                const action = log.action_type || log.actionType || '—';
                                const entityType = log.entity_type || log.entityType || '—';
                                const entityId = log.entity_id ?? log.entityId ?? '—';
                                const userIdCol = log.user_id ?? log.userId ?? '';
                                const createdAt = log.created_at || log.createdAt || log.timestamp || '';
                                const message = extractLogMessage(log.details || log.message || '');
                                return (
                                    <tr key={`${id}-${createdAt}`}>
                                        <td style={styles.td}>{id}</td>
                                        <td style={styles.td}>{userIdCol}</td>
                                        <td style={styles.td}><ActionBadge action={String(action)} /></td>
                                        <td style={styles.td}>{entityType}</td>
                                        <td style={styles.td}>{entityId}</td>
                                        <td style={{ ...styles.td, maxWidth: 520 }} title={message}>{message}</td>
                                        <td style={styles.td}>{createdAt ? new Date(createdAt).toLocaleString('tr-TR') : '—'}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Sayfalama */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '12px' }}>
                <div style={{ color: colors.textSecondary, fontSize: '14px' }}>
                    Toplam {filteredLogs.length} kayıt • Sayfa {safePage}/{totalPages} • Sayfa boyutu {pageSize}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button style={styles.tabBtn(false)} disabled={safePage <= 1} onClick={() => setPage(1)}>« İlk</button>
                    <button style={styles.tabBtn(false)} disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>‹ Önceki</button>
                    <button style={styles.tabBtn(false)} disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>Sonraki ›</button>
                    <button style={styles.tabBtn(false)} disabled={safePage >= totalPages} onClick={() => setPage(totalPages)}>Son »</button>
                </div>
            </div>
        </div>
    );
}


