"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Database, Brain, Zap, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    intent?: 'sql' | 'mql' | 'cypher' | 'vector' | 'hybrid' | 'conversational';
    query?: string | any;
    vectorQuery?: string;
    results?: any[];
    error?: string;
}

const INTENT_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    sql: { label: 'Consulta SQL', icon: <Database className="w-3 h-3" />, color: '#3b82f6' },
    mql: { label: 'Consulta MQL', icon: <Database className="w-3 h-3" />, color: '#10b981' },
    cypher: { label: 'Consulta Cypher', icon: <Database className="w-3 h-3" />, color: '#6366f1' },
    vector: { label: 'Búsqueda por Perfil', icon: <Brain className="w-3 h-3" />, color: '#8b5cf6' },
    hybrid: { label: 'Búsqueda Híbrida', icon: <Zap className="w-3 h-3" />, color: '#f59e0b' },
    conversational: { label: 'Conversación', icon: <MessageSquare className="w-3 h-3" />, color: '#10b981' },
};

export default function IAView() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: '¡Hola! Soy tu asistente inteligente de SIREM. Puedo ayudarte a:\n\n• *Consultar datos* — "¿Cuántos candidatos hay de Infantería?"\n• *Buscar perfiles* — "Mejor candidato para seguridad aeroportuaria"\n• *Búsquedas combinadas* — "Coronel de Ingenieros ideal para infraestructura"\n\n¿En qué puedo asistirte?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.error || 'Error al procesar la solicitud.',
                    error: data.error
                }]);
                return;
            }

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: data.synthesis || data.error || 'Sin respuesta.',
                intent: data.intent,
                query: data.query,
                vectorQuery: data.vectorQuery,
                results: data.results,
                error: data.error
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Error de conexión con el servidor. Verifica que los servicios estén activos.',
                error: 'Connection error'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 h-[calc(100vh-2rem)] flex flex-col">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Asistente de IA</h1>

            <div className="flex-1 bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xl shadow-sm">
                        <Bot />
                    </div>
                    <div>
                        <h2 className="m-0 text-lg font-bold text-[var(--text-secondary)]">SIREM</h2>
                        <span className="text-xs text-green-600 font-bold flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                            En línea
                        </span>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 bg-[var(--background)]">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-3 max-w-[90%] md:max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>

                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 shadow-sm ${m.role === 'user'
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-secondary)]'
                                }`}>
                                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                {/* Intent Badge */}
                                {m.role === 'assistant' && m.intent && INTENT_CONFIG[m.intent] && (
                                    <div
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-1.5"
                                        style={{
                                            backgroundColor: INTENT_CONFIG[m.intent].color + '15',
                                            color: INTENT_CONFIG[m.intent].color,
                                            border: `1px solid ${INTENT_CONFIG[m.intent].color}30`
                                        }}
                                    >
                                        {INTENT_CONFIG[m.intent].icon}
                                        {INTENT_CONFIG[m.intent].label}
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === 'user'
                                    ? 'bg-[var(--primary)] text-white rounded-tr-sm'
                                    : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] rounded-tl-sm'
                                    }`}>
                                    {m.content}
                                </div>

                                {/* Resultados obtenidos de la Base de Datos */}
                                {m.role === 'assistant' && m.results && m.results.length > 0 && (
                                    <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] shadow-sm">
                                        <table className="min-w-full text-[12px] bg-[var(--surface)]">
                                            <thead className="bg-[var(--surface-alt)]">
                                                <tr className="text-[var(--text-secondary)] uppercase tracking-wider">
                                                    {Object.keys(m.results[0]).map(key => (
                                                        <th key={key} className="px-4 py-2.5 text-left font-semibold border-b border-[var(--border)]">
                                                            {key.replace(/_/g, ' ')}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)]">
                                                {m.results.map((row, idx) => (
                                                    <tr key={idx} className="text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors">
                                                        {Object.values(row).map((val: any, j) => (
                                                            <td key={j} className="px-4 py-2 whitespace-nowrap">
                                                                {val !== null && val !== undefined
                                                                    ? (typeof val === 'object' ? JSON.stringify(val) : String(val))
                                                                    : '-'}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Collapsible Details */}
                                {m.role === 'assistant' && (m.query || (m.results && m.results.length > 0)) && (
                                    <DetailsSection query={m.query} results={m.results} vectorQuery={m.vectorQuery} intent={m.intent} />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex gap-3 max-w-[85%] self-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="w-8 h-8 rounded-full bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] text-sm shrink-0 shadow-sm">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-[var(--surface)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-3 text-[var(--text-muted)] text-[13px] shadow-sm font-medium">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                                Analizando consulta...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)]">
                    <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe un mensaje aquí..."
                            disabled={isLoading}
                            className="w-full py-3.5 pl-5 pr-14 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all disabled:opacity-60"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${input.trim() && !isLoading
                                ? 'bg-[var(--primary)] text-white hover:opacity-90 shadow-md scale-100'
                                : 'bg-[var(--surface-alt)] text-[var(--text-muted)] cursor-not-allowed scale-95 opacity-70'
                                }`}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                        <p className="text-center text-[10px] text-[var(--text-muted)] mt-2 font-bold uppercase tracking-widest opacity-60">
                            La IA clasifica tu consulta automáticamente: Cypher · Vectores · Híbrido
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

function DetailsSection({ query, results, vectorQuery, intent }: { query?: string | any; results?: any[]; vectorQuery?: string; intent?: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mt-2.5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-bold uppercase tracking-tight py-1"
            >
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {isOpen ? 'Ocultar detalles técnicos' : 'Ver detalles técnicos'}
            </button>

            {isOpen && (
                <div className="mt-2 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] shadow-sm">
                    {query && (
                        <div className="mb-2.5">
                            <strong className="text-[var(--text-primary)] block mb-1 text-[11px] uppercase tracking-wider font-extrabold">Consulta {intent === 'mql' ? 'MQL' : intent === 'cypher' ? 'Cypher' : 'SQL'}:</strong>
                            <pre className="bg-slate-900 text-slate-300 p-3 rounded-md overflow-x-auto text-[10px] font-mono leading-relaxed border border-slate-700 shadow-inner">
                                {typeof query === 'object' ? JSON.stringify(query, null, 2) : query}
                            </pre>
                        </div>
                    )}
                    {vectorQuery && (
                        <div>
                            <strong className="text-[var(--text-primary)] text-[11px] uppercase tracking-wider font-extrabold mr-1.5">Búsqueda vectorial:</strong>
                            <span className="italic text-[var(--text-muted)] bg-[var(--surface-alt)] px-2 py-0.5 rounded border border-[var(--border)]">"{vectorQuery}"</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}