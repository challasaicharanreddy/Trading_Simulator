import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
      setUser(response.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email, password) {
    await axios.post(`${API_URL}/auth/login`, { email, password }, { withCredentials: true });
    await checkAuth();
  }

  async function register(username, email, password) {
    return axios.post(`${API_URL}/auth/register`, { username, email, password }, { withCredentials: true });
  }

  async function logout() {
    await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}