
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("linklite-user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("linklite-token");

    if (!token) {
      setUser(null);
      localStorage.removeItem("linklite-user");
    }

    setLoading(false);
  }, []);

  async function login(credentials) {
    const data = await authService.login(credentials);

    localStorage.setItem("linklite-token", data.accessToken);

    const userData = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    };

    localStorage.setItem(
      "linklite-user",
      JSON.stringify(userData)
    );

    setUser(userData);

    return data;
  }

  async function register(userData) {
    return await authService.register(userData);
  }

  function logout() {
    localStorage.removeItem("linklite-token");
    localStorage.removeItem("linklite-user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
