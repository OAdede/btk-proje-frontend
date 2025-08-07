import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext";

export default function WaiterHome() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { tableStatus, reservations } = useContext(TableContext);
    const [selectedFloor, setSelectedFloor] = useState(0); // Başlangıç katı Zemin
    const [tableCounts, setTableCounts] = useState({ 0: 8, 1: 8, 2: 8 }); // Her kattaki masa sayısı
    const floors = [0, 1, 2]; // Mevcut katlar

    // Kat adını döndüren fonksiyon
    const getFloorName = (floorNumber) => {
        if (floorNumber === 0) return "Zemin";
        return `Kat ${floorNumber}`;
    };

    // Masa numarasını oluşturan fonksiyon
    const getTableNumber = (floorNumber, tableIndex) => {
        if (floorNumber === 0) return `Z${tableIndex + 1}`;
        const letter = String.fromCharCode(65 + floorNumber - 1); // A, B, C, ...
        return `${letter}${tableIndex + 1}`;
    };

    // Mevcut kattaki masaları oluştur
    const tables = Array.from({ length: tableCounts[selectedFloor] }, (_, i) => ({
        id: `${selectedFloor}-${i + 1}`,
        displayNumber: getTableNumber(selectedFloor, i)
    }));

    const handleTableClick = (tableId) => {
        navigate(`/${user.role}/order/${tableId}`);
    };

    // --- TASARIM GÜNCELLEMELERİ ---

    const statusInfo = {
        // 1. Yeşil renk tonu açıldı.
        "empty": { text: "Boş", color: "#4caf50", textColor: "#fff" },
        "bos": { text: "Boş", color: "#4caf50", textColor: "#fff" },
        "occupied": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
        "dolu": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
        "reserved": { text: "Rezerve", color: "#ffc107", textColor: "#212529" },
        "reserved-future": { text: "Rezerve", color: "#4caf50", textColor: "#fff" }, // Uzak rezervasyon için yeşil
    };

    const getStatus = (tableId) => {
        const status = tableStatus[tableId] || "empty";

        if (status === 'reserved') {
            const reservation = Object.values(reservations).find(res => res.tableId === tableId);
            if (reservation) {
                const reservationTime = new Date(`${reservation.tarih}T${reservation.saat}`);
                const now = new Date();
                const oneHour = 60 * 60 * 1000;

                if (reservationTime > now && (reservationTime.getTime() - now.getTime()) > oneHour) {
                    return statusInfo["reserved-future"];
                }
            }
        }

        return statusInfo[status] || statusInfo["empty"];
    };

    // Periyodik olarak durumu yeniden render etmek için
    const [, setForceRender] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setForceRender(prev => prev + 1);
        }, 60000); // Her dakika kontrol et
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: "2rem", display: "flex", gap: "2rem", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "2rem", color: "#343a40", marginBottom: "1.5rem" }}>
                    {getFloorName(selectedFloor)} - Masa Seçimi
                </h2>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "1.5rem"
                }}>
                    {tables.map((table) => {
                        const status = getStatus(table.id);
                        const reservation = Object.values(reservations).find(res => res.tableId === table.id);
                        return (
                            <div
                                key={table.id}
                                style={{
                                    backgroundColor: status.color,
                                    color: status.textColor,
                                    // 2. Dikey boyut düşürüldü (kare yerine sabit yükseklik).
                                    height: "140px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                                onClick={() => handleTableClick(table.id)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                title={`Masa ${table.displayNumber}`}
                            >
                                <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                                    {table.displayNumber}
                                </div>
                                <div style={{ fontSize: "1rem", marginTop: "0.5rem", fontWeight: "500" }}>
                                    {status.text}
                                </div>
                                {reservation && (
                                    <div style={{
                                        fontSize: '10px',
                                        marginTop: '4px',
                                        opacity: 0.8
                                    }}>
                                        {reservation.ad} {reservation.soyad} - {reservation.saat}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ width: "150px", flexShrink: 0 }}>
                <h3 style={{ fontSize: "1.25rem", color: "#495057", marginBottom: "1rem" }}>Katlar</h3>
                {floors.map((floor) => (
                    <div
                        key={floor}
                        onClick={() => setSelectedFloor(floor)}
                        style={{
                            padding: "1rem",
                            marginBottom: "1rem",
                            borderRadius: "8px",
                            backgroundColor: selectedFloor === floor ? "#513653" : "#e9ecef",
                            color: selectedFloor === floor ? "white" : "#495057",
                            textAlign: "center",
                            cursor: "pointer",
                            fontWeight: "bold",
                            userSelect: "none",
                            transition: "background-color 0.2s ease",
                        }}
                    >
                        {getFloorName(floor)}
                    </div>
                ))}
            </div>
        </div>
    );
}
