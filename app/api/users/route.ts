import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getUserFromToken();
    try {
        const users = await (prisma as any).usuario.findMany({
            include: {
                role: true,
                mesa: true,
                grupo: true,
                subseccion: true
            },
            orderBy: { id_usuario: 'asc' }
        });

        const roles = await (prisma as any).role.findMany();
        const mesas = await (prisma as any).mesa.findMany();
        const grupos = await (prisma as any).grupo.findMany();
        const subsecciones = await (prisma as any).subseccion.findMany();

        return NextResponse.json({ users, roles, mesas, grupos, subsecciones });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getUserFromToken();

    try {
        const body = await req.json();
        const { username, password, nombre, id_role, id_mesa, id_grupo, id_subsec } = body;

        if (!username || username.trim() === '') {
            return NextResponse.json({ error: 'El nombre de usuario es obligatorio.' }, { status: 400 });
        }

        // Check if username already exists
        const existing = await (prisma as any).usuario.findUnique({
            where: { username }
        });

        if (existing) {
            return NextResponse.json({ error: 'El nombre de usuario ya existe.' }, { status: 400 });
        }

        const hashed = await bcrypt.hash(password || '1234', 10);

        let finalGrupo = id_grupo ? parseInt(id_grupo) : null;
        let finalSubsec = id_subsec ? parseInt(id_subsec) : null;

        // Auto-asignar grupo y subsección si se provee una mesa
        if (id_mesa) {
            const mesa = await (prisma as any).mesa.findUnique({
                where: { mesa_id: parseInt(id_mesa) }
            });
            if (mesa) {
                finalGrupo = finalGrupo || mesa.grupopert;
                finalSubsec = finalSubsec || mesa.subsecpert;
            }
        }

        const newUser = await (prisma as any).usuario.create({
            data: {
                username,
                password: hashed,
                nombre: nombre || null,
                id_role: parseInt(id_role) || 3,
                id_mesa: id_mesa ? parseInt(id_mesa) : null,
                id_grupo: finalGrupo,
                id_subsec: finalSubsec
            }
        });

        return NextResponse.json({ ...newUser, message: 'Usuario creado correctamente' }, { status: 201 });
    } catch (e: any) {
        console.error('Error al crear usuario:', e);
        return NextResponse.json({ error: 'Error al crear usuario', details: e.message }, { status: 500 });
    }
}
