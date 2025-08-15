// src/utils/tableUtils.js

// Masa numarasını al
export function getTableNumber(floorNumber, tableIndex) {
    const floorPrefix = floorNumber === 0 ? "Z" : String.fromCharCode(65 + floorNumber - 1);
    return `${floorPrefix}${tableIndex + 1}`;
}

// Table ID'yi masa numarasına çevir (örn: "1" -> "Z1", "9" -> "A1")
export function getTableNameFromId(tableId) {
    if (!tableId || typeof tableId !== 'string') return tableId;
    const id = parseInt(tableId);
    if (id <= 8) {
        return `Z${id}`;
    } else if (id <= 16) {
        return `A${id - 8}`;
    } else if (id <= 24) {
        return `B${id - 16}`;
    }
    return tableId;
}
