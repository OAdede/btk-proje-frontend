import React from "react";
import AdminStyleTables from "../../components/tables/AdminStyleTables";

export default function WaiterHome() {
    // Reuse unified admin-style tables grid for staff
    return <AdminStyleTables roleOverride="garson" />;
}
