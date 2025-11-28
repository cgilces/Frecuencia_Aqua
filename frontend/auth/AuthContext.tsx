import React, { createContext, useContext, useState } from "react";

interface User {
  id: string;
  usuario: string;
  rol: string;
  rutas_asignadas: string[];
  creado_en: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (usuario: string, clave: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (usuario: string, clave: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, clave }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      // 🔥 NORMALIZACIÓN DE DATOS DEL BACKEND
      setUser({
        id: data.user.id,
        usuario: data.user.usuario,
        rol: data.user.rol,
        rutas_asignadas: data.user.rutas_asignadas || data.user.assigned_routes || [],
        creado_en: data.user.creado_en
      });

    } catch (error) {
      setError("No se pudo conectar con el servidor");
    }

    setLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
