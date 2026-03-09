import { NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j';
import * as bcrypt from 'bcryptjs';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: Request) {
    const session = driver.session();
    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: 'Debe proporcionar la contraseña actual y la nueva' },
                { status: 400 }
            );
        }

        // Obtener el usuario de la sesión actual
        const userInfo = await getUserFromToken();

        if (!userInfo || !userInfo.id) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const userId = userInfo.id;

        // Buscar al usuario en la base de datos
        const result = await session.run(`MATCH (u:Usuario {id: $userId}) RETURN u`, { userId });

        if (result.records.length === 0) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }

        const user = result.records[0].get('u').properties;

        // Verificar la contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, user.password || '');

        if (!isValidPassword) {
            return NextResponse.json({ message: 'La contraseña actual es incorrecta' }, { status: 400 });
        }

        // Hashear la nueva contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña en la base de datos
        await session.run(`
            MATCH (u:Usuario {id: $userId})
            SET u.password = $hashedNewPassword
            RETURN u
        `, { userId, hashedNewPassword });

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
        await session.close();
    }
}
