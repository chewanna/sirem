'use client'
import React, { useState, useEffect, useCallback } from "react";

import { ChevronDown, ChevronUp, X, Plus, Trash2, Save, Loader2, BookMarked, Users, Download, BrushCleaning, GripVertical, Send } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/componentes/ui/table";
import { useAppState } from "../componentes/acciones/estados";
import { useFiltrosBusqueda } from "../componentes/acciones/filtros";
import { ExportarButtons } from "./exportar";
import BusquedaRapida from "../componentes/busquedaRapida";
import { AdminCatalogo } from "../componentes/AdminCatalogo";
import { ExportarComision } from "./exportarComision";

interface PersonalItem {
    id_personal_militar: number;
    matricula: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
    grado?: { abreviatura?: string | null } | null;
    arma_servicio?: { nombre_servicio?: string | null } | null;
}

interface ListadoGuardado {
    id_listado: number;
    nombre: string;
    fecha: string;
    personal: PersonalItem[];
}

const Listados = () => {

    const { actions: appActions } = useAppState();
    const { state, actions } = useFiltrosBusqueda();
    const { filtros, resultados } = state;

    // listado generado localmente
    const [listado, setListado] = useState<PersonalItem[]>([]);

    // listados guardados en BD
    const [listadosGuardados, setListadosGuardados] = useState<ListadoGuardado[]>([]);
    const [cargandoListados, setCargandoListados] = useState(false);

    // modal guardar
    const [modalGuardar, setModalGuardar] = useState(false);
    const [nombreListado, setNombreListado] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [errorGuardar, setErrorGuardar] = useState("");
    const [listadoActivoId, setListadoActivoId] = useState<number | null>(null);

    const { state: appState } = useAppState();
    const esOficiales = appState.usuario?.role !== 'USUARIO_REGULAR';

    const cargarListados = useCallback(async () => {
        setCargandoListados(true);
        try {
            const res = await fetch("/api/listados");
            if (!res.ok) throw new Error();
            const data: ListadoGuardado[] = await res.json();
            setListadosGuardados(data);
        } catch {
            // silencioso
        } finally {
            setCargandoListados(false);
        }
    }, []);

    useEffect(() => { cargarListados(); }, [cargarListados]);

    const agregarAListado = (persona: PersonalItem) => {
        if (listado.some(p => p.id_personal_militar === persona.id_personal_militar)) return;
        setListado(prev => [...prev, persona]);
    };

    const quitarDeListado = (id: number) => {
        setListado(prev => prev.filter(p => p.id_personal_militar !== id));
    };

    const limpiarListado = () => {
        setListado([]);
        setListadoActivoId(null);
        setNombreListado("");
    };

    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        setDraggedItemIndex(index);
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/html", ""); // Necesario para compatibilidad
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        if (draggedItemIndex === null || draggedItemIndex === index) return;

        setListado((prev) => {
            const copy = [...prev];
            const draggedItem = copy[draggedItemIndex];
            copy.splice(draggedItemIndex, 1);
            copy.splice(index, 0, draggedItem);
            setDraggedItemIndex(index);
            return copy;
        });
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const cargarListadoGuardadoEnEditor = (lg: ListadoGuardado) => {
        setListado(lg.personal);
        setListadoActivoId(lg.id_listado);
        setNombreListado(lg.nombre);
    };

    const abrirModalGuardar = () => {
        if (listado.length === 0) return;
        if (!listadoActivoId) {
            setNombreListado("");
        }
        setErrorGuardar("");
        setModalGuardar(true);
    };

    const confirmarGuardar = async () => {
        if (!nombreListado.trim()) {
            setErrorGuardar("Escribe un nombre para el listado.");
            return;
        }
        setGuardando(true);
        setErrorGuardar("");
        try {
            const isEditing = listadoActivoId !== null;
            const url = isEditing ? `/api/listados/${listadoActivoId}` : "/api/listados";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: nombreListado.trim(),
                    personalIds: listado.map(p => p.id_personal_militar),
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                setErrorGuardar(err.error || "Error al guardar.");
                return;
            }

            const listadoGuardado = await res.json();

            if (!isEditing) {
                setListadoActivoId(listadoGuardado.id_listado);
            }

            setModalGuardar(false);
            await cargarListados();
        } catch {
            setErrorGuardar("Error de conexión.");
        } finally {
            setGuardando(false);
        }
    };

    const eliminarListado = async (id: number) => {
        try {
            await fetch(`/api/listados/${id}`, { method: "DELETE" });
            setListadosGuardados(prev => prev.filter(l => l.id_listado !== id));
            if (id === listadoActivoId) {
                limpiarListado();
            }
        } catch {
        }
    };

    return (
        <div className="p-2 space-y-2 bg-[var(--background)] min-h-screen text-[var(--text-primary)]">
            {modalGuardar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Save className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-base font-bold text-[var(--text-primary)]">Guardar Listado</h3>
                            </div>
                            <button
                                onClick={() => setModalGuardar(false)}
                                className="p-1.5 rounded-lg hover:bg-[var(--surface-alt)] text-[var(--text-muted)] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-alt)] rounded-lg text-sm text-[var(--text-secondary)]">
                            <Users className="w-4 h-4 flex-shrink-0 text-[var(--primary)]" />
                            <span>{listado.length} elemento{listado.length !== 1 ? 's' : ''} en el listado</span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                                Nombre del Listado
                            </label>
                            <input
                                autoFocus
                                value={nombreListado}
                                onChange={(e) => { setNombreListado(e.target.value); setErrorGuardar(""); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') confirmarGuardar(); }}
                                placeholder="Ej. Guardia de honor 20-Feb-2026"
                                className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            />
                            {errorGuardar && (
                                <p className="text-xs text-red-500 font-medium">{errorGuardar}</p>
                            )}
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setModalGuardar(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarGuardar}
                                disabled={guardando}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {guardando
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                    : <><Save className="w-4 h-4" /> {listadoActivoId ? "Actualizar" : "Guardar"}</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 gap-6">
                <BusquedaRapida />
            </div>
            <div className="p-4 bg-[var(--surface-alt)] border-b border-[var(--border)] flex gap-4 items-center justify-between">
                <button
                    onClick={() => { actions.reiniciar(); appActions.reiniciarTodo(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm font-bold text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                >
                    <X className="w-4 h-4" />
                    REINICIAR FILTROS
                </button>
                <button
                    onClick={() => setListado([...resultados])}
                    disabled={resultados.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white border border-[var(--border)] rounded-md text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" />
                    GENERAR RELACIÓN
                </button>
            </div>
            <div className="grid grid-cols-1 gap-6">
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
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {resultados.map((p) => (
                                    <TableRow
                                        key={p.id_personal_militar}
                                        className="cursor-pointer hover:bg-[var(--surface-alt)] text-[var(--text-primary)]"
                                        onClick={() => appActions.seleccionarPersonal(p.id_personal_militar)}
                                    >
                                        <TableCell>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); agregarAListado(p); }}
                                                disabled={listado.some(l => l.id_personal_militar === p.id_personal_militar)}
                                                className="p-1 rounded-md bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Agregar a listado"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </TableCell>
                                        <TableCell>{p.grado?.abreviatura || '-'}</TableCell>
                                        <TableCell>{p.arma_servicio?.nombre_servicio || '-'}</TableCell>
                                        <TableCell>{p.apellido_paterno}</TableCell>
                                        <TableCell>{p.apellido_materno}</TableCell>
                                        <TableCell>{p.nombre}</TableCell>
                                        <TableCell>{p.matricula}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </section>
            </div>
            <div>
                <section className="flex gap-4">
                    <div className="flex-1">
                        <h2 className="p-4 text-center text-lg font-bold text-[var(--text-primary)] mb-2">
                            {listadoActivoId ? `Editando: ${nombreListado}` : "Listado Generado"}
                        </h2>
                        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-hidden">
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
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {listado.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-[var(--text-secondary)] py-6">
                                                    Agregue personal desde la tabla de arriba
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            listado.map((p, index) => {
                                                return (
                                                    <TableRow
                                                        key={p.id_personal_militar}
                                                        className={`text-[var(--text-primary)] transition-all ${draggedItemIndex === index ? 'opacity-50 scale-y-105 shadow-md bg-blue-50/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLTableRowElement>, index)}
                                                        onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent<HTMLTableRowElement>, index)}
                                                        onDragEnd={handleDragEnd}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors active:cursor-grabbing" title="Arrastrar para ordenar">
                                                                    <GripVertical className="w-4 h-4" />
                                                                </div>
                                                                <button
                                                                    onClick={() => quitarDeListado(p.id_personal_militar)}
                                                                    className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                                                                    title="Quitar del listado"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{p.grado?.abreviatura || '-'}</TableCell>
                                                        <TableCell>{p.arma_servicio?.nombre_servicio || '-'}</TableCell>
                                                        <TableCell>{p.apellido_paterno}</TableCell>
                                                        <TableCell>{p.apellido_materno}</TableCell>
                                                        <TableCell>{p.nombre}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-0.5">
                                                                <span>{p.matricula}</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <footer className="p-3 bg-[var(--surface)] border-t border-[var(--border)]">
                                <p className="text-red-600 font-black text-xs tracking-tighter uppercase">
                                    Cantidad en listado: {listado.length}
                                </p>
                                <div className="p-2 flex gap-2">
                                    {/* GUARDAR */}
                                    <button
                                        onClick={abrirModalGuardar}
                                        disabled={listado.length === 0}
                                        className="flex items-center gap-1.5 px-5 py-1.5 bg-[var(--primary-foreground)] text-black border border-[var(--border)] rounded-md text-xs font-bold hover:bg-green-50 hover:border-green-400 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Save className="w-3.5 h-3.5 text-green-600" /> GUARDAR
                                    </button>
                                    {/* LIMPIAR LISTA */}
                                    <button
                                        onClick={limpiarListado}
                                        disabled={listado.length === 0}
                                        className="flex items-center gap-1.5 px-5 py-1.5 bg-[var(--primary-foreground)] text-black border border-[var(--border)] rounded-md text-xs font-bold hover:bg-red-50 hover:border-red-400 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <BrushCleaning className="w-3.5 h-3.5 text-red-500" /> LIMPIAR LISTA
                                    </button>
                                    {/* EXPORTAR */}
                                    <ExportarButtons listado={listado} />

                                    {esOficiales && <ExportarComision listado={listado} />}
                                </div>
                            </footer>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="p-4 text-center text-lg font-bold text-[var(--text-primary)] mb-2">Listados Guardados</h2>
                        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] min-h-[120px]">
                            {cargandoListados ? (
                                <div className="flex items-center justify-center py-10 text-[var(--text-muted)]">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    <span className="text-sm">Cargando...</span>
                                </div>
                            ) : listadosGuardados.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)] gap-2">
                                    <BookMarked className="w-8 h-8 opacity-30" />
                                    <p className="text-sm">No hay listados guardados</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-[var(--border)]">
                                    {listadosGuardados.map((lg) => (
                                        <li
                                            key={lg.id_listado}
                                            className={`flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-alt)] transition-colors group cursor-pointer ${listadoActivoId === lg.id_listado ? 'bg-[var(--surface-alt)] border-l-4 border-l-[var(--primary)]' : ''}`}
                                            onClick={() => cargarListadoGuardadoEnEditor(lg)}
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{lg.nombre}</p>
                                                <p className="text-xs text-[var(--text-muted)]">
                                                    {new Date(lg.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    {' · '}
                                                    <span className="font-medium text-[var(--primary)]">{lg.personal.length} elemento{lg.personal.length !== 1 ? 's' : ''}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); eliminarListado(lg.id_listado); }}
                                                title="Eliminar listado"
                                                className="ml-3 p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Listados