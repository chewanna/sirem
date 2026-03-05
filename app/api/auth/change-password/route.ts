import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: 'Debe proporcionar la contraseña actual y la nueva' },
                { status: 400 }
            );
        }

        // Obtener el usuario de la sesión actual
        const session = await getUserFromToken();

        if (!session || !session.id) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const userId = session.id;

        // Buscar al usuario en la base de datos
        const user = await prisma.usuario.findUnique({
            where: { id_usuario: userId }
        });

        if (!user) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }

        // Verificar la contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return NextResponse.json({ message: 'La contraseña actual es incorrecta' }, { status: 400 });
        }

        // Hashear la nueva contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña en la base de datos
        await prisma.usuario.update({
            where: { id_usuario: userId },
            data: { password: hashedNewPassword }
        });

        return NextResponse.json(
            { message: 'Contraseña actualizada correctamente' },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error al cambiar contraseña:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor al cambiar la contraseña' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
