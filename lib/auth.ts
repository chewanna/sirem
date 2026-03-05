import { cookies } from 'next/headers';
import * as jose from 'jose';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecret_local_dev_key');

export async function getUserFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('sismov_token')?.value;

    if (!token) return null;

    try {
        const { payload } = await jose.jwtVerify(token, JWT_SECRET);

        if (!payload.sessionId) return null;

        const user = await prisma.usuario.findUnique({
            where: { id_usuario: payload.id as number },
            select: { session_id: true }
        });

        if (!user || user.session_id !== payload.sessionId) {
            return null; // El token es de una sesión antigua
        }

        return payload as {
            id: number;
            username: string;
            role: string;
            id_mesa: number | null;
            id_grupo: number | null;
            id_subsec: number | null;
            sessionId: string;
        };
    } catch (e) {
        return null;
    }
}
