import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/listados/[id]
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
        const id = parseInt(rawId, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        await prisma.listado.delete({ where: { id_listado: id } });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error al eliminar listado:", error);
        return NextResponse.json({ error: "Error al eliminar el listado" }, { status: 500 });
    }
}


// GET/api/listados/[id]
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
        const id = parseInt(rawId, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const listado = await prisma.listado.findUnique({ where: { id_listado: id } });
        return NextResponse.json(listado);
    } catch (error) {
        console.error("Error al obtener listado:", error);
        return NextResponse.json({ error: "Error al obtener el listado" }, { status: 500 });
    }
}

// PUT /api/listados/[id]
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
        const id = parseInt(rawId, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const body = await request.json();
        const { nombre, personalIds } = body as { nombre: string; personalIds: number[] };

        if (!nombre?.trim()) {
            return NextResponse.json({ error: "El nombre del listado es requerido" }, { status: 400 });
        }
        if (!personalIds || personalIds.length === 0) {
            return NextResponse.json({ error: "El listado no puede estar vacío" }, { status: 400 });
        }

        // Usamos una transacción para eliminar personal actual y recrearlo
        const listado = await prisma.$transaction(async (tx) => {
            await tx.listadoPersonal.deleteMany({
                where: { id_listado: id }
            });

            const actualizado = await tx.listado.update({
                where: { id_listado: id },
                data: {
                    nombre: nombre.trim()
                }
            });

            for (let idx = 0; idx < personalIds.length; idx++) {
                const idPersonal = personalIds[idx];
                await tx.listadoPersonal.create({
                    data: {
                        id_listado: id,
                        id_personal_militar: idPersonal,
                        orden: idx
                    }
                });
            }

            return actualizado;
        });

        return NextResponse.json(listado);
    } catch (error) {
        console.error("Error al actualizar listado:", error);
        return NextResponse.json({ error: "Error al actualizar el listado" }, { status: 500 });
    }
}
