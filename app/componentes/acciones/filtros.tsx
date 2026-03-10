'use client';

import React, { createContext, useContext, useMemo, useReducer, useCallback, useRef } from 'react';

export type Filtros = {
  empleo: string[];
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombre: string;
  matricula: string;
  arma: string[];
  especialidad: string;
  profesion: string;
  subespecialidad: string;
  situacion: string;
  region: string[];
  zona: string[];
  sexo: string;
  lugarNacimiento: string;
  estadoNacimiento: string[];
  unidad: string;
  ubicacion: string;
  cargo: string;
  clasificacion: string;
  fechaNacimiento: string;
  fechaNacimiento2: string;
  edad: string;
  edad2: string;
  fechaCargo: string;
  tiempoCargo: string;
  fechaIngreso: string;
  tiempoEjercito: string;
  fechaEmpleo: string;
  tiempoGrado: string;
  fechaDestino: string;
  tiempoDestino: string;
  edadLimite: string;
  fechaCargo2: string;
  tiempoCargo2: string;
  fechaIngreso2: string;
  tiempoEjercito2: string;
  fechaEmpleo2: string;
  tiempoGrado2: string;
  fechaDestino2: string;
  tiempoDestino2: string;
  edadLimite2: string;
  familiares: boolean;
  semaforo: boolean;
};

export const filtrosIniciales: Filtros = {
  empleo: [],
  apellidoPaterno: '',
  apellidoMaterno: '',
  nombre: '',
  matricula: '',
  arma: [],
  especialidad: '',
  profesion: '',
  subespecialidad: '',
  situacion: '',
  region: [],
  zona: [],
  sexo: '',
  lugarNacimiento: '',
  estadoNacimiento: [],
  unidad: '',
  ubicacion: '',
  cargo: '',
  clasificacion: '',
  fechaNacimiento: '',
  fechaNacimiento2: '',
  edad: '',
  edad2: '',
  fechaCargo: '',
  tiempoCargo: '',
  fechaIngreso: '',
  tiempoEjercito: '',
  fechaEmpleo: '',
  tiempoGrado: '',
  fechaDestino: '',
  tiempoDestino: '',
  edadLimite: '',
  fechaCargo2: '',
  tiempoCargo2: '',
  fechaIngreso2: '',
  tiempoEjercito2: '',
  fechaEmpleo2: '',
  tiempoGrado2: '',
  fechaDestino2: '',
  tiempoDestino2: '',
  edadLimite2: '',
  familiares: false,
  semaforo: false,
};
type Accion =
  | { type: 'ESTABLECER'; valor: Partial<Filtros> }
  | { type: 'REINICIAR' }
  | { type: 'RESULTADOS'; valor: any[] };

type Estado = {
  filtros: Filtros;
  resultados: any[];
};

const estadoInicial: Estado = {
  filtros: filtrosIniciales,
  resultados: [],
};

function reductor(state: Estado, action: Accion): Estado {
  switch (action.type) {
    case 'ESTABLECER': {
      const nuevosFiltros = { ...state.filtros, ...action.valor };
      if (typeof window !== 'undefined') localStorage.setItem('sismov_filtros', JSON.stringify(nuevosFiltros));
      return { ...state, filtros: nuevosFiltros };
    }
    case 'REINICIAR':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sismov_filtros');
        localStorage.removeItem('sismov_resultados');
      }
      return estadoInicial;
    case 'RESULTADOS':
      if (typeof window !== 'undefined') localStorage.setItem('sismov_resultados', JSON.stringify(action.valor));
      return { ...state, resultados: action.valor };
    default:
      return state;
  }
}

type ValorContextoFiltrosBusqueda = {
  state: Estado;
  actions: {
    setFiltros: (valor: Partial<Filtros>) => void;
    reiniciar: () => void;
  };
};

const ContextoFiltrosBusqueda = createContext<ValorContextoFiltrosBusqueda | null>(null);

export function ProveedorFiltrosBusqueda({ children }: { children: React.ReactNode }) {
  // Inicializar estado desde localStorage si estamos en el cliente
  const estadoInicialConStorage: Estado = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const guardadoFiltros = localStorage.getItem('sismov_filtros');
      const guardadoResultados = localStorage.getItem('sismov_resultados');

      let filtros = estadoInicial.filtros;
      let resultados = estadoInicial.resultados;

      if (guardadoFiltros) {
        try {
          filtros = JSON.parse(guardadoFiltros);
        } catch (e) {
          console.error("Error leyendo filtros del storage");
        }
      }

      if (guardadoResultados) {
        try {
          resultados = JSON.parse(guardadoResultados);
        } catch (e) {
          console.error("Error leyendo resultados del storage");
        }
      }

      return { filtros, resultados };
    }
    return estadoInicial;
  }, []);

  const [state, dispatch] = useReducer(reductor, estadoInicialConStorage);

  // Ref para el timer de debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscar = useCallback(async (filtrosActuales: Filtros) => {
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtrosActuales)
      });

      if (!res.ok) {
        if (res.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('sismov_auth');
          localStorage.removeItem('sismov_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return;
        }
        throw new Error('Error en la búsqueda');
      }

      const data = await res.json();
      dispatch({ type: 'RESULTADOS', valor: data });
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Búsqueda con debounce para evitar llamadas excesivas
  const buscarConDebounce = useCallback((filtrosActuales: Filtros) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      buscar(filtrosActuales);
    }, 300);
  }, [buscar]);

  // Efecto para hidratar la búsqueda inicial al recargar si hay filtros guardados
  React.useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('sismov_filtros') && localStorage.getItem('sismov_auth') === 'true') {
      buscar(state.filtros);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = useMemo(
    () => ({
      setFiltros: (valor: Partial<Filtros>) => {
        const nuevosFiltros = { ...state.filtros, ...valor };
        dispatch({ type: 'ESTABLECER', valor });
        buscarConDebounce(nuevosFiltros);
      },
      reiniciar: () => {
        dispatch({ type: 'REINICIAR' });
        dispatch({ type: 'RESULTADOS', valor: [] });
      },
      buscar,
    }),
    [state.filtros, buscar, buscarConDebounce]
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <ContextoFiltrosBusqueda.Provider value={value}>
      {children}
    </ContextoFiltrosBusqueda.Provider>
  );
}

export function useFiltrosBusqueda() {
  const ctx = useContext(ContextoFiltrosBusqueda);
  if (!ctx) throw new Error('useFiltrosBusqueda debe usarse dentro de <ProveedorFiltrosBusqueda />');
  return ctx;
}
