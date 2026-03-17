'use client'
import { MapPin, Calendar, Briefcase, Clock, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useAppState } from "./acciones/estados"
import { ExportarCaratula } from "./acciones/exportar";
import { ConductaHistorial } from "./Conducta";

const Resultado = () => {
  const { state } = useAppState();
  const [personal, setPersonal] = useState<any>(null);
  const [conductas, setConducatas] = useState<any[]>([]);
  const [fotoError, setFotoError] = useState(false);
  const [extIndex, setExtIndex] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const EXTENSIONES = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG', '.webp'];

  const formatDate = (date: any) => date ? new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() : '-';

  const calculateTime = (dateStr: any) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    let years = now.getFullYear() - date.getFullYear();
    let months = now.getMonth() - date.getMonth();
    let days = now.getDate() - date.getDate();
    if (days < 0) { months--; days += 30; }
    if (months < 0) { years--; months += 12; }
    return `${years} AÑOS, ${months} MESES, ${days} DIAS.`;
  };

  useEffect(() => {
    setFotoError(false);
    setExtIndex(0);
    if (state.idPersonalSeleccionado) {
      fetch(`/api/personal/id/${state.idPersonalSeleccionado}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) console.error(data.error);
          else {
            setPersonal(data);
            setConducatas(data.conductas || []);
          }
        })
        .catch(err => console.error(err));
    } else {
      setPersonal(null);
      setConducatas([]);
    }
  }, [state.idPersonalSeleccionado]);

  if (!personal) return (
    <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-8 text-center text-[var(--text-muted)]">
      Seleccione un registro para ver los detalles.
    </section>
  );

  return (
    <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col h-auto sticky top-2">
      <header className="border-b border-[var(--border)] flex justify-between items-center px-2 py-1">
        <div className="flex gap-2">
          <ExportarCaratula personal={[personal]} />
        </div>
      </header>

      <div className="p-2">
        <div className="flex flex-col md:flex-row gap-4 items-start mb-1">
          <div className="grid">
            <div className="relative w-24 h-32 rounded-lg border-4 border-white shadow-md overflow-hidden bg-gray-200 flex items-center justify-center">
              {fotoError ? (
                <div className="text-gray-500 text-[10px] font-bold">SIN FOTO</div>
              ) : (
                <img
                  src={personal.foto_url || (personal.matricula ? `/fotos/${personal.matricula.replace(/-/g, '')}${EXTENSIONES[extIndex]}` : '')}
                  alt="Foto"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="w-full h-full object-cover absolute inset-0 cursor-pointer hover:scale-110 transition-transform duration-300"
                  onError={() => {
                    if (extIndex < EXTENSIONES.length - 1) {
                      setExtIndex(extIndex + 1);
                    } else {
                      setFotoError(true);
                    }
                  }}
                />
              )}
            </div>
            <div className="mt-1 text-center font-mono font-bold text-xs text-[var(--text-secondary)]">
              ({personal.matricula})
            </div>
          </div>


          <div className="flex-1 space-y-2">
            <div>
              <div className="text-right text-red-600 font-black text-[10px] tracking-tighter uppercase">
                EDAD LIMITE: {calcularEdadLimite(personal.fecha_nacimiento, personal.grado?.nombre_grado)}
              </div>
              <h3 className="text-2xl font-black text-[var(--text-secondary)] leading-none uppercase">
                {personal.grado?.abreviatura} {personal.arma_servicio?.nombre_servicio} {personal.profesion} {personal.nombre} {personal.apellido_paterno} {personal.apellido_materno}
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-tight">
                SITUACIÓN: {personal.situacion || 'ACTIVO'}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--surface-alt)] text-[var(--text-secondary)] rounded-full text-[10px] font-black uppercase tracking-tight">
                <MapPin className="w-3 h-3" /> Unidad: {personal.organismo?.nombre_organismo || 'SIN ASIGNAR'}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--surface-alt)] text-[var(--text-secondary)] rounded-full text-[10px] font-black uppercase tracking-tight">
                <MapPin className="w-3 h-3" /> Region: {personal.region_militar?.nombre_region_militar || '-'}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--surface-alt)] text-[var(--text-secondary)] rounded-full text-[10px] font-black uppercase tracking-tight">
                <MapPin className="w-3 h-3" /> Zona: {personal.zona_militar?.nombre_zona_militar || '-'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--surface-alt)] text-[var(--text-secondary)] rounded-full text-[10px] font-black uppercase tracking-tight">
                <MapPin className="w-3 h-3" /> Originario: {personal.lugar_nacimiento || 'DESCONOCIDO'}
              </span>
            </div>
            <ConductaHistorial conductas={conductas} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 px-2 pb-2">
        <div className="bg-[var(--background)] p-3 rounded-xl border border-salte-100">
          <div className="flex items-center gap-1 text-[var(--text-muted)] mb-1">
            <Clock className="w-3 h-3"></Clock>
            <span className="text-[9px] font-black uppercase tracking-widest">Desde</span>
          </div>
          <div className="text-xs font-bold text-[var(--text-secondary)]">
            {formatDate(personal.historial_ascensos?.[0]?.fecha_ascenso)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200">
            <div className="text-[8px] text-[var(--text-muted)] font-bold uppercase">Tiempo acumulado</div>
            <div className="text-[10px] font-black text-[var(--text-secondary)]">{calculateTime(personal.historial_ascensos?.[0]?.fecha_ascenso)}</div>
          </div>
        </div>

        <div className="bg-[var(--background)] p-3 rounded-xl border border-salte-100">
          <div className="flex items-center gap-1 text-[var(--text-muted)] mb-1">
            <Calendar className="w-3 h-3"></Calendar>
            <span className="text-[9px] font-black uppercase tracking-widest">Fecha de Ingreso</span>
          </div>
          <div className="text-xs font-bold text-[var(--text-secondary)]">
            {formatDate(personal.fecha_ingreso)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200">
            <div className="text-[8px] text-[var(--text-muted)] font-bold uppercase">Tiempo acumulado</div>
            <div className="text-[10px] font-black text-[var(--text-secondary)]">{calculateTime(personal.fecha_ingreso)}</div>
          </div>
        </div>

        <div className="bg-[var(--background)] p-3 rounded-xl border border-salte-100">
          <div className="flex items-center gap-1 text-[var(--text-muted)] mb-1">
            <Calendar className="w-3 h-3"></Calendar>
            <span className="text-[9px] font-black uppercase tracking-widest">Fecha de Nacimiento</span>
          </div>
          <div className="text-xs font-bold text-[var(--text-secondary)]">
            {formatDate(personal.fecha_nacimiento)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200">
            <div className="text-[8px] text-[var(--text-muted)] font-bold uppercase">Edad</div>
            <div className="text-[10px] font-black text-[var(--text-secondary)]">{calculateTime(personal.fecha_nacimiento)}</div>
          </div>
        </div>

        <div className="bg-[var(--background)] p-3 rounded-xl border border-salte-100">
          <div className="flex items-center gap-1 text-[var(--text-muted)] mb-1">
            <Briefcase className="w-3 h-3"></Briefcase>
            <span className="text-[9px] font-black uppercase tracking-widest"> Fecha de Empleo</span>
          </div>
          <div className="text-xs font-bold text-[var(--text-secondary)]">
            {formatDate(personal.historial_adscripcion?.[0]?.fecha_inicio || personal.fecha_ingreso)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200">
            <div className="text-[8px] text-[var(--text-muted)] font-bold uppercase">Tiempo acumulado</div>
            <div className="text-[10px] font-black text-[var(--text-secondary)]">{calculateTime(personal.historial_adscripcion?.[0]?.fecha_inicio || personal.fecha_ingreso)}</div>
          </div>
        </div>

      </div>

      {isPhotoModalOpen && !fotoError && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full flex justify-center animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-12 right-0 p-2 text-white hover:text-red-400 transition-colors z-50 bg-black/50 hover:bg-black/80 rounded-full"
              onClick={() => setIsPhotoModalOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={personal.foto_url || (personal.matricula ? `/fotos/${personal.matricula.replace(/-/g, '')}${EXTENSIONES[extIndex]}` : '')}
              alt="Foto Ampliada"
              className="max-w-full max-h-[85vh] object-contain border-4 border-white shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-md"
            />
          </div>
        </div>,
        document.body
      )}

    </section >
  )
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
  const limite = nombreGrado ? (EDAD_LIMITE_POR_GRADO[nombreGrado] || 50) : 65;

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

export default Resultado
