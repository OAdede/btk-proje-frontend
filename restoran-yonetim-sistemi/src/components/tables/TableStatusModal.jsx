import React from "react";

const TableStatusModal = ({ visible, onClose, onStatusChange, currentStatus }) => {
    if (!visible) return null;

    const statuses = ["boş", "dolu", "rezerve"];

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h2>Masa Durumunu Güncelle</h2>
                <div style={statusButtonsStyle}>
                    {statuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => onStatusChange(status)}
                            style={
                                status === currentStatus
                                    ? { ...buttonStyle, ...activeButtonStyle }
                                    : buttonStyle
                            }
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                <button onClick={onClose} style={{ ...buttonStyle, ...cancelButtonStyle }}>
                    Kapat
                </button>
            </div>
        </div>
    );
};

const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
};

const modalStyle = {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    zIndex: 1001,
    width: "300px",
    textAlign: "center"
};

const statusButtonsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px"
}

const buttonStyle = {
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.2s"
}

const activeButtonStyle = {
    backgroundColor: "#1976d2",
    color: "white"
}

const cancelButtonStyle = {
    backgroundColor: "#f44336",
    color: "white"
}

export default TableStatusModal;
