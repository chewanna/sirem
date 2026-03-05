'use client'
import React, { useState } from 'react';
import { useAppState } from './acciones/estados';
import { ShieldCheck, X, Loader2 } from 'lucide-react';

const COLORES = [
    { id: 'ROJO', dot: 'bg-red-500' },
    { id: 'AZUL', dot: 'bg-blue-500' },
    { id: 'AMARILLO', dot: 'bg-yellow-500' },
    { id: 'MORADO', dot: 'bg-purple-500' },
];

const getColorConfig = (tipo: string) => {
    return COLORES.find(c => c.id === tipo) || { id: tipo, dot: 'bg-gray-500' };
};

// ── Historial de Conducta ───────────────────────────────────────────────
export function ConductaHistorial({ conductas }: { conductas: any[] }) {
    const { state } = useAppState();
    const isAdmin = state.usuario?.role === 'ADMINISTRADOR';

    if (!conductas || conductas.length === 0) {
        return (
            <div className="p-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-center py-5 text-[var(--text-muted)]">
                    <p className="text-xs font-black uppercase tracking-widest">Sin registros de inconsistencias</p>
                </div>
            </div>
        );
    }

    // Generate dynamic legend based on actual types present
    const tipos = Array.from(new Set(conductas.map(c => c.tipo)));

    return (
        <div className="border-[var(--border)]">
            <div className="flex flex-wrap gap-3 items-center justify-start">
                {isAdmin ? (
                    // Mostrar descripciones para Administrador
                    conductas.map((c: any, i: number) => {
                        const config = getColorConfig(c.tipo as string);
                        return (
                            <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                <span className={`w-3 h-3 rounded-full shadow-sm flex-shrink-0 ${config.dot}`} title={c.tipo} />
                                <span className="truncate max-w-[150px]" title={c.descripcion}>{c.descripcion}</span>
                            </div>
                        )
                    })
                ) : (
                    // Mostrar solo puntos para otros roles
                    tipos.map(tipo => {
                        const config = getColorConfig(tipo as string);
                        return (
                            <span
                                key={tipo as string}
                                className={`w-4 h-4 rounded-full shadow-sm ${config.dot}`}
                                title={tipo as string}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}

// ── Modal para agregar Conducta ───────────────────────────────────────────
export function ConductaModal({ personal, onClose, onSuccess }: { personal: any, onClose: () => void, onSuccess: (nuevaConducta: any) => void }) {
    const [tipoConducta, setTipoConducta] = useState(COLORES[0].id);
    const [descConducta, setDescConducta] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const guardarConducta = async () => {
        if (!tipoConducta.trim()) {
            setError('Seleccione un color.');
            return;
        }
        if (!descConducta.trim()) {
            setError('Escribe una descripción de la conducta.');
            return;
        }

        setGuardando(true);
        setError('');

        try {
            const res = await fetch('/api/conducta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_personal_militar: personal.id_personal_militar,
                    tipo: tipoConducta,
                    descripcion: descConducta.trim(),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                setError(err.error || 'Error al guardar.');
                setGuardando(false);
                return;
            }

            const nueva = await res.json();
            onSuccess(nueva);
        } catch {
            setError('Error de conexión.');
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[var(--text-primary)]">Registrar Inconsistencia</h3>
                            <p className="text-xs text-[var(--text-muted)] truncate max-w-[220px]">
                                {personal.grado?.abreviatura} {personal.nombre} {personal.apellido_paterno}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-[var(--surface-alt)] text-[var(--text-muted)] transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tipo de conducta (Color) */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Color de Inconsistencia</label>
                    <div className="flex gap-4 items-center">
                        {COLORES.map(color => (
                            <button
                                key={color.id}
                                onClick={() => { setTipoConducta(color.id); setError(''); }}
                                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${tipoConducta === color.id ? `ring-2 ring-offset-2 ${color.dot} border-white scale-110 shadow-md` : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'} ${color.dot}`}
                                title={color.id}
                            />
                        ))}
                    </div>
                </div>

                {/* Descripción */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Descripción</label>
                    <textarea
                        value={descConducta}
                        onChange={(e) => { setDescConducta(e.target.value); setError(''); }}
                        placeholder="Describe brevemente la conducta observada..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                    {error && (
                        <p className="text-xs text-red-500 font-medium">{error}</p>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={guardarConducta}
                        disabled={guardando}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {guardando
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                            : <><ShieldCheck className="w-4 h-4" /> Guardar</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

