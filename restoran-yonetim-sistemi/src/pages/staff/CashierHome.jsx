import React from "react";
import AdminStyleTables from "../../components/tables/AdminStyleTables";

export default function CashierHome() {
    // Reuse unified admin-style tables grid for cashier
    return <AdminStyleTables roleOverride="kasiyer" />;
}
