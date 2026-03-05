import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/conducta?id_personal_militar=X
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idPersonal = searchParams.get("id_personal_militar");

    try {
        let conductas = await (prisma as any).conducta.findMany({
            where: idPersonal ? { id_personal_militar: parseInt(idPersonal) } : undefined,
            orderBy: { fecha: "desc" },
            include: {
                personal: {
                    select: {
                        nombre: true,
                        apellido_paterno: true,
                        apellido_materno: true,
                        matricula: true,
                    },
                },
            },
        });

        const user = await getUserFromToken();
        const isAdmin = user?.role === 'ADMINISTRADOR';

        // Usuarios de mesa de disciplina u oficiales NO pueden ver la descripción
        if (!isAdmin) {
            conductas = conductas.map((c: any) => ({ ...c, descripcion: 'Oculto por permisos' }));
        }

        return NextResponse.json(conductas);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al obtener conductas" }, { status: 500 });
    }
}

// POST /api/conducta
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id_personal_militar, tipo, descripcion } = body;

        const user = await getUserFromToken();
        if (!user) {
            return NextResponse.json({ error: "No autorizado." }, { status: 401 });
        }
        if (user.role === 'USUARIO_REGULAR') {
            return NextResponse.json({ error: "No tiene permisos para agregar conductas." }, { status: 403 });
        }

        if (!id_personal_militar || !tipo || !descripcion?.trim()) {
            return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
        }

        const conducta = await (prisma as any).conducta.create({
            data: {
                id_personal_militar: parseInt(id_personal_militar),
                tipo,
                descripcion: descripcion.trim(),
            },
        });

        return NextResponse.json(conducta, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al registrar conducta." }, { status: 500 });
    }
}
