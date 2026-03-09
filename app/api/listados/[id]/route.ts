import { NextResponse } from "next/server";
import { driver } from "@/lib/neo4j";

export const dynamic = "force-dynamic";

// DELETE /api/listados/[id]
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = driver.session();
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        await session.run('MATCH (l:Listado {id: $id}) DETACH DELETE l', { id });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error al eliminar listado:", error);
        return NextResponse.json({ error: "Error al eliminar el listado" }, { status: 500 });
    } finally {
        await session.close();
    }
}


// GET/api/listados/[id]
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = driver.session();
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const result = await session.run('MATCH (l:Listado {id: $id}) RETURN l', { id });
        if (result.records.length === 0) {
            return NextResponse.json({ error: "Listado no encontrado" }, { status: 404 });
        }

        const listado = result.records[0].get('l').properties;
        return NextResponse.json(listado);
    } catch (error) {
        console.error("Error al obtener listado:", error);
        return NextResponse.json({ error: "Error al obtener el listado" }, { status: 500 });
    } finally {
        await session.close();
    }
}

// PUT /api/listados/[id]
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = driver.session();
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const body = await request.json();
        const { nombre, personalIds } = body as { nombre: string; personalIds: string[] };

        if (!nombre?.trim()) {
            return NextResponse.json({ error: "El nombre del listado es requerido" }, { status: 400 });
        }
        if (!personalIds || personalIds.length === 0) {
            return NextResponse.json({ error: "El listado no puede estar vacío" }, { status: 400 });
        }

        // format personalIds to objects with order
        const personalData = personalIds.map((pid, idx) => ({ id: pid, orden: idx }));

        const tx = session.beginTransaction();
        let listadoActualizado;

        try {
            // Eliminar relaciones previas
            await tx.run('MATCH (l:Listado {id: $id})-[r:TIENE_PERSONAL]->() DELETE r', { id });

            // Actualizar nombre y crear nuevas relaciones
            const result = await tx.run(`
                MATCH (l:Listado {id: $id})
                SET l.nombre = $nombre
                WITH l
                UNWIND $personalData AS person
                MATCH (p:PersonalMilitar {id: person.id})
                CREATE (l)-[:TIENE_PERSONAL {orden: person.orden}]->(p)
                RETURN DISTINCT l
            `, { id, nombre: nombre.trim(), personalData });

            await tx.commit();

            if (result.records.length > 0) {
                listadoActualizado = result.records[0].get('l').properties;
            }
        } catch (error) {
            await tx.rollback();
            throw error;
        }

        return NextResponse.json(listadoActualizado || { status: 'actualizado' });
    } catch (error) {
        console.error("Error al actualizar listado:", error);
        return NextResponse.json({ error: "Error al actualizar el listado" }, { status: 500 });
    } finally {
        await session.close();
    }
}
