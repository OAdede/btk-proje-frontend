import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext";

export default function TablesGridPage() {
    const navigate = useNavigate();
    const { tableStatus, updateTableStatus, reservations, tables } = useContext(TableContext);
    const { user } = useContext(AuthContext);
    const [selectedFloor, setSelectedFloor] = useState(1);


    const tables = Array.from({ length: 8 }, (_, i) => `${selectedFloor}-${i + 1}`);

    const statusInfo = {
        "empty": { text: "Boş", color: "#4caf50", textColor: "#fff" },
        "bos": { text: "Boş", color: "#4caf50", textColor: "#fff" },
        "occupied": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
        "dolu": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
        "reserved": { text: "Rezerve", color: "#ffc107", textColor: "#212529" },
        "reserved-future": { text: "Rezerve", color: "#4caf50", textColor: "#fff" },
        "reserved-special": { text: "Özel Rezerve", color: "#ffc107", textColor: "#212529" },
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

                // Rezervasyon geçmiş mi kontrol et
                if (reservationTime < now) {
                    // Rezervasyon geçmiş, masayı boş yap
                    console.log(`Reservation for table ${tableId} has passed, marking as empty`);
                    updateTableStatus(tableId, 'empty');
                    return statusInfo["empty"];
                }

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
            } else {
                // Rezervasyon bulunamadı ama masa hala reserved olarak işaretli
                console.log(`No reservation found for table ${tableId}, marking as empty`);
                updateTableStatus(tableId, 'empty');
                return statusInfo["empty"];
            }
        }

        return statusInfo[status] || statusInfo["empty"];
    };

    // Calculate occupancy using current table status as a proxy
    const getTableOccupancy = (tableId) => {
        const backendTable = tables?.find(t => String(t?.tableNumber ?? t?.id) === String(tableId));
        if (!backendTable) return null;
        const capacity = backendTable?.capacity || 4;
        const statusName = String(
            backendTable?.status?.name ?? backendTable?.statusName ?? backendTable?.status_name ?? ''
        ).toLowerCase();
        let rate = 0;
        if (statusName === 'occupied') rate = 100;
        else if (statusName === 'reserved') rate = 60;
        else rate = 0;
        return { rate, people: null, capacity };
    };



    const handleTableClick = (tableId) => {
        const status = tableStatus[tableId] || "empty";
        const role = (user?.role) || 'staff';
        if (status === "occupied") {
            navigate(`/${role}/summary/${tableId}`);
        } else {
            navigate(`/${role}/order/${tableId}`);
        }
    }

    return (
        <div style={{ padding: "2rem", display: "flex", gap: "2rem", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "2rem", color: "#343a40", marginBottom: "1.5rem" }}>
                    Kat {selectedFloor} - Masa Seçimi
                </h2>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "1.5rem"
                }}>
                    {tables.map((tableId) => {
                        const status = getStatus(tableId);
                        const occupancy = getTableOccupancy(tableId);
                        return (
                            <div
                                key={tableId}
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
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    position: "relative",
                                }}
                                onClick={() => handleTableClick(tableId)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                title={`Masa ${tableId}`}
                            >
                                {/* Occupancy Indicator */}
                                {occupancy && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'rgba(0, 0, 0, 0.7)',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            zIndex: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '2px'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: occupancy.rate >= 80 ? '#ff4444' : 
                                                               occupancy.rate >= 60 ? '#ffaa00' : '#44ff44'
                                            }}
                                        />
                                        {Math.round(occupancy.rate)}%
                                    </div>
                                )}
                                <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                                    {tableId.split("-")[1]}
                                </div>
                                <div style={{ fontSize: "1rem", marginTop: "0.5rem", fontWeight: "500" }}>
                                    {status.text}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ width: "150px", flexShrink: 0 }}>
                <h3 style={{ fontSize: "1.25rem", color: "#495057", marginBottom: "1rem" }}>Katlar</h3>
                {[1, 2].map((floor) => (
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
                        Kat {floor}
                    </div>
                ))}
            </div>
        </div>
    );
}
