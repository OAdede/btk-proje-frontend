import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import TablesPage from "./pages/TablesPage";
import ProductsPage from "./pages/ProductsPage";
import ReservationsPage from "./pages/ReservationsPage";
import ReportsPage from "./pages/ReportsPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tables" element={<TablesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
