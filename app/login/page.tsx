'use client'
import { useState } from 'react';
import { Shield, Lock, User, AlertCircle, Gift } from 'lucide-react';

interface PropiedadesPantallaLogin {
  alIngresar: (userData: any) => void;
}

const Login = ({ alIngresar }: PropiedadesPantallaLogin) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usuario || !contrasena) {
      setError('Por favor, ingrese usuario y contraseña');
      return;
    }

    setCargando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas');
        setCargando(false);
        return;
      }

      // Login exitoso
      alIngresar(data.user);
    } catch (err) {
      setError('Error al conectar con el servidor');
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">

        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-4 shadow-lg overflow-hidden">
            <video src="..//s.mp4" width={84} height={84} autoPlay loop muted className="object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Sistema de Movimientos
          </h1>
          <p className="text-slate-600">
            Secretaría de la Defensa Nacional
          </p>
        </div>

        {/* Contenedor principal (Reemplaza a Card) */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-1">
            <h2 className="text-2xl font-semibold text-center text-slate-800">Acceso al Sistema</h2>
            <p className="text-center text-sm text-slate-500">
              Ingrese sus credenciales
            </p>
          </div>

          <div className="p-6 pt-0">
            <form onSubmit={manejarEnvio} className="space-y-4">

              {/* Alerta de error (Reemplaza a Alert) */}
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg animate-in fade-in zoom-in duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Usuario */}
              <div className="space-y-2">
                <label htmlFor="usuario" className="text-sm font-medium text-slate-700 block">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="usuario"
                    type="text"
                    placeholder="Ingrese su usuario"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    disabled={cargando}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label htmlFor="contrasena" className="text-sm font-medium text-slate-700 block">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="contrasena"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    disabled={cargando}
                  />
                </div>
              </div>

              {/* Botón de login */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={cargando}
              >
                {cargando ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Ingresando...
                  </span>
                ) : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login