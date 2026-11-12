import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountPage from "./pages/AccountPage";
import LeasePage from "./pages/LeasePage";
import LeasesPage from "./pages/LeasesPage";
import LoginPage from "./pages/LoginPage";
import PropertiesPage from "./pages/PropertiesPage";

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route path="/" element={<PropertiesPage />} />
      <Route path="/leases" element={<LeasesPage />} />
      <Route path="/leases/:id" element={<LeasePage />} />
      <Route path="/account" element={<AccountPage />} />
    </Route>
  </Routes>;
}
