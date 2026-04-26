import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/lib/axios";

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  avatar?: string;
}

interface AuthCtx {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  settings: {
    site: {
      name: string;
      logo: string | null;
      favicon: string | null;
      tagline?: string;
    };
  } | null;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("apex-user");
      if (!saved || saved === "undefined") return null;
      return JSON.parse(saved);
    } catch (error) {
      console.error("Error parsing saved user", error);
      return null;
    }
  });
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/settings/site");
      setSettings({ site: data.data });
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("apex-token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      // Backend returns { status: 'success', data: { ...user } }
      setUser(data.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
      localStorage.removeItem("apex-token");
      localStorage.removeItem("apex-user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchSettings();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    // Backend returns { status: 'success', data: { access_token, user } }
    const { access_token, user: userData } = data.data;

    localStorage.setItem("apex-token", access_token);
    localStorage.setItem("apex-user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("apex-token");
      localStorage.removeItem("apex-user");
      setUser(null);
    }
  };

  const hasRole = (role: string) => {
    if (user?.roles.includes("Super Admin")) return true;
    return user?.roles.includes(role) ?? false;
  };

  const hasPermission = (permission: string) => {
    if (user?.roles.includes("Super Admin")) return true;
    return user?.permissions.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      hasRole, 
      hasPermission,
      settings,
      refreshSettings: fetchSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
