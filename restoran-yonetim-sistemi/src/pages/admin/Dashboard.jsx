import React, { useContext } from "react";
import { TableContext } from "../../context/TableContext";
import "./Dashboard.css";

const statusColors = {
  "empty": "#4caf50", // Yeşil - Boş
  "occupied": "#f44336", // Kırmızı - Dolu
  "reserved": "#ffeb3b" // Sarı - Rezerve
};

const statusTextColor = {
  "empty": "#fff",
  "occupied": "#fff",
  "reserved": "#222"
};

const statusText = {
  "empty": "Boş",
  "occupied": "Dolu",
  "reserved": "Rezerve"
};

const Dashboard = () => {
  const { tableStatus, orders } = useContext(TableContext);

  // 1. Kat masaları (1-1'den 1-8'e kadar)
  const kat1Tables = Array.from({ length: 8 }, (_, i) => {
    const tableId = `1-${i + 1}`;
    const status = tableStatus[tableId] || 'empty';
    const hasOrder = orders[tableId] && Object.keys(orders[tableId]).length > 0;
    
    return {
      id: tableId,
      name: `${i + 1}`,
      status: hasOrder ? 'occupied' : status,
      orderCount: hasOrder ? Object.keys(orders[tableId]).length : 0
    };
  });

  // 2. Kat masaları (2-1'den 2-8'e kadar)
  const kat2Tables = Array.from({ length: 8 }, (_, i) => {
    const tableId = `2-${i + 1}`;
    const status = tableStatus[tableId] || 'empty';
    const hasOrder = orders[tableId] && Object.keys(orders[tableId]).length > 0;
    
    return {
      id: tableId,
      name: `${i + 9}`,
      status: hasOrder ? 'occupied' : status,
      orderCount: hasOrder ? Object.keys(orders[tableId]).length : 0
    };
  });

  // İstatistikler
  const totalTables = kat1Tables.length + kat2Tables.length;
  const occupiedTables = [...kat1Tables, ...kat2Tables].filter(table => table.status === 'occupied').length;
  const emptyTables = [...kat1Tables, ...kat2Tables].filter(table => table.status === 'empty').length;
  const reservedTables = [...kat1Tables, ...kat2Tables].filter(table => table.status === 'reserved').length;

  return (
    <div className="home-page">
      <h1>Hoşgeldiniz, Admin!</h1>
      
      {/* İstatistikler */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{
          background: '#4caf50',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '10px',
          textAlign: 'center',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{emptyTables}</div>
          <div style={{ fontSize: '14px' }}>Boş Masa</div>
        </div>
        
        <div style={{
          background: '#f44336',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '10px',
          textAlign: 'center',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{occupiedTables}</div>
          <div style={{ fontSize: '14px' }}>Dolu Masa</div>
        </div>
        
        <div style={{
          background: '#ffeb3b',
          color: '#222',
          padding: '15px 25px',
          borderRadius: '10px',
          textAlign: 'center',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{reservedTables}</div>
          <div style={{ fontSize: '14px' }}>Rezerve</div>
        </div>
        
        <div style={{
          background: '#2196f3',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '10px',
          textAlign: 'center',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalTables}</div>
          <div style={{ fontSize: '14px' }}>Toplam Masa</div>
        </div>
      </div>

      <div className="katlar-wrapper">
        <div className="kat">
          <h2>1. Kat</h2>
          <div className="tables-list-home">
            {kat1Tables.map((table) => (
              <div
                key={table.id}
                className="table-card-home"
                style={{
                  background: statusColors[table.status],
                  color: statusTextColor[table.status],
                  position: 'relative'
                }}
              >
                <div className="table-number-home">{table.name}</div>
                <div className="table-status-home">
                  {statusText[table.status]}
                  {table.orderCount > 0 && (
                    <span style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      marginLeft: '8px'
                    }}>
                      {table.orderCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="kat">
          <h2>2. Kat</h2>
          <div className="tables-list-home">
            {kat2Tables.map((table) => (
              <div
                key={table.id}
                className="table-card-home"
                style={{
                  background: statusColors[table.status],
                  color: statusTextColor[table.status],
                  position: 'relative'
                }}
              >
                <div className="table-number-home">{table.name}</div>
                <div className="table-status-home">
                  {statusText[table.status]}
                  {table.orderCount > 0 && (
                    <span style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      marginLeft: '8px'
                    }}>
                      {table.orderCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
