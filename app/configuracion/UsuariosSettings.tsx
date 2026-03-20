import { useEffect, useState } from "react";
import { useAppState } from "../componentes/acciones/estados";

export default function UsuariosSettings() {
    const { state } = useAppState();
    const [data, setData] = useState<any>(null);
    const [cargando, setCargando] = useState(true);
    const [filtroBusqueda, setFiltroBusqueda] = useState('');

    const [nuevo, setNuevo] = useState({ username: '', password: '', nombre: '', id_role: 3, id_mesa: '', id_grupo: '', id_subsec: '' });

    const load = () => {
        setCargando(true);
        fetch('/api/users')
            .then(res => res.json())
            .then(res => {
                if (!res.error) setData(res);
                setCargando(false);
            })
            .catch(() => setCargando(false));
    }

    useEffect(() => {
        if (state.usuario?.role === 'ADMINISTRADOR') {
            load();
        }
    }, [state.usuario]);

    if (state.usuario?.role !== 'ADMINISTRADOR') return null;

    const authFetch = async (url: string, method: string, body: any) => {
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const result = await res.json();

            if (!res.ok) {
                alert(result.error || 'Ocurrió un error en la operación');
                return false;
            }
            load();
            return true;
        } catch (error) {
            alert('Error al conectar con el servidor');
            return false;
        }
    };

    if (cargando || !data) return <div className="p-8">Cargando usuarios...</div>;

    const { users, roles, mesas, grupos, subsecciones } = data;

    const getRoleFromMesa = (mesaId: string | null) => {
        if (!mesaId) return 3; // Usuario regular sin mesa
        const mesa = mesas.find((m: any) => m.mesa_id == mesaId);
        if (mesa && (mesa.nombremesa || mesa.nombre)?.toLowerCase().includes('disciplina')) {
            return 2; // Rol 2: Disciplina y Oficiales
        }
        return 3; // Rol 3: Resto de las mesas
    };

    return (
        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-8">
            <h2 className="text-[var(--text-secondary)] text-xl font-semibold mb-2">Administración de Usuarios</h2>
            <p className="text-[var(--text-secondary)] mb-6">Crea nuevos usuarios y asigna permisos.</p>

            {/* Crear usuario */}
            <div className="bg-[var(--surface-alt)] p-4 rounded-lg mb-6 shadow-sm border border-[var(--border)]">
                <h3 className="font-bold text-[var(--text-secondary)] mb-3">Crear Usuario</h3>
                <div className="text-[var(--text-secondary)] grid grid-cols-2 gap-4 mb-4">
                    <input placeholder="Usuario (username)" value={nuevo.username} onChange={e => setNuevo({ ...nuevo, username: e.target.value })} className="p-2 border rounded text-sm" />
                    <input placeholder="Contraseña" type="password" value={nuevo.password} onChange={e => setNuevo({ ...nuevo, password: e.target.value })} className="p-2 border rounded text-sm" />
                    <input placeholder="Grado y nombre" value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} className="p-2 border rounded text-sm" />
                    <select
                        value={nuevo.id_mesa}
                        onChange={e => {
                            const val = e.target.value;
                            setNuevo({ ...nuevo, id_mesa: val, id_role: nuevo.id_role === 1 ? 1 : getRoleFromMesa(val) });
                        }}
                        className="p-2 border rounded text-sm text-[var(--text-secondary)]"
                    >
                        <option className="bg-[var(--surface-alt)] text-[var(--text-primary)]" value="">-- Sin Mesa (Usuario Regular) --</option>
                        {mesas.map((m: any) => <option className="bg-[var(--surface-alt)] text-[var(--text-secondary)]" key={m.mesa_id} value={m.mesa_id}>{m.nombre || m.nombremesa}</option>)}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-bold cursor-pointer">
                        <input
                            type="checkbox"
                            checked={nuevo.id_role === 1}
                            onChange={e => setNuevo({ ...nuevo, id_role: e.target.checked ? 1 : getRoleFromMesa(nuevo.id_mesa) })}
                            className="w-4 h-4 cursor-pointer"
                        />
                        Otorgar privilegios de Administrador
                    </label>
                </div>
                <button
                    onClick={async () => {
                        const exito = await authFetch('/api/users', 'POST', nuevo);
                        if (exito) {
                            setNuevo({ username: '', password: '', nombre: '', id_role: 3, id_mesa: '', id_grupo: '', id_subsec: '' });
                        }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 w-full"
                >
                    + Nuevo Usuario
                </button>
            </div>

            {/* Lista */}
            <div className="text-[var(--text-secondary)] mb-4">
                <input
                    type="text"
                    placeholder="Buscar por usuario o nombre..."
                    value={filtroBusqueda}
                    onChange={(e) => setFiltroBusqueda(e.target.value)}
                    className="w-full p-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-alt)] focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div className="space-y-4">
                {filtroBusqueda.trim() === '' ? (
                    <div className="text-center p-6 text-[var(--text-muted)] text-sm italic bg-[var(--surface-alt)] rounded-lg border border-dashed border-[var(--border)]">
                        Escribe un nombre o usuario en el buscador de arriba para mostrar resultados.
                    </div>
                ) : (
                    users.filter((u: any) =>
                        u.username.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
                        (u.nombre && u.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()))
                    ).map((u: any) => (
                        <div key={u.id_usuario} className="p-4 border border-[var(--border)] rounded-lg grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className={`font-bold ${u.activo === false ? 'text-red-500 line-through' : 'text-[var(--text-primary)]'}`}>
                                        {u.username}
                                    </p>
                                    {u.activo === false && (
                                        <span className="bg-red-100 text-red-700 text-[10px] px-2 rounded-full font-bold">INACTIVO</span>
                                    )}
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">{u.nombre}</p>

                                <div className="mt-2 flex gap-2">
                                    <label className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-secondary)] cursor-pointer bg-[var(--surface-alt)] px-2 py-1 rounded border border-[var(--border)] hover:bg-[var(--border)] transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={u.activo ?? true}
                                            onChange={(e) => {
                                                if (confirm(`¿${e.target.checked ? 'Activar' : 'Desactivar'} a ${u.username}?`)) {
                                                    authFetch(`/api/users/${u.id_usuario}`, 'PUT', {
                                                        id_role: u.id_role, id_mesa: u.id_mesa, id_grupo: u.id_grupo, id_subsec: u.id_subsec,
                                                        activo: e.target.checked
                                                    });
                                                }
                                            }}
                                            className="w-3 h-3"
                                        />
                                        Activo
                                    </label>

                                    <button
                                        onClick={() => {
                                            const newPassword = prompt(`Ingresa la nueva contraseña para ${u.username}:`);
                                            if (newPassword && newPassword.trim().length > 0) {
                                                authFetch(`/api/users/${u.id_usuario}`, 'PUT', {
                                                    id_role: u.id_role, id_mesa: u.id_mesa, id_grupo: u.id_grupo, id_subsec: u.id_subsec,
                                                    password: newPassword.trim()
                                                });
                                                alert(`Contraseña actualizada para ${u.username}`);
                                            }
                                        }}
                                        className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                    >
                                        Cambiar Clave
                                    </button>
                                </div>
                            </div>
                            <select
                                value={u.id_role}
                                onChange={(e) => authFetch(`/api/users/${u.id_usuario}`, 'PUT', { id_role: e.target.value, id_mesa: u.id_mesa, id_grupo: u.id_grupo, id_subsec: u.id_subsec })}
                                className="p-2 border rounded text-[10px] text-[var(--text-secondary)]"
                            >
                                {roles.map((r: any) => <option key={r.id_role} value={r.id_role}>{r.nombre || r.nombre_role}</option>)}
                            </select>
                            <select
                                value={u.id_subsec || ''}
                                onChange={(e) => authFetch(`/api/users/${u.id_usuario}`, 'PUT', { id_role: u.id_role, id_mesa: u.id_mesa, id_grupo: u.id_grupo, id_subsec: e.target.value || null })}
                                className="p-2 border rounded text-[10px] text-[var(--text-secondary)]"
                            >
                                <option value="">-- Subseccion --</option>
                                {subsecciones.map((s: any) => <option key={s.id_subseccion} value={s.id_subseccion}>{s.nombre || s.nombresubsec}</option>)}
                            </select>
                            <select
                                value={u.id_grupo || ''}
                                onChange={(e) => authFetch(`/api/users/${u.id_usuario}`, 'PUT', { id_role: u.id_role, id_mesa: u.id_mesa, id_grupo: e.target.value || null, id_subsec: u.id_subsec })}
                                className="p-2 border rounded text-[10px] text-[var(--text-secondary)]"
                            >
                                <option value="">-- Grupo --</option>
                                {grupos.map((g: any) => <option key={g.grupo_id} value={g.grupo_id}>{g.nombre || g.nombregrupo}</option>)}
                            </select>
                            <select
                                value={u.id_mesa || ''}
                                onChange={(e) => {
                                    const newMesaId = e.target.value || null;
                                    let updatedRole = u.id_role;
                                    if (updatedRole !== 1) {

                                        updatedRole = getRoleFromMesa(newMesaId);
                                    }
                                    authFetch(`/api/users/${u.id_usuario}`, 'PUT', { id_role: updatedRole, id_mesa: newMesaId, id_grupo: u.id_grupo, id_subsec: u.id_subsec });
                                }}
                                className="p-2 border rounded text-[10px] text-[var(--text-secondary)]"
                            >
                                <option value="">-- Mesa --</option>
                                {mesas.map((m: any) => <option key={m.mesa_id} value={m.mesa_id}>{m.nombre || m.nombremesa}</option>)}
                            </select>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
