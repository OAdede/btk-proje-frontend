import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext";

export default function TablesGridPage() {
    const navigate = useNavigate();
    const { tableStatus, updateTableStatus, reservations, tables } = useContext(TableContext);
    const { user } = useContext(AuthContext);
    const [selectedFloor, setSelectedFloor] = useState(1);


    const gridTableIds = Array.from({ length: 8 }, (_, i) => `${selectedFloor}-${i + 1}`);

    const statusInfo = {
        "empty": { text: "Boş", color: "#4caf50", textColor: "#fff" },
        "bos": { text: "Boş", color: "#4caf50", textColor: "#fff" },
        "occupied": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
        "dolu": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
        "reserved": { text: "Rezerve", color: "#ffc107", textColor: "#fff" },
        "reserved-future": { text: "Rezerve", color: "#4caf50", textColor: "#fff" },
        "reserved-special": { text: "Özel Rezerve", color: "#ffc107", textColor: "#fff" },
    };

    // gridId format: "<floor>-<index>" (e.g., "1-3"). Map to gerçek tableNumber: (floor-1)*8 + index
    const gridIdToTableNumber = (gridId) => {
        try {
            const [floorStr, idxStr] = String(gridId).split("-");
            const floor = parseInt(floorStr, 10);
            const idx = parseInt(idxStr, 10);
            if (!Number.isFinite(floor) || !Number.isFinite(idx)) return null;
            return (floor - 1) * 8 + idx;
        } catch {
            return null;
        }
    };

    const getStatus = (gridId) => {
        const realTableNumber = gridIdToTableNumber(gridId);
        const statusKey = realTableNumber != null ? realTableNumber : gridId;
        const status = tableStatus[statusKey] || "empty";

        if (status === 'reserved') {
            const reservation = Object.values(reservations).find(res => {
                // reservations'daki tableId backend ID; eşleşen table'ı bul ve tableNumber ile karşılaştır
                const backendTable = tables?.find(t => String(t?.id) === String(res.tableId));
                const tableNumber = backendTable?.tableNumber;
                return String(tableNumber) === String(statusKey) || String(res.tableId) === String(statusKey);
            });
            if (reservation) {
                const reservationTime = new Date(`${reservation.tarih}T${reservation.saat}`);
                const now = new Date();
                const oneHour = 60 * 60 * 1000;
                const fiftyNineMinutes = 59 * 60 * 1000;
                const twentyFourHours = 24 * 60 * 60 * 1000;

                // Rezervasyon geçmiş mi kontrol et
                if (reservationTime < now) {
                    // Rezervasyon geçmiş, masayı boş yap
                    console.log(`Reservation for table ${tableId} has passed, marking as empty`);
                    updateTableStatus(tableId, 'empty');
                    return statusInfo["empty"];
                }

                // Özel rezervasyon kontrolü
                const delta = reservationTime.getTime() - now.getTime();
                if (reservation.specialReservation) {
                    if (reservationTime > now && delta <= fiftyNineMinutes) {
                        return statusInfo["reserved-special"]; // 59 dakika içinde sarı
                    }
                    if (reservationTime > now && delta <= twentyFourHours) {
                        return statusInfo["reserved"]; // 24 saat içinde sarı
                    }
                    if (reservationTime > now && delta > twentyFourHours) {
                        return statusInfo["reserved-future"]; // 24 saatten uzak yeşil
                    }
                } else {
                    // Normal rezervasyon kontrolü
                    if (reservationTime > now && delta <= twentyFourHours) {
                        return statusInfo["reserved"]; // 24 saat içinde sarı
                    }
                    if (reservationTime > now && delta > twentyFourHours) {
                        return statusInfo["reserved-future"]; // 24 saatten uzak yeşil
                    }
                }
            } else {
                // Rezervasyon bulunamadı ama masa hala reserved olarak işaretli
                console.log(`No reservation found for table ${statusKey}, marking as empty`);
                if (statusKey != null) updateTableStatus(statusKey, 'empty');
                return statusInfo["empty"];
            }
        }

        return statusInfo[status] || statusInfo["empty"];
    };

    // Calculate occupancy using current table status as a proxy
    const getTableOccupancy = (gridId) => {
        const realTableNumber = gridIdToTableNumber(gridId);
        const backendTable = tables?.find(t => String(t?.tableNumber ?? t?.id) === String(realTableNumber));
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
                    {gridTableIds.map((tableId) => {
                        const status = getStatus(tableId);
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
                                <div style={{ fontSize: "2.5rem", fontWeight: "500" }}>
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
