import { NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j';
import { getUserFromToken } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    const userInfo = await getUserFromToken();
    const session = driver.session();

    try {
        const usersResult = await session.run(`
            MATCH (u:Usuario)
            OPTIONAL MATCH (u)-[:TIENE_ROL]->(r:Role)
            OPTIONAL MATCH (u)-[:ASIGNADO_A]->(m:Mesa)
            RETURN u, r, m ORDER BY u.id ASC
        `);

        const users = usersResult.records.map(record => {
            const user = record.get('u').properties;
            const role = record.get('r')?.properties;
            const mesa = record.get('m')?.properties;
            return {
                ...user,
                id_usuario: user.id || user.id_usuario,
                role: role || null,
                mesa: mesa || null
            };
        });

        const rolesResult = await session.run('MATCH (n:Role) RETURN n');
        const roles = rolesResult.records.map(r => {
            const p = r.get('n').properties;
            return { ...p, id_role: p.id };
        });

        const mesasResult = await session.run('MATCH (n:Mesa) RETURN n');
        const mesas = mesasResult.records.map(r => {
            const p = r.get('n').properties;
            return { ...p, mesa_id: p.id };
        });

        const gruposResult = await session.run('MATCH (n:Grupo) RETURN n');
        const grupos = gruposResult.records.map(r => {
            const p = r.get('n').properties;
            return { ...p, grupo_id: p.id };
        });

        const subseccionesResult = await session.run('MATCH (n:Subseccion) RETURN n');
        const subsecciones = subseccionesResult.records.map(r => {
            const p = r.get('n').properties;
            return { ...p, id_subseccion: p.id };
        });

        return NextResponse.json({ users, roles, mesas, grupos, subsecciones });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    } finally {
        await session.close();
    }
}

export async function POST(req: Request) {
    const userInfo = await getUserFromToken();
    const session = driver.session();

    try {
        const body = await req.json();
        const { username, password, nombre, id_role, id_mesa, id_grupo, id_subsec } = body;

        if (!username || username.trim() === '') {
            return NextResponse.json({ error: 'El nombre de usuario es obligatorio.' }, { status: 400 });
        }

        // Check if username already exists
        const existingResult = await session.run(`MATCH (u:Usuario {username: $username}) RETURN u`, { username });

        if (existingResult.records.length > 0) {
            return NextResponse.json({ error: 'El nombre de usuario ya existe.' }, { status: 400 });
        }

        const hashed = await bcrypt.hash(password || '1234', 10);
        const newId = crypto.randomUUID();

        await session.run(`
            CREATE (u:Usuario {
                id: $newId,
                username: $username,
                password: $hashed,
                nombre: $nombre,
                activo: true
            })
        `, {
            newId,
            username,
            hashed,
            nombre: nombre || null
        });

        if (id_role) {
            await session.run(`
                MATCH (u:Usuario {id: $newId}), (r:Role {id: $id_role})
                CREATE (u)-[:TIENE_ROL]->(r)
            `, { newId, id_role });
        }

        if (id_mesa) {
            await session.run(`
                MATCH (u:Usuario {id: $newId}), (m:Mesa {id: $id_mesa})
                CREATE (u)-[:ASIGNADO_A]->(m)
            `, { newId, id_mesa });
        }

        // Recuperar el usuario recién creado
        const newResult = await session.run(`MATCH (u:Usuario {id: $newId}) RETURN u`, { newId });
        const newUser = newResult.records[0].get('u').properties;

        return NextResponse.json({ ...newUser, message: 'Usuario creado correctamente' }, { status: 201 });
    } catch (e: any) {
        console.error('Error al crear usuario:', e);
        return NextResponse.json({ error: 'Error al crear usuario', details: e.message }, { status: 500 });
    } finally {
        await session.close();
    }
}
