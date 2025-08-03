import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WaiterHome from "./pages/WaiterHome";
import OrderPage from "./pages/OrderPage";
import SummaryPage from "./pages/SummaryPage";
import { TableProvider } from "./context/TableContext";

function App() {
  return (
    <TableProvider>
      <Router>
        <Routes>
          <Route path="/" element={<WaiterHome />} />
          <Route path="/order/:tableId" element={<OrderPage />} />
          <Route path="/summary/:tableId" element={<SummaryPage />} />
        </Routes>
      </Router>
    </TableProvider>
  );
}

export default App;
