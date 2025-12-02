import React from 'react';
import ClientManagementScreen from './components/ClientManagementScreen';
import { Header } from './components/common/Header';
import { LoginScreen } from './components/LoginScreen';
import { useAuth } from './components/auth/AuthContext';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import CreateUser from './pages/createuser';

// Componente de ruta protegida para ADMIN

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const rol = user?.role;

  console.log("ProtectedAdminRoute - User:", user);
  console.log("ProtectedAdminRoute - Rol:", rol);

  if (rol !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const MainApp = () => {
  const { user } = useAuth();
  const rol = user?.role;

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#ffffff] text-[#b2e1d8] font-sans">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<ClientManagementScreen user={user} />} />
            <Route
              path="/createuser"
              element={
                <ProtectedAdminRoute>
                  <CreateUser />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default function App() {
  return <MainApp />;
}
