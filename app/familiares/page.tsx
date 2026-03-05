'use client'
import { Plus, Edit, Trash2, Users, X, Search } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";
import { useAppState } from '../componentes/acciones/estados';

const PARENTESCOS = [
  'PADRE', 'MADRE', 'HERMANO', 'HERMANA', 'HIJO', 'HIJA',
  'ESPOSO', 'ESPOSA', 'TÍO', 'TÍA', 'PRIMO', 'PRIMA',
  'ABUELO', 'ABUELA', 'SOBRINO', 'SOBRINA', 'CUÑADO', 'CUÑADA',
];

const Familiares = () => {
  const { state } = useAppState();
  const { idPersonalSeleccionado, senalReinicio } = state;

  const [familiares, setFamiliares] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  // Modal agregar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
  const [familiarSeleccionado, setFamiliarSeleccionado] = useState<any | null>(null);
  const [parentesco, setParentesco] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Modal editar
  const [editando, setEditando] = useState<any | null>(null);
  const [parentescoEdit, setParentescoEdit] = useState('');

  // Fetch familiares
  useEffect(() => {
    if (!idPersonalSeleccionado) {
      setFamiliares([]);
      return;
    }
    fetchFamiliares();
  }, [idPersonalSeleccionado, senalReinicio]);

  const fetchFamiliares = async () => {
    if (!idPersonalSeleccionado) return;
    setCargando(true);
    try {
      const res = await fetch(`/api/personal/familiares/${idPersonalSeleccionado}`);
      const data = await res.json();
      if (Array.isArray(data)) setFamiliares(data);
      else setFamiliares([]);
    } catch (error) {
      console.error('Error al obtener familiares:', error);
      setFamiliares([]);
    } finally {
      setCargando(false);
    }
  };

  // Buscar personal en el modal
  const handleBuscar = async () => {
    if (busqueda.length < 2) return;
    setBuscando(true);
    try {
      const res = await fetch(`/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: busqueda }),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Excluir al personal seleccionado de los resultados
        setResultadosBusqueda(data.filter((p: any) => p.id_personal_militar !== idPersonalSeleccionado));
      }
    } catch (error) {
      console.error('Error buscando:', error);
    } finally {
      setBuscando(false);
    }
  };

  // Guardar nuevo familiar
  const handleGuardar = async () => {
    if (!familiarSeleccionado || !parentesco || !idPersonalSeleccionado) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/personal/familiares/${idPersonalSeleccionado}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_familiar: familiarSeleccionado.id_personal_militar,
          parentesco,
        }),
      });
      if (res.ok) {
        cerrarModal();
        fetchFamiliares();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando familiar:', error);
    } finally {
      setGuardando(false);
    }
  };

  // Editar parentesco
  const handleEditar = async () => {
    if (!editando || !parentescoEdit || !idPersonalSeleccionado) return;
    try {
      const res = await fetch(`/api/personal/familiares/${idPersonalSeleccionado}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_familiar_militar: editando.id_familiar_militar,
          parentesco: parentescoEdit,
          direccion: editando.direccion,
        }),
      });
      if (res.ok) {
        setEditando(null);
        fetchFamiliares();
      }
    } catch (error) {
      console.error('Error editando:', error);
    }
  };

  // Eliminar relación
  const handleEliminar = async (id_familiar_militar: number) => {
    if (!confirm('¿Eliminar esta relación familiar?')) return;
    if (!idPersonalSeleccionado) return;
    try {
      const res = await fetch(`/api/personal/familiares/${idPersonalSeleccionado}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_familiar_militar }),
      });
      if (res.ok) fetchFamiliares();
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setBusqueda('');
    setResultadosBusqueda([]);
    setFamiliarSeleccionado(null);
    setParentesco('');
  };

  return (
    <section className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Familiares Militares</h1>
          <p className="text-[var(--text-secondary)] text-sm">Registro de parentescos directos</p>
        </div>
        <button
          onClick={() => {
            if (!idPersonalSeleccionado) {
              alert('Seleccione un personal desde Búsqueda primero');
              return;
            }
            setModalAbierto(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Agregar Familiar
        </button>
      </div>

      {/* Resultado*/}
      <div className="space-y-4">
        {cargando ? (
          <p className="text-center text-[var(--text-secondary)] py-8">Cargando...</p>
        ) : !idPersonalSeleccionado ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-[var(--border)] rounded-xl">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20 text-[var(--text-secondary)]" />
            <p className="text-[var(--text-secondary)] font-medium">Seleccione un personal desde Búsqueda</p>
          </div>
        ) : familiares.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-[var(--border)] rounded-xl">
            <p className="text-[var(--text-secondary)] font-medium">No hay familiares militares registrados.</p>
          </div>
        ) : (
          familiares.map((rel) => {
            const f = rel.familiar;
            return (
              <div
                key={rel.id_familiar_militar}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-all group relative"
              >
                <div className="flex items-start gap-4">
                  <div className="grid place-items-center relative group">
                    <div className="grid-1 text-xs font-mono bg-[var(--surface-alt)] p-1.5 rounded border border-[var(--border)] text-[var(--text-primary)] flex items-center gap-2">
                      Parentesco: {rel.parentesco}
                    </div>
                    <div className="items-center w-32 h-40 rounded-lg border-4 border-white shadow-md bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={`/fotos/${f.matricula?.replace(/-/g, '')}.jpg`}
                        alt="Foto"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <div className="mt-2 text-center font-mono font-bold text-[var(--text-secondary)]">
                      ({f.matricula})
                    </div>
                    {rel.usuario && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold uppercase">
                        Registrado por: {rel.usuario.nombre || rel.usuario.username}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight">
                        {f.grado?.abreviatura || ''} {f.arma_servicio?.nombre_servicio || ''} {f.nombre} {f.apellido_paterno} {f.apellido_materno || ''}
                      </h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditando(rel); setParentescoEdit(rel.parentesco); }}
                          className="p-1.5 hover:bg-[var(--surface-alt)] rounded-md text-[var(--text-secondary)]"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(rel.id_familiar_militar)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Información</p>
                        <div className="flex intems-center gap-2">
                          <p className="text-sm text-[var(--text-primary)]">Situación: {f.situacion || '-'}</p>
                          <p className="flex-1 text-right text-sm text-[var(--text-primary)]">Edad limite: {calcularEdadLimite(f.fecha_nacimiento, f.grado?.nombre_grado)}</p>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">Unidad: {f.organismo?.nombre_organismo || '-'}</p>
                        <div className="flex items-center gap-4 text-[var(--text-primary)]">
                          <p className="flex-1 text-sm">Desde: {f.fecha_ingreso ? new Date(f.fecha_ingreso).toLocaleDateString('es-MX') : '-'}</p>
                          <p className="flex-1 text-sm text-[var(--text-primary)]">{f.fecha_ingreso ? calcularTiempo(f.fecha_ingreso) : ''}</p>
                          <p className="flex-1 text-sm text-[var(--text-primary)]">Fecha de ingreso: {f.fecha_ingreso ? new Date(f.fecha_ingreso).toLocaleDateString('es-MX') : '-'}</p>
                          <p className="flex-1 text-sm text-[var(--text-primary)]">{f.fecha_ingreso ? calcularTiempo(f.fecha_ingreso) : ''}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <p className="flex-1 text-sm text-[var(--text-primary)]">Fecha de Nacimiento: {f.fecha_nacimiento ? formatearFecha(f.fecha_nacimiento) : '-'} {f.fecha_nacimiento ? `(${calcularTiempo(f.fecha_nacimiento)})` : ''}</p>
                          <p className="flex-1 text-sm text-[var(--text-primary)]">Fecha de Empleo: {f.fecha_empleo ? formatearFecha(f.fecha_empleo) : '-'} {f.fecha_empleo ? `(${calcularTiempo(f.fecha_empleo)})` : ''}</p>
                        </div>
                        <p className="text-sm text-[var(--text-primary)]">Originario: {f.lugar_nacimiento || '-'}, {f.estado_nacimiento || ''}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div>
        <p className="text-red-600 font-black text-xs tracking-tighter uppercase">
          Familiares localizados: {familiares.length}
        </p>
      </div>

      {/* ==================== MODAL AGREGAR ==================== */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--surface)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Agregar Familiar Militar</h2>
              <button onClick={cerrarModal} className="p-1.5 hover:bg-[var(--surface-alt)] rounded-md">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Búsqueda */}
            <div className="p-4 border-b border-[var(--border)]">
              <div className="flex gap-2">
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                  placeholder="Buscar por nombre, apellido o matrícula..."
                  className="flex-1 h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
                <button
                  onClick={handleBuscar}
                  disabled={buscando}
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Resultados de búsqueda */}
            <div className="flex-1 overflow-y-auto p-4 max-h-60">
              {buscando ? (
                <p className="text-center text-[var(--text-secondary)]">Buscando...</p>
              ) : resultadosBusqueda.length === 0 ? (
                <p className="text-center text-[var(--text-secondary)] text-sm">
                  {busqueda ? 'No se encontraron resultados' : 'Ingrese un término de búsqueda'}
                </p>
              ) : (
                <div className="space-y-1">
                  {resultadosBusqueda.map((p) => (
                    <div
                      key={p.id_personal_militar}
                      onClick={() => setFamiliarSeleccionado(p)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${familiarSeleccionado?.id_personal_militar === p.id_personal_militar
                        ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300'
                        : 'hover:bg-[var(--surface-alt)] border border-transparent'
                        }`}
                    >
                      <div className="w-10 h-12 rounded border border-[var(--border)] overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={`/fotos/${p.matricula?.replace(/-/g, '')}.jpg`}
                          alt="Foto"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--text-primary)] text-sm">
                          {p.grado?.abreviatura || ''} {p.arma_servicio?.nombre_servicio || ''} {p.nombre} {p.apellido_paterno} {p.apellido_materno || ''}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">Matrícula: {p.matricula}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Parentesco */}
            <div className="p-4 border-t border-[var(--border)] space-y-3">
              {familiarSeleccionado && (
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-[var(--text-primary)]">
                  Seleccionado: <strong>{familiarSeleccionado.nombre} {familiarSeleccionado.apellido_paterno}</strong> ({familiarSeleccionado.matricula})
                </div>
              )}
              <div className="flex gap-3">
                <select
                  value={parentesco}
                  onChange={(e) => setParentesco(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
                >
                  <option value="">Seleccionar Parentesco...</option>
                  {PARENTESCOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <button
                  onClick={handleGuardar}
                  disabled={!familiarSeleccionado || !parentesco || guardando}
                  className="px-6 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL EDITAR PARENTESCO ==================== */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--surface)] rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Editar Parentesco</h2>
              <button onClick={() => setEditando(null)} className="p-1.5 hover:bg-[var(--surface-alt)] rounded-md">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Familiar: <strong className="text-[var(--text-primary)]">{editando.familiar?.nombre} {editando.familiar?.apellido_paterno}</strong>
            </p>
            <select
              value={parentescoEdit}
              onChange={(e) => setParentescoEdit(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
            >
              <option value="">Seleccionar Parentesco...</option>
              {PARENTESCOS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditando(null)}
                className="px-4 py-2 border border-[var(--border)] rounded-md text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditar}
                disabled={!parentescoEdit}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-md text-sm font-bold hover:bg-[var(--primary-hover)] disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// Helpers
function calcularTiempo(fecha: string): string {
  const d = new Date(fecha);
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  let months = now.getMonth() - d.getMonth();
  let days = now.getDate() - d.getDate();
  if (days < 0) { months--; days += 30; }
  if (months < 0) { years--; months += 12; }
  return `(${years} años, ${months} meses, ${days} días)`;
}

const EDAD_LIMITE_POR_GRADO: Record<string, number> = {
  'SOLDADO': 50,
  'CABO': 50,
  'SARGENTO SEGUNDO': 50,
  'SARGENTO PRIMERO': 50,
  'SUBTENIENTE': 51,
  'TENIENTE': 52,
  'CAPITÁN SEGUNDO': 53,
  'CAPITÁN PRIMERO': 54,
  'MAYOR': 56,
  'TENIENTE CORONEL': 58,
  'CORONEL': 60,
  'GENERAL BRIGADIER': 61,
  'GENERAL BRIGADA': 63,
  'GENERAL DIVISIÓN': 65,
}

function calcularEdadLimite(fechaNacimiento: string, nombreGrado?: string): string {
  const nacimiento = new Date(fechaNacimiento);
  const limite = nombreGrado ? (EDAD_LIMITE_POR_GRADO[nombreGrado] || 50) : 50;
  const fechaLimite = new Date(
    nacimiento.getFullYear() + limite,
    nacimiento.getMonth(),
    nacimiento.getDate()
  );
  return fechaLimite.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default Familiares
