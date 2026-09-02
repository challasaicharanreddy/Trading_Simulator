import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "./context/AuthContext";
import { setupInterceptors } from "./api/axiosInstance";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import StockPage from "./pages/Stockpage";
import PortfolioPage from "./pages/Portfolio";
import Dashboard from "./pages/Dashboard/Dashboard";
import OrderEngine from "./pages/OrderEngine";
import Transactions from "./pages/Transactions";
import "./App.css";

function App() {
  // const { accessToken, refreshAccessToken, logout } = useAuth();

  // useEffect(() => {
  //   setupInterceptors(
  //     () => accessToken,
  //     refreshAccessToken,
  //     () => logout()
  //   );
  // }, [accessToken]);

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
        <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />
        
       <Route
        path="/dashboard"
        element={
            <ProtectedRoute>
            <Dashboard />
            </ProtectedRoute>
        }
      />

      <Route path="/order-engine" 
      element={
        <ProtectedRoute>
          <OrderEngine />
        </ProtectedRoute>
      } />
      <Route
        path="/transactions"
        element={
            <ProtectedRoute>
            <Transactions />
            </ProtectedRoute>
        }
      />

      <Route path="/stocks/:symbol" element={
        <ProtectedRoute>
        <StockPage/>
        </ProtectedRoute>
      } />

      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      <Route path="/portfolio" element={
        <ProtectedRoute>
        <PortfolioPage />
        </ProtectedRoute>
      } />

    </Routes>
  );
}

export default App;