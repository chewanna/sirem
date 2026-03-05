'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/componentes/ui/table";
import { useAppState } from "../componentes/acciones/estados";
import { useState, useEffect } from "react";

const Cargos = () => {
  const { state } = useAppState();
  const [cargos, setCargos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const idSeleccionado = state.idPersonalSeleccionado;
    if (!idSeleccionado) {
      setCargos([]);
      return;
    }

    const fetchCargos = async () => {
      setCargando(true);
      try {
        const res = await fetch(`/api/personal/cargos/${idSeleccionado}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCargos(data);
        } else {
          setCargos([]);
        }
      } catch (error) {
        console.error('Error al obtener cargos:', error);
        setCargos([]);
      } finally {
        setCargando(false);
      }
    };

    fetchCargos();
  }, [state.idPersonalSeleccionado]);

  return (
    <section>
      <div className="p-2 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Cargos y Comisiones</h1>
            <p className="text-[var(--text-secondary)]">
              Historial de cargos desempeñados
            </p>
          </div>
        </div>
      </div>

      {/*Resultados*/}
      <div className="grid grid-cols-1 gap-6">
        {/* Tabla */}
        <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[var(--surface-alt)]">
                <TableRow>
                  <TableHead className="font-bold text-[var(--text-primary)]">Grado</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Fecha de Cargo</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Cargo</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Unidad</TableHead>
                  <TableHead className="font-bold text-[var(--text-primary)]">Ubicación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargando ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[var(--text-secondary)]">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : cargos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[var(--text-secondary)]">
                      {state.idPersonalSeleccionado
                        ? 'No se encontraron cargos para este personal'
                        : 'Seleccione un personal desde Búsqueda'}
                    </TableCell>
                  </TableRow>
                ) : (
                  cargos.map((c) => (
                    <TableRow key={c.id_cargo} className="hover:bg-[var(--surface-alt)] text-[var(--text-primary)]">
                      <TableCell>{c.grado || '-'}</TableCell>
                      <TableCell>{c.fecha_cargo ? new Date(c.fecha_cargo).toLocaleDateString('es-MX') : '-'}</TableCell>
                      <TableCell>{c.cargo || '-'}</TableCell>
                      <TableCell>{c.unidad || '-'}</TableCell>
                      <TableCell>{c.ubicacion || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <footer className="p-3 bg-[var(--surface)] border-t border-[var(--border)]">
              <p className="text-red-600 font-black text-xs tracking-tighter uppercase">
                Registros localizados: {cargos.length}
              </p>
            </footer>
          </div>
        </section>
      </div>
    </section>
  )
}

export default Cargos