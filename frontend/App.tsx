import React from 'react';
import ClientManagementScreen from './components/ClientManagementScreen';
import { Header } from './components/common/Header';
import { LoginScreen } from './components/LoginScreen';
import { useAuth } from './components/auth/AuthContext';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import CreateUser from './pages/createuser';

const MainApp = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#244f43] text-[#b2e1d8] font-sans">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<ClientManagementScreen user={user} />} />
            <Route path="/createuser" element={<CreateUser />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default function App() {
  return <MainApp />;
}
