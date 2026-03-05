'use client';
import { useState } from 'react';
import UsuariosSettings from "./UsuariosSettings";

export default function Page() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    setMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Todos los campos son obligatorios' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'La nueva contraseña y la confirmación no coinciden' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar la contraseña');
      }

      setMessage({ type: 'success', text: '¡Contraseña actualizada correctamente!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Configuración</h1>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full max-w-2xl flex flex-col gap-6">
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-8">
              <h2 className="text-[var(--text-secondary)] text-xl font-semibold mb-2">Tema del Sistema</h2>
              <p className="text-[var(--text-secondary)] mb-6">Personaliza la apariencia del sistema.</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[var(--text-secondary)] font-medium mb-2">Cambio de colores</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => (document.body.className = '')}
                      className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white rounded-lg text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
                    >
                      Color institucional
                    </button>
                    <button
                      type="button"
                      onClick={() => (document.body.className = 'theme-green')}
                      className="px-4 py-2 rounded-lg border-2 border-green-500 bg-green-50 text-black font-medium hover:bg-green-100"
                    >
                      Verde
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-8">
                <h2 className="text-[var(--text-secondary)] text-xl font-semibold mb-2">Cambio de Contraseña</h2>

                {message.text && (
                  <div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                  </div>
                )}

                <div className="p-3 text-[var(--text-secondary)] flex flex-col">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Contraseña actual:</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 w-full max-w-md px-3 mt-1 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Introduce tu contraseña actual"
                  />
                </div>

                <div className="p-3 text-[var(--text-secondary)] flex flex-col">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Nueva Contraseña:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 w-full max-w-md px-3 mt-1 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="p-3 text-[var(--text-secondary)] flex flex-col">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Confirmar Contraseña:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 w-full max-w-md px-3 mt-1 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>

                <div className="mt-4 px-3">
                  <button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 ${loading ? 'bg-blue-300' : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'} text-white rounded-lg text-sm font-bold transition-colors shadow-sm`}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className='flex-[1.5] w-full'>
            <UsuariosSettings />
          </div>

        </div>
      </div>
    </>
  );
}