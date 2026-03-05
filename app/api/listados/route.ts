import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/listados
export async function GET() {
    try {
        const listados = await prisma.listado.findMany({
            orderBy: { fecha: "desc" },
            include: {
                personal: true,
            },
        });

        const listadosConPersonal = await Promise.all(
            listados.map(async (listado) => {
                const listadoPersonalOrdenado = listado.personal.sort((a, b) => a.orden - b.orden);
                const ids = listadoPersonalOrdenado.map((lp) => lp.id_personal_militar);

                const personalDesordenado = await prisma.personalMilitar.findMany({
                    where: { id_personal_militar: { in: ids } },
                    select: {
                        id_personal_militar: true,
                        matricula: true,
                        nombre: true,
                        apellido_paterno: true,
                        apellido_materno: true,
                        grado: { select: { abreviatura: true } },
                        arma_servicio: { select: { nombre_servicio: true } },
                    },
                });

                // Mapear al personal devuelto ordenándolo de acuerdo al identificador original
                const personal = ids.map(id => personalDesordenado.find(p => p.id_personal_militar === id)).filter(Boolean);

                return {
                    id_listado: listado.id_listado,
                    nombre: listado.nombre,
                    fecha: listado.fecha,
                    personal,
                };
            })
        );

        return NextResponse.json(listadosConPersonal);
    } catch (error) {
        console.error("Error al obtener listados:", error);
        return NextResponse.json({ error: "Error al obtener listados" }, { status: 500 });
    }
}

// POST /api/listados
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombre, personalIds } = body as { nombre: string; personalIds: number[] };

        if (!nombre?.trim()) {
            return NextResponse.json({ error: "El nombre del listado es requerido" }, { status: 400 });
        }
        if (!personalIds || personalIds.length === 0) {
            return NextResponse.json({ error: "El listado no puede estar vacío" }, { status: 400 });
        }

        const listado = await prisma.listado.create({
            data: {
                nombre: nombre.trim(),
                personal: {
                    create: personalIds.map((id, idx) => ({
                        id_personal_militar: id,
                        orden: idx
                    })),
                },
            },
        });

        return NextResponse.json(listado, { status: 201 });
    } catch (error) {
        console.error("Error al guardar listado:", error);
        return NextResponse.json({ error: "Error al guardar el listado" }, { status: 500 });
    }
}
