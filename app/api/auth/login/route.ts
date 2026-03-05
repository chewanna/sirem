import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jose from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecret_local_dev_key');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { usuario, contrasena } = body;

        if (!usuario || !contrasena) {
            return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
        }

        const user = await prisma.usuario.findUnique({
            where: { username: usuario },
            include: {
                role: true,
                mesa: true,
                grupo: true,
                subseccion: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
        }

        if (!user.activo) {
            return NextResponse.json({ error: 'La cuenta se encuentra desactivada, contacte al administrador.' }, { status: 403 });
        }

        const passwordMatch = await bcrypt.compare(contrasena, user.password);

        if (!passwordMatch) {
            return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
        }

        if (user.session_id) {
            return NextResponse.json({ error: 'El usuario ya está haciendo uso del sistema' }, { status: 403 });
        }

        const sessionId = crypto.randomUUID();

        // Update active session in DB
        await prisma.usuario.update({
            where: { id_usuario: user.id_usuario },
            data: { session_id: sessionId }
        });

        // Generate JWT
        const token = await new jose.SignJWT({
            id: user.id_usuario,
            username: user.username,
            role: user.role.nombre_role,
            id_mesa: user.id_mesa,
            id_grupo: user.id_grupo,
            id_subsec: user.id_subsec,
            sessionId: sessionId
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('8h')
            .sign(JWT_SECRET);

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id_usuario,
                username: user.username,
                role: user.role.nombre_role,
                nombre: user.nombre,
                mesa: user.mesa?.nombremesa || null
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
    }
}
