'use client';

import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react'; // Importa los iconos
import { useAppState } from './acciones/estados';

const Encabezado = () => {
  // Extraemos el estado y las acciones del context global
  const { state, actions } = useAppState();

  return (
    <header className="h-16 bg-[var(--surface)] px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] leading-tight">
          Sistema de Movimientos
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Grupo de Desarrollo y Asuntos Especiales
        </p>
      </div>

      <div className="flex items-center gap-4">
        {state.usuario && (
          <div className="hidden sm:flex items-center gap-4 mr-2">
            <div className="flex flex-col text-right">
              <span className="text-[13px] font-bold text-[var(--text-primary)] tracking-wide">
                {state.usuario.nombre || state.usuario.username || 'USUARIO'}
              </span>
              <div className="flex justify-end mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-secondary)]">
                  {state.usuario.role === 'ADMINISTRADOR' ? (
                    <span className="text-red-600 mr-1">•</span>
                  ) : state.usuario.mesa ? (
                    <span className="text-blue-600 mr-1">•</span>
                  ) : (
                    <span className="text-gray-500 mr-1">•</span>
                  )}
                  {state.usuario.role === 'ADMINISTRADOR' ? 'ADMINISTRADOR' :
                    state.usuario.mesa ? state.usuario.mesa :
                      state.usuario.role || 'USUARIO'}
                </span>
              </div>
            </div>

            {/* Divisor vertical */}
            <div className="h-8 w-px bg-[var(--border)] hidden sm:block"></div>
          </div>
        )}

        {/* Toggle de Modo Oscuro */}
        <button
          onClick={actions.alternarModoOscuro}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-alt)] transition-colors"
          title={state.modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {state.modoOscuro ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={async () => {
            try {
              await fetch('/api/auth/logout', { method: 'POST' });
            } catch (e) {
              console.error(e);
            }
            actions.logout();
          }}
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Encabezado;