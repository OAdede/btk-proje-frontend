import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function WaiterHome() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { tableStatus, reservations } = useContext(TableContext);
    const { isDarkMode } = useTheme();
    const [selectedFloor, setSelectedFloor] = useState(0);
    const [tableCounts, setTableCounts] = useState({ 0: 8, 1: 8, 2: 8 });
    const floors = [0, 1, 2];

    const getFloorName = (floorNumber) => {
        if (floorNumber === 0) return "Zemin";
        return `Kat ${floorNumber}`;
    };

    const getTableNumber = (floorNumber, tableIndex) => {
        if (floorNumber === 0) return `Z${tableIndex + 1}`;
        const letter = String.fromCharCode(65 + floorNumber - 1);
        return `${letter}${tableIndex + 1}`;
    };

    const tables = Array.from({ length: tableCounts[selectedFloor] }, (_, i) => ({
        id: `${selectedFloor}-${i + 1}`,
        displayNumber: getTableNumber(selectedFloor, i)
    }));

    const handleTableClick = (tableId) => {
        navigate(`/${user.role}/order/${tableId}`);
    };

    const statusInfo = {
        "empty": { text: "Boş", color: "var(--success)", textColor: "#fff" },
        "bos": { text: "Boş", color: "var(--success)", textColor: "#fff" },
        "occupied": { text: "Dolu", color: "var(--danger)", textColor: "#fff" },
        "dolu": { text: "Dolu", color: "var(--danger)", textColor: "#fff" },
        "reserved": { text: "Rezerve", color: "var(--warning)", textColor: "#212529" },
        "reserved-future": { text: "Rezerve", color: "var(--success)", textColor: "#fff" },
        "reserved-special": { text: "Özel Rezerve", color: "var(--warning)", textColor: "#212529" },
    };

    const getStatus = (tableId) => {
        const status = tableStatus[tableId] || "empty";

        if (status === 'reserved') {
            const reservation = Object.values(reservations).find(res => res.tableId === tableId);
            if (reservation) {
                const reservationTime = new Date(`${reservation.tarih}T${reservation.saat}`);
                const now = new Date();
                const oneHour = 60 * 60 * 1000;
                const fiftyNineMinutes = 59 * 60 * 1000;

                // Özel rezervasyon kontrolü
                if (reservation.specialReservation) {
                    if (reservationTime > now && (reservationTime.getTime() - now.getTime()) <= fiftyNineMinutes) {
                        return statusInfo["reserved-special"]; // 59 dakika içinde sarı
                    } else if (reservationTime > now && (reservationTime.getTime() - now.getTime()) > oneHour) {
                        return statusInfo["reserved-future"]; // 1 saatten uzak yeşil
                    }
                } else {
                    // Normal rezervasyon kontrolü
                    if (reservationTime > now && (reservationTime.getTime() - now.getTime()) > oneHour) {
                        return statusInfo["reserved-future"];
                    }
                }
            }
        }

        return statusInfo[status] || statusInfo["empty"];
    };

    const [, setForceRender] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setForceRender(prev => prev + 1);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ 
            padding: "2rem", 
            display: "flex", 
            gap: "2rem", 
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: "var(--background)",
            color: "var(--text)",
            minHeight: "100vh"
        }}>
            <div style={{ flex: 1 }}>
                <h2 style={{ 
                    fontSize: "2rem", 
                    color: "var(--text)", 
                    marginBottom: "1.5rem" 
                }}>
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
                                key={table.id || crypto.randomUUID()}
                                style={{
                                    backgroundColor: status.color,
                                    color: status.textColor,
                                    height: "140px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    boxShadow: "0 4px 12px var(--shadow)",
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
                <h3 style={{ 
                    fontSize: "1.25rem", 
                    color: "var(--text)", 
                    marginBottom: "1rem" 
                }}>Katlar</h3>
                {floors.map((floor) => (
                    <div
                        key={floor}
                        onClick={() => setSelectedFloor(floor)}
                        style={{
                            padding: "1rem",
                            marginBottom: "1rem",
                            borderRadius: "8px",
                            backgroundColor: selectedFloor === floor ? "var(--primary)" : "var(--surface)",
                            color: selectedFloor === floor ? "white" : "var(--text)",
                            textAlign: "center",
                            cursor: "pointer",
                            fontWeight: "bold",
                            userSelect: "none",
                            transition: "background-color 0.2s ease",
                            border: `1px solid var(--border)`,
                        }}
                    >
                        {getFloorName(floor)}
                    </div>
                ))}
            </div>
        </div>
    );
}
