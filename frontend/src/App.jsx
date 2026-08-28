import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "./context/AuthContext";
import { setupInterceptors } from "./api/axiosInstance";
import ProtectedRoute from "./components/ProtectedRoute";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
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
      {/* <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> */}
      <Route
        path="/dashboard"
        element={
          // <ProtectedRoute>
            <Dashboard />
          // </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;