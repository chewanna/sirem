'use client';

import React, { createContext, useContext, useMemo, useReducer } from 'react';

// Estado global de la aplicación
type Estado = {
  estaAutenticado: boolean;
  idPersonalSeleccionado: number | null;
  senalReinicio: number;
  modoOscuro: boolean;
  usuario: {
    id: number;
    username: string;
    role: string;
    nombre: string | null;
    mesa: string | null;
  } | null;
};

// Acciones que el sistema puede ejecutar
type Accion =
  | { type: 'INICIAR_SESION'; payload: any }
  | { type: 'CERRAR_SESION' }
  | { type: 'SELECCIONAR_PERSONAL'; idPersonal: number | null }
  | { type: 'REINICIAR_TODO' }
  | { type: 'ALTERNAR_MODO_OSCURO' }
  | { type: 'ESTABLECER_MODO_OSCURO'; valor: boolean };

// Valores iniciales
const estadoInicial: Estado = {
  estaAutenticado: false,
  idPersonalSeleccionado: null,
  senalReinicio: 0,
  modoOscuro: false,
  usuario: null,
};

// Reductor: Maneja la lógica de transición de estados
function reductor(state: Estado, action: Accion): Estado {
  switch (action.type) {
    case 'INICIAR_SESION':
      if (typeof window !== 'undefined') {
        localStorage.setItem('sismov_auth', 'true');
        localStorage.setItem('sismov_user', JSON.stringify(action.payload));
      }
      return { ...state, estaAutenticado: true, usuario: action.payload };
    case 'CERRAR_SESION':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sismov_auth');
        localStorage.removeItem('sismov_user');
      }
      return { ...state, estaAutenticado: false, idPersonalSeleccionado: null, usuario: null };
    case 'SELECCIONAR_PERSONAL':
      return { ...state, idPersonalSeleccionado: action.idPersonal };
    case 'REINICIAR_TODO':
      return { ...state, idPersonalSeleccionado: null, senalReinicio: state.senalReinicio + 1 };
    case 'ALTERNAR_MODO_OSCURO':
      if (typeof window !== 'undefined') localStorage.setItem('sismov_tema', !state.modoOscuro ? 'dark' : 'light');
      return { ...state, modoOscuro: !state.modoOscuro };
    case 'ESTABLECER_MODO_OSCURO':
      if (typeof window !== 'undefined') localStorage.setItem('sismov_tema', action.valor ? 'dark' : 'light');
      return { ...state, modoOscuro: action.valor };
    default:
      return state;
  }
}

// Definición de la estructura del contexto
type ValorContextoEstadoApp = {
  state: Estado;
  actions: {
    login: (userData: any) => void;
    logout: () => void;
    seleccionarPersonal: (idPersonal: number | null) => void;
    reiniciarTodo: () => void;
    alternarModoOscuro: () => void;
    establecerModoOscuro: (valor: boolean) => void;
  };
};

const AppStateContext = createContext<ValorContextoEstadoApp | null>(null);

/**
 * Proveedor principal que envuelve la aplicación
 */
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [estaMontado, setEstaMontado] = React.useState(false);

  // Inicializar estado desde localStorage si estamos en el cliente
  const estadoInicialConStorage: Estado = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return {
        ...estadoInicial,
        estaAutenticado: localStorage.getItem('sismov_auth') === 'true',
        modoOscuro: localStorage.getItem('sismov_tema') === 'dark',
        usuario: localStorage.getItem('sismov_user') ? JSON.parse(localStorage.getItem('sismov_user') as string) : null,
      };
    }
    return estadoInicial;
  }, []);

  const [state, dispatch] = useReducer(reductor, estadoInicialConStorage);

  React.useEffect(() => {
    setEstaMontado(true);
  }, []);

  // Memorizamos las acciones para evitar re-renderizados innecesarios de los hijos
  const actions = useMemo(() => ({
    login: (userData: any) => dispatch({ type: 'INICIAR_SESION', payload: userData }),
    logout: () => dispatch({ type: 'CERRAR_SESION' }),
    seleccionarPersonal: (idPersonal: number | null) =>
      dispatch({ type: 'SELECCIONAR_PERSONAL', idPersonal }),
    reiniciarTodo: () => dispatch({ type: 'REINICIAR_TODO' }),
    alternarModoOscuro: () => dispatch({ type: 'ALTERNAR_MODO_OSCURO' }),
    establecerModoOscuro: (valor: boolean) =>
      dispatch({ type: 'ESTABLECER_MODO_OSCURO', valor }),
  }), []);

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  // Evitar error de hidratación en Next.js
  if (!estaMontado) {
    return null; // O un spinner de carga que ocupe la pantalla
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

/**
 * Hook personalizado para acceder al estado global
 */
export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState debe usarse dentro de <AppStateProvider />');
  return ctx;
}