'use client'

import React, { useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';

interface Props {
    tipo: string;
    opciones: string[];
    placeholder?: string;
    onUpdate: () => void;
}

export const AdminCatalogo = ({ tipo, opciones, placeholder = "NUEVA OPCIÓN", onUpdate }: Props) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newValue, setNewValue] = useState("");

    const [editIndex, setEditIndex] = useState(-1);
    const [editValue, setEditValue] = useState("");

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newValue.trim()) return;

        const val = newValue.toUpperCase();
        try {
            await fetch('/api/catalogos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo, valor: val })
            });
            setNewValue("");
            setIsAdding(false);
            onUpdate();
        } catch (err) {
            console.error("Error al agregar", err);
        }
    };

    const handleDelete = async (e: React.MouseEvent, valor: string) => {
        e.preventDefault();
        if (!confirm(`¿Seguro que deseas eliminar la opción "${valor}"?`)) return;

        try {
            await fetch(`/api/catalogos?tipo=${encodeURIComponent(tipo)}&valor=${encodeURIComponent(valor)}`, {
                method: 'DELETE'
            });
            onUpdate();
        } catch (err) {
            console.error("Error al eliminar", err);
        }
    };

    const saveEdit = async (e: React.FormEvent, oldValue: string) => {
        e.preventDefault();
        if (!editValue.trim() || editValue === oldValue) {
            setEditIndex(-1);
            return;
        }

        try {
            const uppercaseNewValue = editValue.toUpperCase();
            await fetch('/api/catalogos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo, oldValue, newValue: uppercaseNewValue })
            });
            setEditIndex(-1);
            onUpdate();
        } catch (err) {
            console.error("Error al editar", err);
        }
    };

    return (
        <div className="mt-2 space-y-1">
            {/* List of current editable items */}
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-xs">
                {opciones.map((opt, i) => (
                    <div key={opt} className="flex items-center justify-between bg-[var(--surface-alt)] p-1 rounded group">
                        {editIndex === i ? (
                            <form onSubmit={(e) => saveEdit(e, opt)} className="flex-1 flex gap-1 items-center w-full">
                                <input
                                    autoFocus
                                    className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] px-1 py-0.5 border border-blue-400 rounded outline-none"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                />
                                <button type="submit" className="text-green-600 hover:bg-green-100 rounded p-0.5"><Check className="w-3 h-3" /></button>
                                <button type="button" onClick={() => setEditIndex(-1)} className="text-red-600 hover:bg-red-100 rounded p-0.5"><X className="w-3 h-3" /></button>
                            </form>
                        ) : (
                            <>
                                <span className="truncate flex-1 text-[var(--text-secondary)]" title={opt}>{opt}</span>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--surface-alt)] pl-1">
                                    <button type="button" onClick={(e) => { e.preventDefault(); setEditIndex(i); setEditValue(opt); }} className="p-1 hover:text-blue-600 text-[var(--text-muted)]"><Pencil className="w-3 h-3" /></button>
                                    <button type="button" onClick={(e) => handleDelete(e, opt)} className="p-1 hover:text-red-600 text-[var(--text-muted)]"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Add new button */}
            {isAdding ? (
                <form onSubmit={handleAdd} className="flex items-center gap-1 mt-1">
                    <input
                        type="text"
                        autoFocus
                        className="flex-1 text-xs px-2 py-1 border border-[var(--border)] rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                        placeholder={placeholder}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={!newValue.trim()}
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => { setIsAdding(false); setNewValue(""); }} className="p-1 bg-red-600 text-white rounded hover:bg-red-700"><X className="w-4 h-4" /></button>
                </form>
            ) : (
                <button type="button" onClick={() => setIsAdding(true)} className="flex items-center gap-1 text-[var(--text-muted)] hover:text-blue-500 text-xs mt-1 w-full p-1 border border-dashed border-[var(--border)] rounded justify-center">
                    <Plus className="w-3 h-3" /> Agregar nuevo
                </button>
            )}
        </div>
    );
};
