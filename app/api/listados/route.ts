import { NextResponse } from "next/server";
import { driver } from "@/lib/neo4j";

export const dynamic = "force-dynamic";

// GET /api/listados
export async function GET() {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (l:Listado)
            OPTIONAL MATCH (l)-[r:TIENE_PERSONAL]->(p:PersonalMilitar)
            OPTIONAL MATCH (p)-[:TIENE_GRADO]->(g:Grado)
            OPTIONAL MATCH (p)-[:PERTENECE_A_ARMA]->(a:ArmaServicio)
            WITH l, p, r, g, a
            ORDER BY l.fecha DESC, r.orden ASC
            RETURN l, collect(
                CASE WHEN p IS NULL THEN null ELSE p{
                    .*, 
                    id_personal_militar: p.id,
                    orden: r.orden,
                    grado: g{.*},
                    arma_servicio: a{.*}
                } END
            ) AS personal
            ORDER BY l.fecha DESC
        `);

        const listados = result.records.map((record: any) => {
            const lProps = record.get('l').properties;
            const personalRaw = record.get('personal') || [];
            // Remove nulls if any
            const personal = personalRaw.filter((p: any) => p != null);

            return {
                id_listado: lProps.id,
                nombre: lProps.nombre,
                fecha: lProps.fecha,
                personal,
            };
        });

        return NextResponse.json(listados);
    } catch (error) {
        console.error("Error al obtener listados:", error);
        return NextResponse.json({ error: "Error al obtener listados" }, { status: 500 });
    } finally {
        await session.close();
    }
}

// POST /api/listados
export async function POST(request: Request) {
    const session = driver.session();
    try {
        const body = await request.json();
        const { nombre, personalIds } = body as { nombre: string; personalIds: string[] };

        if (!nombre?.trim()) {
            return NextResponse.json({ error: "El nombre del listado es requerido" }, { status: 400 });
        }
        if (!personalIds || personalIds.length === 0) {
            return NextResponse.json({ error: "El listado no puede estar vacío" }, { status: 400 });
        }

        const id_listado = crypto.randomUUID();
        const fecha = new Date().toISOString();

        // format personalIds to objects with order
        const personalData = personalIds.map((id, idx) => ({ id, orden: idx }));

        const result = await session.run(`
            CREATE (l:Listado {
                id: $id_listado,
                nombre: $nombre,
                fecha: $fecha
            })
            WITH l
            UNWIND $personalData AS person
            MATCH (p:PersonalMilitar {id: person.id})
            CREATE (l)-[:TIENE_PERSONAL {orden: person.orden}]->(p)
            RETURN l
        `, {
            id_listado,
            nombre: nombre.trim(),
            fecha,
            personalData
        });

        const listadoCreado = result.records[0].get('l').properties;

        return NextResponse.json(listadoCreado, { status: 201 });
    } catch (error) {
        console.error("Error al guardar listado:", error);
        return NextResponse.json({ error: "Error al guardar el listado" }, { status: 500 });
    } finally {
        await session.close();
    }
}
