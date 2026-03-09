import { NextRequest, NextResponse } from "next/server";
import { driver } from "@/lib/neo4j";
import { getUserFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/conducta?id_personal_militar=X
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idPersonal = searchParams.get("id_personal_militar");

    const session = driver.session();
    try {
        let query = `
            MATCH (p:PersonalMilitar)-[:TIENE_CONDUCTA]->(c:Conducta)
            RETURN c, p{.*, matricula: p.matricula} AS personal
            ORDER BY c.fecha DESC
        `;
        let params: any = {};

        if (idPersonal) {
            query = `
                MATCH (p:PersonalMilitar {id: $idPersonal})-[:TIENE_CONDUCTA]->(c:Conducta)
                RETURN c, p{.*, matricula: p.matricula} AS personal
                ORDER BY c.fecha DESC
            `;
            params = { idPersonal };
        }

        const result = await session.run(query, params);
        let conductas = result.records.map((record: any) => {
            const cProps = record.get('c').properties;
            const pProps = record.get('personal');
            return {
                ...cProps,
                personal: pProps
            };
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
    } finally {
        await session.close();
    }
}

// POST /api/conducta
export async function POST(req: NextRequest) {
    const session = driver.session();
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

        const id_conducta = crypto.randomUUID();
        const fecha = new Date().toISOString();

        const result = await session.run(`
            MATCH (p:PersonalMilitar {id: $id_personal_militar})
            CREATE (c:Conducta {
                id: $id_conducta,
                tipo: $tipo,
                descripcion: $descripcion,
                fecha: $fecha
            })
            CREATE (p)-[:TIENE_CONDUCTA]->(c)
            RETURN c
        `, {
            id_personal_militar,
            id_conducta,
            tipo,
            descripcion: descripcion.trim(),
            fecha
        });

        if (result.records.length === 0) {
            return NextResponse.json({ error: "Personal no encontrado." }, { status: 404 });
        }

        const nuevaConducta = result.records[0].get('c').properties;

        return NextResponse.json(nuevaConducta, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al registrar conducta." }, { status: 500 });
    } finally {
        await session.close();
    }
}
