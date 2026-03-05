import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: "Se requiere un arreglo de ids." }, { status: 400 });
        }

        const tokenUser = await getUserFromToken();
        let userInfo = { nombre: "USUARIO DESCONOCIDO", mesa: "SIN MESA", grupo: "SIN GRUPO" };

        if (tokenUser && tokenUser.id) {
            const dbUser = await (prisma as any).usuario.findUnique({
                where: { id_usuario: tokenUser.id },
                include: { mesa: true, grupo: true }
            });
            if (dbUser) {
                userInfo = {
                    nombre: dbUser.nombre || dbUser.username,
                    mesa: dbUser.mesa?.nombremesa?.toUpperCase() || "SIN MESA ASIGNADA",
                    grupo: dbUser.grupo?.nombregrupo?.toUpperCase() || "SIN GRUPO ASIGNADO"
                };
            }
        }

        const personal = await prisma.personalMilitar.findMany({
            where: {
                id_personal_militar: { in: ids }
            },
            include: {
                grado: true,
                arma_servicio: true,
                organismo: true,
                zona_militar: true,
                conductas: true
            },
            orderBy: [
                { id_grado: 'desc' },
                { apellido_paterno: 'asc' }
            ]
        });

        return NextResponse.json({ personal, userInfo });
    } catch (error) {
        console.error("Error obteniendo personal para exportación:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
