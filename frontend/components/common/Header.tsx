
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AquaGotaparaMain } from './Icons';
import { useAuth } from '../auth/AuthContext';

export const Header: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const stored = localStorage.getItem("app_user_session");
  if (!stored) return null;

  const u = JSON.parse(stored);
  const user = u.username;
  const rol = u.role;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#162b25] shadow-md sticky top-0 z-10 border-b border-[#b2e1d8]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <AquaGotaparaMain className="w-2 h-2 text-[#b2e1d8]" />
            <h1 className="text-md font-bold text-[#b2e1d8] tracking-wide">GRUPO AQUA</h1>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 ">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive('/')
                ? 'bg-[#b2e1d8] text-[#19322f] shadow-lg'
                : 'text-[#b2e1d8] hover:bg-[#b2e1d8]/10'
                }`}
            >
              Clientes
            </Link>
            <Link
              to="/createuser"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive('/createuser')
                ? 'bg-[#b2e1d8] text-[#19322f] shadow-lg'
                : 'text-[#b2e1d8] hover:bg-[#b2e1d8]/10'
                }`}
            >
              Usuarios
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#b2e1d8]/60">v1.0.3</span>
          </div>
        </div>
      </div>

      <div className=" border-b border-[#b2e1d8]/20 px-4 py-2 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-[#b2e1d8] font-bold text-sm uppercase bg-[#b2e1d8]/10 px-2 py-0.5 rounded">{rol}</span>
          <span className="text-[#b2e1d8]/40 text-sm">|</span>
          <span className="text-white text-sm font-medium">{user}</span>
        </div>
        <button
          onClick={logout}
          className="text-sm text-red-400 hover:text-red-300 hover:underline"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>

  );
};
