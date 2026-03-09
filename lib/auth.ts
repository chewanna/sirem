import { cookies } from 'next/headers';
import * as jose from 'jose';
import { driver } from './neo4j';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecret_local_dev_key');

export async function getUserFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('sismov_token')?.value;

    if (!token) return null;

    try {
        const { payload } = await jose.jwtVerify(token, JWT_SECRET);

        if (!payload.sessionId) return null;

        const session = driver.session();
        let userSessionId: string | null = null;
        try {
            const result = await session.run(
                'MATCH (u:Usuario {id: $id}) RETURN u.session_id AS session_id',
                { id: payload.id as string }
            );
            if (result.records.length > 0) {
                userSessionId = result.records[0].get('session_id');
            }
        } finally {
            await session.close();
        }

        if (!userSessionId || userSessionId !== payload.sessionId) {
            return null; // El token es de una sesión antigua
        }

        return payload as {
            id: string;
            username: string;
            role: string;
            id_mesa: string | null;
            id_grupo: string | null;
            id_subsec: string | null;
            sessionId: string;
        };
    } catch (e) {
        return null;
    }
}
