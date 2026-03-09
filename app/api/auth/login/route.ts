import { NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j';
import * as bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecret_local_dev_key');

export async function POST(req: Request) {
    const session = driver.session();
    try {
        const body = await req.json();
        const { usuario, contrasena } = body;

        if (!usuario || !contrasena) {
            return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
        }

        const result = await session.run(`
            MATCH (u:Usuario {username: $usuario})
            OPTIONAL MATCH (u)-[:TIENE_ROL]->(r:Role)
            OPTIONAL MATCH (u)-[:ASIGNADO_A]->(m:Mesa)
            OPTIONAL MATCH (m)-[:PERTENECE_A]->(g:Grupo)
            OPTIONAL MATCH (g)-[:PERTENECE_A]->(s:Subseccion)
            RETURN u, r, m, g, s
        `, { usuario });

        if (result.records.length === 0) {
            return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
        }

        const record = result.records[0];
        const userNode = record.get('u').properties;
        const userRole = record.get('r')?.properties;
        const userMesa = record.get('m')?.properties;
        const userGrupo = record.get('g')?.properties;
        const userSubseccion = record.get('s')?.properties;

        // userNode may not have 'activo' property explicitly if default, check boolean flag or assume true
        const isActivo = userNode.activo !== false && userNode.activo !== 'false';

        if (!isActivo) {
            return NextResponse.json({ error: 'La cuenta se encuentra desactivada, contacte al administrador.' }, { status: 403 });
        }

        const passwordMatch = await bcrypt.compare(contrasena, userNode.password || '');

        if (!passwordMatch) {
            return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
        }

        if (userNode.session_id) {
            return NextResponse.json({ error: 'El usuario ya está haciendo uso del sistema' }, { status: 403 });
        }

        const sessionId = crypto.randomUUID();

        // Update active session in DB
        await session.run(`
            MATCH (u:Usuario {id: $userId})
            SET u.session_id = $sessionId
        `, { userId: userNode.id, sessionId });

        // Generate JWT
        const token = await new jose.SignJWT({
            id: userNode.id,
            username: userNode.username,
            role: userRole?.nombre || 'USUARIO_REGULAR',
            id_mesa: userMesa?.id || null,
            id_grupo: userGrupo?.id || null,
            id_subsec: userSubseccion?.id || null,
            sessionId: sessionId
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('8h')
            .sign(JWT_SECRET);

        const response = NextResponse.json({
            success: true,
            user: {
                id: userNode.id,
                username: userNode.username,
                role: userRole?.nombre || 'USUARIO_REGULAR',
                nombre: userNode.nombre,
                mesa: userMesa?.nombre || null
            }
        });

        // Set HttpOnly cookie
        response.cookies.set('sismov_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Error logging in:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    } finally {
        await session.close();
    }
}
