import { NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: Request) {
    const session = driver.session();
    try {
        const userInfo = await getUserFromToken();

        if (userInfo && userInfo.id) {
            // Remove the active session from DB
            await session.run(`
                MATCH (u:Usuario {id: $userId})
                SET u.session_id = null
            `, { userId: userInfo.id });
        }

        const response = NextResponse.json({ success: true });

        // Clear the cookie
        response.cookies.delete('sismov_token');

        return response;

    } catch (error) {
        console.error('Error logging out:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    } finally {
        await session.close();
    }
}
