'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/componentes/ui/table";
import { useAppState } from "../componentes/acciones/estados";
import { useState, useEffect } from "react";

const Movimientos = () => {
  const { state } = useAppState();
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const puedeAgregar = state.usuario?.role !== 'USUARIO_REGULAR';

  useEffect(() => {
    setMounted(true);
  }, []);

  const initForm = {
    grado: '',
    motivo_movimiento: '',
    tipo: '',
    unidad: '',
    situacion: '',
    cargo: '',
    zm: '',
    rm: '',
    fecha_mov: '',
    no_documento: '',
    fecha_documento: '',
    no_acuerdo: '',
    motivo_detallado: ''
  };

  const [formData, setFormData] = useState(initForm);

  const fetchMovimientos = async () => {
    const idSeleccionado = state.idPersonalSeleccionado;
    if (!idSeleccionado) return;
    setCargando(true);
    try {
      const res = await fetch(`/api/personal/movimientos/${idSeleccionado}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMovimientos(data);
      } else {
        setMovimientos([]);
      }
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      setMovimientos([]);
    } finally {
      setCargando(false);
      setSeleccionado(null);
    }
  };

  useEffect(() => {
    if (!state.idPersonalSeleccionado) {
      setMovimientos([]);
      setSeleccionado(null);
      return;
    }
    fetchMovimientos();
  }, [state.idPersonalSeleccionado]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.idPersonalSeleccionado) return;

    try {
      setCargando(true);
      const res = await fetch(`/api/personal/movimientos/${state.idPersonalSeleccionado}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Error al guardar');
      }

      alert('Movimiento guardado exitosamente');
      setModoEdicion(false);
      setFormData(initForm);
      await fetchMovimientos();
    } catch (error) {
      alert('Hubo un error al guardar el movimiento');
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  if (!mounted) return null;

  return (
    <section>
      <div className="flex w-full p-4 space-y-5">
        <div className="flex-1 p-2 items-center justify-between">
          <div className="text-center space-y-3">
            <h1 className="text-1xs font-bold text-[var(--text-primary)] mb-2">Movimientos Registrados en Recursos Humanos</h1>
            <div className="p-4 bg-[var(--surface)] rounded-lg overflow-hidden border-4 border-[var(--border)] shadow-md">
              <div className="text-[var(--text-primary)] flex w-full">
                <span className="text-left">Situación: {seleccionado?.situacion || ''}</span>
                <div className="flex-1 flex justify-center">
                  <span className="text-center">Cargo: {seleccionado?.tipo || seleccionado?.cargo || ''}</span>
                </div>
              </div>
              <div className="text-[var(--text-primary)] flex w-full">
                <span className="text-left">Destino: {seleccionado?.unidad || ''}</span>
              </div>
              <div className="text-[var(--text-primary)] flex w-full">
                <span className="text-left">Fecha de Inicio: {seleccionado?.fecha_mov ? new Date(seleccionado.fecha_mov).toLocaleDateString('es-MX') : ''}</span>
                <div className="flex-1 flex justify-center">
                  <span className="text-center">Fecha de Fin: </span>
                </div>
              </div>
            </div>
            <section className="bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[var(--surface-alt)]">
                    <TableRow>
                      <TableHead className="font-bold text-[var(--text-primary)]">Fecha</TableHead>
                      <TableHead className="font-bold text-[var(--text-primary)]">Cargo/Tipo</TableHead>
                      <TableHead className="font-bold text-[var(--text-primary)]">Situación</TableHead>
                      <TableHead className="font-bold text-[var(--text-primary)]">Ubicación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cargando ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[var(--text-secondary)]">
                          Cargando...
                        </TableCell>
                      </TableRow>
                    ) : movimientos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[var(--text-secondary)]">
                          {state.idPersonalSeleccionado
                            ? 'No se encontraron movimientos para este personal'
                            : 'Seleccione un personal desde Búsqueda'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      movimientos.map((m, i) => (
                        <TableRow
                          key={m.id_movimiento || `doc-${i}`}
                          className={`cursor-pointer text-[var(--text-primary)] hover:bg-[var(--surface-alt)] ${seleccionado?.id_movimiento === m.id_movimiento ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                          onClick={() => setSeleccionado(m)}
                        >
                          <TableCell>{m.fecha_mov ? new Date(m.fecha_mov).toLocaleDateString('es-MX') : '-'}</TableCell>
                          <TableCell>{m.tipo || m.cargo || '-'}</TableCell>
                          <TableCell>{m.situacion || '-'}</TableCell>
                          <TableCell>{m.unidad || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <footer className="p-4 bg-[var(--surface)] border-t border-[var(--border)]">
                  <p className="text-left text-red-600 font-black text-xs tracking-tighter uppercase">
                    Total de Movimientos: {movimientos.length}
                  </p>
                </footer>
              </div>
            </section>
            <h1 className="text-center text-1xs font-bold text-[var(--text-primary)] mb-2">Documentación Generada de Movimientos</h1>
            <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[var(--surface-alt)]">
                    <TableRow>
                      <TableHead className="font-bold text-[var(--text-primary)]">Documento</TableHead>
                      <TableHead className="font-bold text-[var(--text-primary)]">Fecha</TableHead>
                      <TableHead className="font-bold text-[var(--text-primary)]">Tipo de Movimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cargando ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[var(--text-secondary)]">
                          Cargando...
                        </TableCell>
                      </TableRow>
                    ) : movimientos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[var(--text-secondary)]">
                          {state.idPersonalSeleccionado
                            ? 'No se encontraron movimientos para este personal'
                            : 'Seleccione un personal desde Búsqueda'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      movimientos.map((m, i) => (
                        <TableRow
                          key={m.id_movimiento || `doc-${i}`}
                          className={`cursor-pointer text-[var(--text-primary)] hover:bg-[var(--surface-alt)] ${seleccionado?.id_movimiento === m.id_movimiento ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                          onClick={() => setSeleccionado(m)}
                        >
                          <TableCell>{m.no_documento || 'verificar esto'}</TableCell>
                          <TableCell>{m.fecha_mov ? new Date(m.fecha_mov).toLocaleDateString('es-MX') : '-'}</TableCell>
                          <TableCell>{m.tipo || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <footer className="p-4 bg-[var(--surface)] border-t border-[var(--border)]">
                  <p className="text-left text-red-600 font-black text-xs tracking-tighter uppercase">
                    Documentos registrados: {movimientos.length}
                  </p>
                </footer>
              </div>
            </section>
          </div >
        </div >
        <div className="bg-[var(--surface)] rounded-lg border border-slate-200 flex-1 p-2 text-center">
          <span className="bg-[var(--surface)] text-3xs font-bold text-[var(--text-primary)] mb-2">Información Complementaria de la S-1 (R.H.) E.M.C.D.N.</span>
          <fieldset disabled={!modoEdicion || !state.idPersonalSeleccionado} className={(!modoEdicion || !state.idPersonalSeleccionado) ? 'opacity-60 cursor-not-allowed' : ''}>
            <form id="movimiento-form" onSubmit={handleSave} className="grid grid-cols-2 gap-6 p-6 bg-[var(--surface)]">

              <div className="bg-[var(--surface)] text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Grado:</label>
                <input name="grado" value={formData.grado} onChange={handleChange} required className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
              </div>

              <div className="bg-[var(--surface)] text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Motivo del Movimiento:</label>
                <input name="motivo_movimiento" value={formData.motivo_movimiento} onChange={handleChange} className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
              </div>

              <div className="bg-[var(--surface)] text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Modalidad del Movimiento:</label>
                <input name="tipo" value={formData.tipo} onChange={handleChange} required className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
              </div>

              <div className="bg-[var(--surface)] text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Unidad Destino:</label>
                <input name="unidad" value={formData.unidad} onChange={handleChange} required className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
              </div>

              <div className="bg-[var(--surface)] text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Situación:</label>
                <input name="situacion" value={formData.situacion} onChange={handleChange} className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
              </div>

              <div className="bg-[var(--surface)] text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Cargo:</label>
                <input name="cargo" value={formData.cargo} onChange={handleChange} className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
              </div>

              <div className="bg-[var(--surface)] text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Z.M.:</label>
                <input name="zm" value={formData.zm} onChange={handleChange} className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
              </div>

              <div className="bg-[var(--surface)] text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">R.M.:</label>
                <input name="rm" value={formData.rm} onChange={handleChange} className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
              </div>

              <div className="text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Fecha de Movimiento:</label>
                <input name="fecha_mov" type="date" value={formData.fecha_mov} onChange={handleChange} required className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)]">No. de Docto.:</label>
                <input name="no_documento" value={formData.no_documento} onChange={handleChange} className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Fecha del Documento:</label>
                <input name="fecha_documento" type="date" value={formData.fecha_documento} onChange={handleChange} className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="text-[var(--text-secondary)] flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)]">No. de Acuerdo:</label>
                <input name="no_acuerdo" value={formData.no_acuerdo} onChange={handleChange} className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>


              <div className="text-[var(--text-secondary)] col-span-2 flex flex-col text-left">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Motivo Detallado del Movimiento:</label>
                <input name="motivo_detallado" value={formData.motivo_detallado} onChange={handleChange} className="h-30 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </form>
          </fieldset>
          <div className="p-4 flex flex-col items-center gap-4">
            {!state.idPersonalSeleccionado ? (
              <p className="text-sm font-bold text-red-500">
                Seleccione un personal para registrarle un movimiento.
              </p>
            ) : (
              <div className="flex gap-4">
                {puedeAgregar && (
                  <button
                    type="button"
                    onClick={() => {
                      setModoEdicion(!modoEdicion);
                      if (modoEdicion) setFormData(initForm);
                    }}
                    className={`px-6 py-2 rounded-md text-sm font-bold transition-colors ${modoEdicion
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                      }`}
                  >
                    {modoEdicion ? 'CANCELAR' : 'NUEVO MOVIMIENTO'}
                  </button>
                )}
                {modoEdicion && puedeAgregar && (
                  <button
                    type="submit"
                    form="movimiento-form"
                    disabled={cargando}
                    className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-bold transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    {cargando ? 'GUARDANDO...' : 'GUARDAR MOVIMIENTO'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div >
    </section >
  );
}

export default Movimientos