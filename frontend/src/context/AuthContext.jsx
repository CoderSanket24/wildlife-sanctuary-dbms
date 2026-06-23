import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // null = not loaded yet
  const [loading, setLoading] = useState(true);  // true while fetching /me

  // Hydrate user from session cookie on first load
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        setUser(undefined); // undefined = confirmed unauthenticated
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  // Call after a successful login response — avoids a second /me round-trip
  const loginUser = (userData) => {
    setUser(userData);
  };

  // Call to clear user state and send logout request
  const logoutUser = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — we still clear client-side state
    } finally {
      setUser(undefined);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Convenience hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
