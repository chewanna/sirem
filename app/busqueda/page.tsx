'use client'

import React, { useState } from "react";
import { Filter, ChevronDown, X, ShieldCheck, Plus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/componentes/ui/table";
import { useAppState } from "../componentes/acciones/estados";
import { useFiltrosBusqueda } from "../componentes/acciones/filtros";
import { ConductaModal } from "../componentes/Conducta";
import { Popover, PopoverTrigger, PopoverContent } from "../componentes/ui/popover";
import BusquedaRapida from "../componentes/busquedaRapida";
import { AdminCatalogo } from "../componentes/AdminCatalogo";

const Busqueda = () => {
  const { state: appState, actions: appActions } = useAppState();
  const { state, actions } = useFiltrosBusqueda();
  const { filtros, resultados } = state;
  const puedeAgregar = appState.usuario?.role !== 'USUARIO_REGULAR';
  const esAdministrador = appState.usuario?.role === 'ADMINISTRADOR';

  const [modalConducta, setModalConducta] = useState(false);
  const [personalConducta, setPersonalConducta] = useState<Record<string, unknown> | null>(null);
  const [familiaresMilitares, setFamiliaresMilitares] = useState<Record<string, unknown>[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadCatalogos = async () => {
    try {
      const res = await fetch('/api/catalogos');
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const newOpcionesSelect = { ...opcionesSelect };
      const newOpciones2 = [...opciones2];
      const newOpciones3 = [...opciones3];
      const newOpciones4 = [...opciones4];
      const newOpciones5 = [...opciones5];

      data.forEach((item: { tipo: string, valor: string }) => {
        const uppercased = item.valor.toUpperCase();
        if (item.tipo === "arma" && !newOpciones2.includes(uppercased)) newOpciones2.push(uppercased);
        else if (item.tipo === "region" && !newOpciones3.includes(uppercased)) newOpciones3.push(uppercased);
        else if (item.tipo === "zona" && !newOpciones4.includes(uppercased)) newOpciones4.push(uppercased);
        else if (item.tipo === "estadoNacimiento" && !newOpciones5.includes(uppercased)) newOpciones5.push(uppercased);
        else if (newOpcionesSelect.hasOwnProperty(item.tipo)) {
          const currentArr = newOpcionesSelect[item.tipo as keyof typeof newOpcionesSelect];
          if (!currentArr.includes(uppercased)) currentArr.push(uppercased);
        }
      });
      setOpciones2(Array.from(new Set(newOpciones2)));
      setOpciones3(Array.from(new Set(newOpciones3)));
      setOpciones4(Array.from(new Set(newOpciones4)));
      setOpciones5(Array.from(new Set(newOpciones5)));
      setOpcionesSelect({
        especialidad: Array.from(new Set(newOpcionesSelect.especialidad)),
        profesion: Array.from(new Set(newOpcionesSelect.profesion)),
        subespecialidad: Array.from(new Set(newOpcionesSelect.subespecialidad)),
        situacion: Array.from(new Set(newOpcionesSelect.situacion)),
        sexo: Array.from(new Set(newOpcionesSelect.sexo)),
        unidad: Array.from(new Set(newOpcionesSelect.unidad)),
        cargo: Array.from(new Set(newOpcionesSelect.cargo)),
        clasificacion: Array.from(new Set(newOpcionesSelect.clasificacion))
      });
    } catch (e) { console.error('Error cargando catalogos', e); }
  }

  React.useEffect(() => {
    setMounted(true);
    loadCatalogos();
  }, [/* eslint-disable-next-line react-hooks/exhaustive-deps */]);

  const abrirModalConducta = (persona: Record<string, unknown>) => {
    setPersonalConducta(persona);
    setModalConducta(true);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    actions.setFiltros({ [field]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, field: string) => {
    actions.setFiltros({ [field]: e.target.value });
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const current = (filtros as Record<string, unknown>)[field] as string[];
    const updated = checked
      ? [...current, value]
      : current.filter((v: string) => v !== value);
    actions.setFiltros({ [field]: updated });
  };

  const handleBooleanChange = (field: string, checked: boolean) => {
    actions.setFiltros({ [field]: checked });
  };

  const handleFamiliaresToggle = async (checked: boolean) => {
    actions.setFiltros({ familiares: checked });
    if (checked && appState.idPersonalSeleccionado) {
      try {
        const res = await fetch(`/api/personal/familiares/${appState.idPersonalSeleccionado}`);

        if (!res.ok) {
          if (res.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('sismov_auth');
            localStorage.removeItem('sismov_user');
            window.location.href = '/login';
            return;
          }
          throw new Error('Error al cargar familiares');
        }

        const data = await res.json();
        // Extraer los familiares militares (el campo 'familiar' tiene los datos del PersonalMilitar)
        const famMilitares = data
          .filter((f: Record<string, unknown>) => f.familiar)
          .map((f: Record<string, unknown>) => ({
            ...(f.familiar as object),
            parentesco: f.parentesco,
          }));
        setFamiliaresMilitares(famMilitares);
      } catch (error) {
        console.error('Error al cargar familiares:', error);
        setFamiliaresMilitares([]);
      }
    } else {
      setFamiliaresMilitares([]);
    }
  };

  //para los checkbox 
  const [opciones2, setOpciones2] = useState(["ADMON.", "ARCH.", "ARMA BLND.", "ART.", "ARTCA.", "BOM.", "CAB.", "CART.", "CTL. MIL.VLO.", "DEF. RUR.", "EDUC. MIL.", "EDUC.F.Y D.", "F.A.", "INF.", "INFTCA.", "ING.", "INT.", "JUST. MIL", "M.G.", "MARINA", "MAT. AR.", "MET.MIL.", "MUS.MIL.", "PLA.", "P.M.", "PNAL.", "REC.", "SND.", "T.T.F.A.", "TPTE.AR.", "TPTES.", "TRANS.", "VR.", "ARMAS", "SERVICIO"]);
  const [opciones3, setOpciones3] = useState(["I R.M.", "II R.M.", "III R.M.", "IV R.M.", "V R.M.", "VI R.M.", "VII R.M.", "VIII R.M.", "IX R.M.", "X R.M.", "XI R.M.", "XII R.M."]);
  const [opciones4, setOpciones4] = useState(["1/a. Z.M.", "2/a. Z.M.", "3/a. Z.M.", "4/a. Z.M.", "5/a. Z.M.", "6/a. Z.M.", "7/a. Z.M.", "8/a. Z.M.", "9/a. Z.M.", "10/a. Z.M.", "11/a. Z.M.", "12/a. Z.M.", "13/a. Z.M.", "14/a. Z.M.", "15/a. Z.M.", "16/a. Z.M.", "17/a. Z.M.", "18/a. Z.M.", "19/a. Z.M.", "20/a. Z.M.", "21/a. Z.M.", "22/a. Z.M.", "23/a. Z.M.", "24/a. Z.M.", "25/a. Z.M.", "26/a. Z.M.", "27/a. Z.M.", "28/a. Z.M.", "29/a. Z.M.", "30/a. Z.M.", "31/a. Z.M.", "32/a. Z.M.", "33/a. Z.M.", "34/a. Z.M.", "35/a. Z.M.", "36/a. Z.M.", "37/a. Z.M.", "38/a. Z.M.", "39/a. Z.M.", "40/a. Z.M.", "41/a. Z.M.", "42/a. Z.M.", "43/a. Z.M.", "44/a. Z.M.", "45/a. Z.M.", "46/a. Z.M.", "47/a. Z.M.", "48/a. Z.M."]);
  const [opciones5, setOpciones5] = useState(["PUEBLA", "TLAXCALA", "HIDALGO", "VERACRUZ", "OAXACA", "GUERRERO", "MORELOS", "CDMX", "ESTADO DE MÉXICO", "QUERÉTARO", "TAMAULIPAS", "SAN LUIS POTOSÍ", "ZACATECAS", "AGUASCALIENTES", "NAYARIT", "JALISCO", "COLIMA", "MICHOACÁN", "GUANAJUATO", "CHIHUAHUA", "COAHUILA", "DURANGO", "NUEVO LEÓN", "SONORA", "SINALOA", "BAJA CALIFORNIA", "BAJA CALIFORNIA SUR", "CAMPECHE", "QUINTANA ROO", "YUCATÁN"]);

  const [opcionesSelect, setOpcionesSelect] = useState<{
    especialidad: string[];
    profesion: string[];
    subespecialidad: string[];
    situacion: string[];
    sexo: string[];
    unidad: string[];
    cargo: string[];
    clasificacion: string[];
  }>({
    especialidad: [],
    profesion: ["D.E.M.", "D.E.M.A.", "E.M."],
    subespecialidad: [],
    situacion: ["A DISPOSICION", "AGREGADO", "COMISION AJENA", "COMISIONADO", "CON LICENCIA ESPECIAL", "CON LICENCIA ILIMITADA", "CON LICENCIA ORDINARIA", "CON LICENCIA POR EDAD LIMITE", "DISPONIBILIDAD", "ENCUADRADO", "INTERNO", "LICENCIA ESPECIAL", "PLANTA"],
    sexo: ["MASCULINO", "FEMENINO"],
    unidad: [],
    cargo: [],
    clasificacion: ["PERMANENTE", "AUXILIAR"]
  });


  if (!mounted) return null;

  return (
    <div className="p-2 space-y-2 bg-[var(--background)] min-h-screen text-[var(--text-primary)]">
      {/*Búsqueda Rápida */}
      <BusquedaRapida />
      {/*Filtros Avanzados */}
      <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="p-4 bg-[var(--surface-alt)] border-b border-[var(--border)] flex justify-between items-center">
          <button
            onClick={() => { actions.reiniciar(); appActions.reiniciarTodo(); }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm font-bold text-red-600 hover:bg-red-50 transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
            REINICIAR FILTROS
          </button>
        </div>
        <details className="group">
          <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none hover:bg-[var(--surface-alt)]">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[var(--text-muted)]" />
              <span className="font-bold text-[var(--text-primary)] tracking-wider text-sm">Filtros Avanzados</span>
            </div>
            <ChevronDown className="w-5 h-5 text-[var(--text-muted)] transition-transform group-open:rotate-180" />
          </summary>
          <div className="p-6 border-t border-[var(--border)] bg-[var(--surface-alt)]/30 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {/*checkbox arma */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase"> Arma ó Servicio </label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
                    <button className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.arma.length > 0 ? filtros.arma.join(", ") : "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto">
                    {opciones2.map((opcion) => {
                      const checked = filtros.arma.includes(opcion)
                      return (
                        <div key={opcion}
                          className="flex items-center gap-2 hover:bg-[var(--surface)] rounded p-1 transition-colors cursor-pointer"
                          onClick={() => handleCheckboxChange("arma", opcion, !checked)} >
                          <span className={`h-4 w-4 flex items-center justify-center border rounded ${checked ? "bg-blue-600 text-white" : "bg-white"}`} > {checked ? "✓" : ""}</span>
                          <span className="text-xs text-[var(--text-secondary)] select-none">{opcion}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="arma" opciones={opciones2} onUpdate={loadCatalogos} placeholder="NUEVA ARMA" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Especialidad</label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer outline-none">
                    <button className="flex items-center justify-between w-full outline-none">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.especialidad.length > 0 ? filtros.especialidad.join(", ") : "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto outline-none">
                    <div className="flex items-center gap-2 rounded p-1 transition-colors cursor-pointer hover:bg-[var(--surface)]" onClick={() => actions.setFiltros({ especialidad: [] })}>
                      <span className="text-xs font-bold text-red-600 select-none">LIMPIAR SELECCIÓN</span>
                    </div>
                    {opcionesSelect.especialidad.map((opt) => {
                      const checked = filtros.especialidad.includes(opt);
                      return (
                        <div key={opt}
                          className="flex items-center gap-2 hover:bg-[var(--surface)] rounded p-1 transition-colors cursor-pointer"
                          onClick={() => handleCheckboxChange("especialidad", opt, !checked)} >
                          <span className={`h-4 w-4 flex items-center justify-center border rounded ${checked ? "bg-blue-600 text-white" : "bg-white"}`} > {checked ? "✓" : ""}</span>
                          <span className="text-xs text-[var(--text-secondary)] select-none">{opt}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="especialidad" opciones={opcionesSelect.especialidad} onUpdate={loadCatalogos} placeholder="NUEVA OPCIÓN" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Profesión</label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer outline-none">
                    <button className="flex items-center justify-between w-full outline-none">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.profesion.length > 0 ? filtros.profesion.join(", ") : "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto outline-none">
                    <div className="flex items-center gap-2 rounded p-1 transition-colors cursor-pointer hover:bg-[var(--surface)]" onClick={() => actions.setFiltros({ profesion: [] })}>
                      <span className="text-xs font-bold text-red-600 select-none">LIMPIAR SELECCIÓN</span>
                    </div>
                    {opcionesSelect.profesion.map((opt) => {
                      const checked = filtros.profesion.includes(opt);
                      return (
                        <div key={opt}
                          className="flex items-center gap-2 hover:bg-[var(--surface)] rounded p-1 transition-colors cursor-pointer"
                          onClick={() => handleCheckboxChange("profesion", opt, !checked)} >
                          <span className={`h-4 w-4 flex items-center justify-center border rounded ${checked ? "bg-blue-600 text-white" : "bg-white"}`} > {checked ? "✓" : ""}</span>
                          <span className="text-xs text-[var(--text-secondary)] select-none">{opt}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="profesion" opciones={opcionesSelect.profesion} onUpdate={loadCatalogos} placeholder="NUEVA OPCIÓN" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">SubEspecialidad</label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer outline-none">
                    <button className="flex items-center justify-between w-full outline-none">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.subespecialidad.length > 0 ? filtros.subespecialidad.join(", ") : "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto outline-none">
                    <div className="flex items-center gap-2 rounded p-1 transition-colors cursor-pointer hover:bg-[var(--surface)]" onClick={() => actions.setFiltros({ subespecialidad: [] })}>
                      <span className="text-xs font-bold text-red-600 select-none">LIMPIAR SELECCIÓN</span>
                    </div>
                    {opcionesSelect.subespecialidad.map((opt) => {
                      const checked = filtros.subespecialidad.includes(opt);
                      return (
                        <div key={opt}
                          className="flex items-center gap-2 hover:bg-[var(--surface)] rounded p-1 transition-colors cursor-pointer"
                          onClick={() => handleCheckboxChange("subespecialidad", opt, !checked)} >
                          <span className={`h-4 w-4 flex items-center justify-center border rounded ${checked ? "bg-blue-600 text-white" : "bg-white"}`} > {checked ? "✓" : ""}</span>
                          <span className="text-xs text-[var(--text-secondary)] select-none">{opt}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="subespecialidad" opciones={opcionesSelect.subespecialidad} onUpdate={loadCatalogos} placeholder="NUEVA OPCIÓN" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Situación</label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer outline-none">
                    <button className="flex items-center justify-between w-full outline-none">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.situacion.length > 0 ? filtros.situacion.join(", ") : "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto outline-none">
                    <div className="flex items-center gap-2 rounded p-1 transition-colors cursor-pointer hover:bg-[var(--surface)]" onClick={() => actions.setFiltros({ situacion: [] })}>
                      <span className="text-xs font-bold text-red-600 select-none">LIMPIAR SELECCIÓN</span>
                    </div>
                    {opcionesSelect.situacion.map((opt) => {
                      const checked = filtros.situacion.includes(opt);
                      return (
                        <div key={opt}
                          className="flex items-center gap-2 hover:bg-[var(--surface)] rounded p-1 transition-colors cursor-pointer"
                          onClick={() => handleCheckboxChange("situacion", opt, !checked)} >
                          <span className={`h-4 w-4 flex items-center justify-center border rounded ${checked ? "bg-blue-600 text-white" : "bg-white"}`} > {checked ? "✓" : ""}</span>
                          <span className="text-xs text-[var(--text-secondary)] select-none">{opt}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="situacion" opciones={opcionesSelect.situacion} onUpdate={loadCatalogos} placeholder="NUEVA OPCIÓN" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/*checkbox */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase"> región </label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
                    <button className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.region.length > 0 ? filtros.region.join(", ") : "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto">
                    {opciones3.map((opcion) => {
                      const checked = filtros.region.includes(opcion)
                      return (
                        <div key={opcion}
                          className="flex items-center gap-2 hover:bg-[var(--surface)] rounded p-1 transition-colors cursor-pointer"
                          onClick={() => handleCheckboxChange("region", opcion, !checked)} >
                          <span className={`h-4 w-4 flex items-center justify-center border rounded ${checked ? "bg-blue-600 text-white" : "bg-white"}`} > {checked ? "✓" : ""}</span>
                          <span className="text-xs text-[var(--text-secondary)] select-none">{opcion}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="region" opciones={opciones3} onUpdate={loadCatalogos} placeholder="NUEVA REGIÓN" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
              {/*checkbox */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase"> Zona </label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
                    <button className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.zona.length > 0 ? filtros.zona.join(", ") : "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto">
                    {opciones4.map((opcion) => {
                      const checked = filtros.zona.includes(opcion)
                      return (
                        <div key={opcion}
                          className="flex items-center gap-2 hover:bg-[var(--surface)] rounded p-1 transition-colors cursor-pointer"
                          onClick={() => handleCheckboxChange("zona", opcion, !checked)} >
                          <span className={`h-4 w-4 flex items-center justify-center border rounded ${checked ? "bg-blue-600 text-white" : "bg-white"}`} > {checked ? "✓" : ""}</span>
                          <span className="text-xs text-[var(--text-secondary)] select-none">{opcion}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="zona" opciones={opciones4} onUpdate={loadCatalogos} placeholder="NUEVA ZONA" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Sexo</label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer outline-none">
                    <button className="flex items-center justify-between w-full outline-none">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.sexo || "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto outline-none">
                    <div className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors cursor-pointer ${!filtros.sexo ? "bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-[var(--surface)] text-[var(--text-secondary)]"}`} onClick={() => actions.setFiltros({ sexo: '' })}>
                      <span className="text-xs select-none">TODOS</span>
                    </div>
                    {opcionesSelect.sexo.map((opt) => {
                      const selected = filtros.sexo === opt;
                      return (
                        <div key={opt}
                          className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors cursor-pointer ${selected ? "bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-[var(--surface)] text-[var(--text-secondary)]"}`}
                          onClick={() => actions.setFiltros({ sexo: opt })} >
                          <span className="text-xs select-none w-full">{opt}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="sexo" opciones={opcionesSelect.sexo} onUpdate={loadCatalogos} placeholder="NUEVA OPCIÓN" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Lugar de Nacimiento</label>
                <input
                  value={filtros.lugarNacimiento}
                  onChange={(e) => handleInputChange(e, 'lugarNacimiento')}
                  className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-xs focus:ring-2 focus:ring-[var(--primary)] outline-none">
                </input>
              </div>

              {/*checkbox */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase"> Estado de Nacimiento </label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
                    <button className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.estadoNacimiento.length > 0 ? filtros.estadoNacimiento.join(", ") : "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto">
                    {opciones5.map((opcion) => {
                      const checked = filtros.estadoNacimiento.includes(opcion)
                      return (
                        <div key={opcion}
                          className="w-full flex items-center gap-2 hover:bg-[var(--surface)] rounded p-1 transition-colors cursor-pointer"
                          onClick={() => handleCheckboxChange("estadoNacimiento", opcion, !checked)} >
                          <span className={`h-4 w-4 flex items-center justify-center border rounded ${checked ? "bg-blue-600 text-white" : "bg-white"}`} > {checked ? "✓" : ""}</span>
                          <span className="text-xs text-[var(--text-secondary)] select-none">{opcion}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="estadoNacimiento" opciones={opciones5} onUpdate={loadCatalogos} placeholder="NUEVO ESTADO" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Unidad</label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer outline-none">
                    <button className="flex items-center justify-between w-full outline-none">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.unidad || "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto outline-none">
                    <div className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors cursor-pointer ${!filtros.unidad ? "bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-[var(--surface)] text-[var(--text-secondary)]"}`} onClick={() => actions.setFiltros({ unidad: '' })}>
                      <span className="text-xs select-none">TODOS</span>
                    </div>
                    {opcionesSelect.unidad.map((opt) => {
                      const selected = filtros.unidad === opt;
                      return (
                        <div key={opt}
                          className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors cursor-pointer ${selected ? "bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-[var(--surface)] text-[var(--text-secondary)]"}`}
                          onClick={() => actions.setFiltros({ unidad: opt })} >
                          <span className="text-xs select-none w-full">{opt}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="unidad" opciones={opcionesSelect.unidad} onUpdate={loadCatalogos} placeholder="NUEVA OPCIÓN" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Ubicación</label>
                <input
                  value={filtros.ubicacion}
                  onChange={(e) => handleInputChange(e, 'ubicacion')}
                  className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-xs focus:ring-2 focus:ring-[var(--primary)] outline-none">
                </input>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Cargo</label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer outline-none">
                    <button className="flex items-center justify-between w-full outline-none">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.cargo || "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto outline-none">
                    <div className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors cursor-pointer ${!filtros.cargo ? "bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-[var(--surface)] text-[var(--text-secondary)]"}`} onClick={() => actions.setFiltros({ cargo: '' })}>
                      <span className="text-xs select-none">TODOS</span>
                    </div>
                    {opcionesSelect.cargo.map((opt) => {
                      const selected = filtros.cargo === opt;
                      return (
                        <div key={opt}
                          className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors cursor-pointer ${selected ? "bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-[var(--surface)] text-[var(--text-secondary)]"}`}
                          onClick={() => actions.setFiltros({ cargo: opt })} >
                          <span className="text-xs select-none w-full">{opt}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="cargo" opciones={opcionesSelect.cargo} onUpdate={loadCatalogos} placeholder="NUEVA OPCIÓN" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Clasificación</label>
                <Popover>
                  <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer outline-none">
                    <button className="flex items-center justify-between w-full outline-none">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.clasificacion || "TODOS"}</span>
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto outline-none">
                    <div className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors cursor-pointer ${!filtros.clasificacion ? "bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-[var(--surface)] text-[var(--text-secondary)]"}`} onClick={() => actions.setFiltros({ clasificacion: '' })}>
                      <span className="text-xs select-none">TODOS</span>
                    </div>
                    {opcionesSelect.clasificacion.map((opt) => {
                      const selected = filtros.clasificacion === opt;
                      return (
                        <div key={opt}
                          className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors cursor-pointer ${selected ? "bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-[var(--surface)] text-[var(--text-secondary)]"}`}
                          onClick={() => actions.setFiltros({ clasificacion: opt })} >
                          <span className="text-xs select-none w-full">{opt}</span>
                        </div>)
                    })}
                    {esAdministrador && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <AdminCatalogo tipo="clasificacion" opciones={opcionesSelect.clasificacion} onUpdate={loadCatalogos} placeholder="NUEVA OPCIÓN" />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-center block text-[var(--text-secondary)]">FECHA NACIMIENTO</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filtros.fechaNacimiento} onChange={(e) => handleInputChange(e, 'fechaNacimiento')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                  <span className="text-slate-400 text-xs uppercase">a</span>
                  <input type="date" value={filtros.fechaNacimiento2} onChange={(e) => handleInputChange(e, 'fechaNacimiento2')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div className="grid items-center justify-center space-y-1">
                <label className="text-xs font-bold text-center block text-[var(--text-secondary)]">EDAD</label>
                <div className="flex w-35 items-center gap-2">
                  <input type="number" value={filtros.edad} onChange={(e) => handleInputChange(e, 'edad')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                  <span className="text-slate-400 text-xs uppercase">y</span>
                  <input type="number" value={filtros.edad2} onChange={(e) => handleInputChange(e, 'edad2')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-center block text-[var(--text-secondary)]">FECHA DE CARGO</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filtros.fechaCargo} onChange={(e) => handleInputChange(e, 'fechaCargo')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                  <span className="text-slate-400 text-xs uppercase">a</span>
                  <input type="date" value={filtros.fechaCargo2} onChange={(e) => handleInputChange(e, 'fechaCargo2')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div className="grid items-center justify-center space-y-1">
                <label className="text-xs font-bold text-center block text-[var(--text-secondary)]">TIEMPO DE CARGO</label>
                <div className="flex w-35 items-center gap-2">
                  <input type="number" value={filtros.tiempoCargo} onChange={(e) => handleInputChange(e, 'tiempoCargo')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                  <span className="text-slate-400 text-xs uppercase">y</span>
                  <input type="number" value={filtros.tiempoCargo2} onChange={(e) => handleInputChange(e, 'tiempoCargo2')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-center block text-[var(--text-secondary)]">FECHA DE INGRESO EJÉRCITO</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filtros.fechaIngreso} onChange={(e) => handleInputChange(e, 'fechaIngreso')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                  <span className="text-slate-400 text-xs uppercase">a</span>
                  <input type="date" value={filtros.fechaIngreso2} onChange={(e) => handleInputChange(e, 'fechaIngreso2')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div className="grid items-center justify-center space-y-1">
                <label className="text-xs font-bold text-center block text-[var(--text-secondary)]">TIEMPO EN EL EJÉRCITO</label>
                <div className="flex w-35 items-center gap-2">
                  <input type="number" value={filtros.tiempoEjercito} onChange={(e) => handleInputChange(e, 'tiempoEjercito')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                  <span className="text-slate-400 text-xs uppercase">y</span>
                  <input type="number" value={filtros.tiempoEjercito2} onChange={(e) => handleInputChange(e, 'tiempoEjercito2')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-center block text-[var(--text-secondary)]">FECHA DE EMPLEO</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filtros.fechaEmpleo} onChange={(e) => handleInputChange(e, 'fechaEmpleo')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                  <span className="text-slate-400 text-xs uppercase">a</span>
                  <input type="date" value={filtros.fechaEmpleo2} onChange={(e) => handleInputChange(e, 'fechaEmpleo2')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div className="grid items-center justify-center space-y-1">
                <label className="text-xs font-bold text-center block text-[var(--text-secondary)]">TIEMPO EN EL GRADO</label>
                <div className="flex w-35 items-center gap-2">
                  <input type="number" value={filtros.tiempoGrado} onChange={(e) => handleInputChange(e, 'tiempoGrado')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                  <span className="text-slate-400 text-xs uppercase">y</span>
                  <input type="number" value={filtros.tiempoGrado2} onChange={(e) => handleInputChange(e, 'tiempoGrado2')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-center block text-[var(--text-secondary)]">FECHA DE DESTINO</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filtros.fechaDestino} onChange={(e) => handleInputChange(e, 'fechaDestino')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                  <span className="text-slate-400 text-xs uppercase">a</span>
                  <input type="date" value={filtros.fechaDestino2} onChange={(e) => handleInputChange(e, 'fechaDestino2')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div className="grid items-center justify-center space-y-1">
                <label className="text-xs font-bold text-center block text-[var(--text-secondary)]">TIEMPO EN EL GRADO</label>
                <div className="flex w-35 items-center gap-2">
                  <input type="number" value={filtros.tiempoDestino} onChange={(e) => handleInputChange(e, 'tiempoDestino')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                  <span className="text-slate-400 text-xs uppercase">y</span>
                  <input type="number" value={filtros.tiempoDestino2} onChange={(e) => handleInputChange(e, 'tiempoDestino2')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-center block text-[var(--text-secondary)]">FECHA DE EDAD LÍMITE</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filtros.edadLimite} onChange={(e) => handleInputChange(e, 'edadLimite')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                  <span className="text-slate-400 text-xs uppercase">a</span>
                  <input type="date" value={filtros.edadLimite2} onChange={(e) => handleInputChange(e, 'edadLimite2')} className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div className="grid items-center justify-center gap-2">
                <label className={`flex items-center gap-2 cursor-pointer group ${!appState.idPersonalSeleccionado ? 'opacity-40 pointer-events-none' : ''}`}>
                  <input type="checkbox" checked={filtros.familiares} onChange={(e) => handleFamiliaresToggle(e.target.checked)} disabled={!appState.idPersonalSeleccionado} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50" />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600">Familiares</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer group">
                  <input type="checkbox" checked={filtros.semaforo} onChange={(e) => handleBooleanChange('semaforo', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600">Semáforo</span>
                </label>
              </div>
            </div>
          </div>
        </details>
      </section>
      {/*Resultados*/}
      <div className="grid grid-cols-1 gap-6">
        {/* Tabla */}
        <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
          <footer className="p-3 bg-[var(--surface)] border-t border-[var(--border)]">
            <p className="text-red-600 font-black text-xs tracking-tighter uppercase">
              Registros localizados: {resultados.length}
            </p>
          </footer>
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[var(--surface-alt)] shadow-sm">
                <TableRow>
                  <TableHead className="font-bold text-[var(--text-primary)] w-10"></TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Grado</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Empleo</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Apellido Paterno</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Apellido Materno</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Nombre</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Matrícula</TableHead>
                  {filtros.familiares && <TableHead className="font-bold text-[var(--text-primary)]">Parentesco</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {(filtros.familiares ? familiaresMilitares : resultados).map((p: any, i: number) => (
                  <TableRow
                    key={p.id_personal_militar || i}
                    className="cursor-pointer hover:bg-[var(--surface-alt)]"
                    onClick={() => appActions.seleccionarPersonal(p.id_personal_militar)}
                  >
                    <TableCell>
                      {puedeAgregar && (
                        <button
                          onClick={(e) => { e.stopPropagation(); abrirModalConducta(p); }}
                          className="p-1.5 rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                          title="Registrar conducta"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                    </TableCell>
                    <TableCell>{p.grado?.abreviatura || '-'}</TableCell>
                    <TableCell>{p.arma_servicio?.nombre_servicio || '-'}</TableCell>
                    <TableCell>{p.apellido_paterno}</TableCell>
                    <TableCell>{p.apellido_materno}</TableCell>
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell>{p.matricula}</TableCell>
                    {filtros.familiares && <TableCell>{p.parentesco || '-'}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      {modalConducta && personalConducta && (
        <ConductaModal
          personal={personalConducta}
          onClose={() => setModalConducta(false)}
          onSuccess={() => {
            setModalConducta(false);
          }}
        />
      )}
    </div>
  );
}

export default Busqueda
