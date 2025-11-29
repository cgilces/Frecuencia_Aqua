import React, { useState } from 'react';
import { Spinner } from './common/Spinner';
import { Card } from './common/Card';
import { useAuth } from './auth/AuthContext';
import { AquaLogo } from './common/Icons';
import Input from './elements/Input';
import Button from './elements/Button';

export const LoginScreen: React.FC = () => {
    const { login, loading, error } = useAuth();
    const [usuario, setUsuario] = useState('');
    const [clave, setClave] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(usuario, clave);
        } catch (e) {
            // Error manejado en AuthContext
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#162b25] p-4">
            <Card className="w-full max-w-md p-8 bg-[#f2fcf7] border border-[#162b25]/30 text-center shadow-[0_0_20px_rgba(178,225,216,0.1)]">

                <div className="mb-8 flex flex-col items-center">
                    <div className="w-80.5 h-20.5 text-[#b2e1d8] mb-2">
                        <AquaLogo className="w-full h-full drop-shadow-[0_0_10px_rgba(178,225,216,0.3)]" />
                    </div>

                    <p className="text-[#162b25] mt-2 text-lg font-bold tracking-wide uppercase">Gestión de Rutas</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div>
                        <label className="block text-sm font-medium text-[#162b25] mb-1">Usuario</label>
                        <Input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="Ingresa tu usuario"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#162b25] mb-1">Contraseña</label>
                        <Input
                            type="password"
                            value={clave}
                            onChange={(e) => setClave(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-800 text-red-800 text-sm p-3 rounded">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#b2e1d8] hover:bg-[#9adfd3] disabled:opacity-70 text-[#19322f] border-[#162b25] border font-bold py-3 rounded-lg transition-colors flex justify-center items-center shadow-lg uppercase tracking-wider text-sm"
                    >
                        {loading ? <Spinner /> : 'Iniciar Sesión'}
                    </Button>
                </form>

                <div className="mt-8 text-xs text-[#162b25]">
                    <p>DESARROLLADO POR DPTO SISTEMAS - GRUPO AQUA S.A.</p>
                </div>
            </Card>
        </div>
    );
};
