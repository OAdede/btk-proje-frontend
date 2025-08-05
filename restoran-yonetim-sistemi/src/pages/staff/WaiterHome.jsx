import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext.jsx";

export default function WaiterHome() {
    // Yeni state'leri buraya ekledik
    const { tableStatus, products, orders, dailyOrderCount, monthlyOrderCount, yearlyOrderCount } = useContext(TableContext);
    const navigate = useNavigate();
    const [selectedFloor, setSelectedFloor] = useState(1);
    const [openSidebar, setOpenSidebar] = useState(false);
    const [currentView, setCurrentView] = useState("tables");

    const tables = Array.from({ length: 8 }, (_, i) => `${selectedFloor}-${i + 1}`);

    const getColor = (status) => {
        switch (status) {
            case "empty":
                return "#8BC34A";
            case "occupied":
                return "#F44336";
            case "reserved":
                return "#FFEB3B";
            default:
                return "#8BC34A";
        }
    };

    const renderSidebarContent = () => {
        if (currentView === "past_orders") {
            const completedOrders = Object.entries(orders).filter(([tableId, tableOrder]) => {
                const totalTablePrice = Object.values(tableOrder).reduce(
                    (sum, item) => sum + item.price * item.count,
                    0
                );
                return totalTablePrice > 0;
            });

            return (
                <>
                    <h2>Geçmiş Siparişler</h2>
                    {completedOrders.length === 0 ? (
                        <p>Henüz tamamlanmış bir sipariş yok.</p>
                    ) : (
                        <div style={{ display: "grid", gap: 20 }}>
                            {completedOrders.map(([tableId, tableOrder]) => {
                                const totalTablePrice = Object.values(tableOrder).reduce(
                                    (sum, item) => sum + item.price * item.count,
                                    0
                                );
                                return (
                                    <div key={tableId} style={{ border: "1px solid #ccc", padding: 15, borderRadius: 8 }}>
                                        <h4>Masa {tableId} SipariÅŸleri</h4>
                                        <ul>
                                            {Object.entries(tableOrder).map(([itemId, item]) => (
                                                <li key={itemId}>
                                                    {item.name} x {item.count} = {item.count * item.price} ₺

                                                </li>
                                            ))}
                                        </ul>
                                        <p style={{ fontWeight: "bold", marginTop: 5 }}>
                                            Toplam: {totalTablePrice} ₺

                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            );
        } else if (currentView === "order_report") {
            return (
                <div style={{ padding: 20, color: "black" }}>
                    <h2>Sipariş Raporu</h2>
                    <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px", marginBottom: "10px" }}>
                        <p style={{ fontWeight: "bold" }}>Günlük sipariş sayfası:</p>
                        <p style={{ fontSize: "1.5rem" }}>{dailyOrderCount}</p>
                    </div>
                    <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px", marginBottom: "10px" }}>
                        <p style={{ fontWeight: "bold" }}>Aylık sipariş sayfası:</p>
                        <p style={{ fontSize: "1.5rem" }}>{monthlyOrderCount}</p>
                    </div>
                    <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px", marginBottom: "10px" }}>
                        <p style={{ fontWeight: "bold" }}>Yıllık sipariş sayfası:</p>
                        <p style={{ fontSize: "1.5rem" }}>{yearlyOrderCount}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderMainContent = () => {
        if (currentView === "stock_management") {
            return (
                <div style={{ padding: 30, color: "black" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <h2>Stok Yönetimi</h2>
                        <button
                            onClick={() => setCurrentView("tables")}
                            style={{
                                padding: "10px 20px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "#6c757d",
                                color: "white",
                                cursor: "pointer",
                            }}
                        >
                            Geri
                        </button>
                    </div>
                    {Object.keys(products).map(category => (
                        <div key={category} style={{ marginBottom: 20 }}>
                            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: 20,
                                }}
                            >
                                {products[category].map(product => (
                                    <div
                                        key={product.id}
                                        style={{
                                            border: "1px solid #ccc",
                                            borderRadius: 10,
                                            padding: 15,
                                            backgroundColor: "#f9f9f9",
                                            textAlign: "left",
                                        }}
                                    >
                                        <h4>{product.name}</h4>
                                        <p>Fiyat: {product.price} ₺</p>

                                        <p>Stok: {product.stock} adet</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div style={{ padding: "2rem", display: "flex", gap: "2rem" }}>
                <div style={{ flexGrow: 1, marginLeft: openSidebar ? "370px" : "40px", transition: "margin-left 0.5s" }}>
                    <h2>Kat {selectedFloor} - Masa Seçimi</h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                        {tables.map((tableId) => (
                            <div
                                key={tableId}
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    backgroundColor: getColor(tableStatus[tableId] || "empty"),
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: "24px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    border: "2px solid #333",
                                    userSelect: "none",
                                }}
                                onClick={() => navigate(`/order/${tableId}`)}
                                title={`Masa ${tableId}`}
                            >
                                {tableId.split("-")[1]}
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ width: "120px" }}>
                    <h3>Katlar</h3>
                    {[1, 2].map((floor) => (
                        <div
                            key={floor}
                            onClick={() => setSelectedFloor(floor)}
                            style={{
                                padding: "1rem",
                                marginBottom: "1rem",
                                borderRadius: "8px",
                                backgroundColor: selectedFloor === floor ? "#2196F3" : "#e0e0e0",
                                color: selectedFloor === floor ? "white" : "black",
                                textAlign: "center",
                                cursor: "pointer",
                                fontWeight: "bold",
                                userSelect: "none",
                            }}
                        >
                            Kat {floor}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ position: "relative", minHeight: "100vh" }}>
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: openSidebar ? "350px" : "0",
                    backgroundColor: "white",
                    overflowX: "hidden",
                    transition: "0.5s",
                    padding: openSidebar ? "60px 20px 20px 20px" : "0",
                    borderRight: openSidebar ? "1px solid #ccc" : "none",
                    boxShadow: openSidebar ? "4px 0 8px rgba(0,0,0,0.1)" : "none",
                    zIndex: 100,
                    color: "black",
                }}
            >
                {openSidebar && (
                    <>
                        <button
                            onClick={() => setOpenSidebar(false)}
                            style={{
                                position: "absolute",
                                top: 20,
                                right: 25,
                                fontSize: "30px",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                            }}
                        >
                            &times;
                        </button>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                            <button
                                onClick={() => {
                                    setCurrentView("stock_management");
                                    setOpenSidebar(false);
                                }}
                                style={{
                                    padding: "10px 15px",
                                    borderRadius: "5px",
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                Stok Yönetimi
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentView("past_orders");
                                }}
                                style={{
                                    padding: "10px 15px",
                                    borderRadius: "5px",
                                    backgroundColor: currentView === "past_orders" ? "#1e7e34" : "#28a745",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                Geçmiş Siparişler
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentView("order_report");
                                }}
                                style={{
                                    padding: "10px 15px",
                                    borderRadius: "5px",
                                    backgroundColor: currentView === "order_report" ? "#1e7e34" : "#28a745",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                Sipariş Raporu
                            </button>
                        </div>
                        {renderSidebarContent()}
                    </>
                )}
            </div>
            <button
                onClick={() => setOpenSidebar(!openSidebar)}
                style={{
                    position: "fixed",
                    top: 20,
                    left: 20,
                    zIndex: 101,
                    background: "none",
                    color: "black",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "24px",
                }}
            >
                ...
            </button>
            {renderMainContent()}
        </div>
    );
}