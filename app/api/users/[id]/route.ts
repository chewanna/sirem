import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getUserFromToken();
    try {
        const idStr = (await params).id;
        const body = await req.json();

        const { id_role, id_mesa, id_grupo, id_subsec, password, activo } = body;

        const updateData: any = {};

        if (id_role !== undefined) updateData.id_role = parseInt(id_role);
        if (id_mesa !== undefined) updateData.id_mesa = id_mesa ? parseInt(id_mesa) : null;
        if (id_grupo !== undefined) updateData.id_grupo = id_grupo ? parseInt(id_grupo) : null;
        if (id_subsec !== undefined) updateData.id_subsec = id_subsec ? parseInt(id_subsec) : null;
        if (activo !== undefined) updateData.activo = Boolean(activo);

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updated = await (prisma as any).usuario.update({
            where: { id_usuario: parseInt(idStr) },
            data: updateData
        });

        return NextResponse.json({ ...updated, message: 'Usuario actualizado correctamente' });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
    }
}
