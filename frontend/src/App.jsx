import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { setupInterceptors } from "./api/axiosInstance";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import StockPage from "./pages/Stockpage";
import "./App.css";

function App() {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  useEffect(() => {
    setupInterceptors(
      () => accessToken,
      refreshAccessToken,
      () => logout()
    );
  }, [accessToken]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/stock/:symbol" element={<StockPage/>} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
    </Routes>
  );
}

export default App;