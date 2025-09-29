import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("/auth/me");

      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        if (accessToken) {
          localStorage.setItem("token", accessToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        }
        setUser(user);
        navigate("/");
        return { success: true };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post("/auth/register", { name, email, password });

      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        if (accessToken) {
          localStorage.setItem("token", accessToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        }
        setUser(user);
        navigate("/");
        return { success: true };
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      navigate("/login");
    }
  };

  const isAdmin = () => {
    return user && ["ADMIN", "SUPERADMIN"].includes(user.role);
  };

  const isSuperAdmin = () => {
    return user && user.role === "SUPERADMIN";
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isSuperAdmin,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
