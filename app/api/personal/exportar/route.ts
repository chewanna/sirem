import { NextResponse } from "next/server";
import { driver } from "@/lib/neo4j";
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: Request) {
    const session = driver.session();
    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: "Se requiere un arreglo de ids." }, { status: 400 });
        }

        const tokenUser = await getUserFromToken();
        let userInfo = { nombre: "USUARIO DESCONOCIDO", mesa: "SIN MESA", grupo: "SIN GRUPO" };

        if (tokenUser && tokenUser.id) {
            const userResult = await session.run(`
                MATCH (u:Usuario {id: $id})
                OPTIONAL MATCH (u)-[:ASIGNADO_A]->(m:Mesa)
                OPTIONAL MATCH (m)-[:PERTENECE_A]->(g:Grupo)
                RETURN u, m, g
            `, { id: tokenUser.id });

            if (userResult.records.length > 0) {
                const dbUser = userResult.records[0].get('u').properties;
                const dbMesa = userResult.records[0].get('m')?.properties;
                const dbGrupo = userResult.records[0].get('g')?.properties;

                userInfo = {
                    nombre: dbUser.nombre || dbUser.username,
                    mesa: dbMesa?.nombre?.toUpperCase() || "SIN MESA ASIGNADA",
                    grupo: dbGrupo?.nombre?.toUpperCase() || "SIN GRUPO ASIGNADO"
                };
            }
        }

        const query = `
            UNWIND $ids AS p_id
            MATCH (p:PersonalMilitar {id: p_id})
            OPTIONAL MATCH (p)-[:TIENE_GRADO]->(gr:Grado)
            OPTIONAL MATCH (p)-[:PERTENECE_A_ARMA]->(a:ArmaServicio)
            OPTIONAL MATCH (p)-[:ADSCRITO_A]->(org:Organismo)
            OPTIONAL MATCH (p)-[:EN_ZONA]->(zm:ZonaMilitar)
            OPTIONAL MATCH (p)-[:TIENE_CONDUCTA]->(c:Conducta)
            WITH p, gr, a, org, zm, collect(c) AS conductas
            ORDER BY gr.id DESC, p.apellido_paterno ASC
            RETURN p{.*, id_personal_militar: p.id, grado: gr{.*}, arma_servicio: a{.*}, organismo: org{.*}, zona_militar: zm{.*}, conductas: [cond IN conductas WHERE cond IS NOT NULL | cond{.*}]} as personal
        `;

        const personalResult = await session.run(query, { ids });

        const personal = personalResult.records.map((r: any) => r.get('personal'));

        return NextResponse.json({ personal, userInfo });
    } catch (error) {
        console.error("Error obteniendo personal para exportación:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    } finally {
        await session.close();
    }
}

