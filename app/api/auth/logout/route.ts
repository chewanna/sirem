import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await getUserFromToken();

        if (session && session.id) {
            // Remove the active session from DB
            await prisma.usuario.update({
                where: { id_usuario: session.id },
                data: { session_id: null }
            });
        }

        const response = NextResponse.json({ success: true });

        // Clear the cookie
        response.cookies.delete('sismov_token');

        return response;

    } catch (error) {
        console.error('Error logging out:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
