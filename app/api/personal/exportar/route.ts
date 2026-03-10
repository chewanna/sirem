import { NextResponse } from "next/server";
import { driver } from "@/lib/neo4j";
import { getUserFromToken } from '@/lib/auth';
import neo4j from 'neo4j-driver';

// Forzar exportación dinámica
export const dynamic = 'force-dynamic';

function serializeValue(value: any): any {
    if (value === null || value === undefined) return value;
    // Neo4j Integer
    if (neo4j.isInt(value)) return value.toNumber();
    // Neo4j Node
    if (value.properties && value.labels) {
        const obj: any = {};
        for (const [k, v] of Object.entries(value.properties)) {
            obj[k] = serializeValue(v);
        }
        return obj;
    }
    // Array
    if (Array.isArray(value)) return value.map(serializeValue);
    // Objeto plano
    if (typeof value === 'object' && value !== null) {
        const obj: any = {};
        for (const [k, v] of Object.entries(value)) {
            obj[k] = serializeValue(v);
        }
        return obj;
    }
    return value;
}

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
                const dbUser = serializeValue(userResult.records[0].get('u'));
                const dbMesa = serializeValue(userResult.records[0].get('m'));
                const dbGrupo = serializeValue(userResult.records[0].get('g'));

                userInfo = {
                    nombre: dbUser?.nombre || dbUser?.username || "USUARIO DESCONOCIDO",
                    mesa: dbMesa?.nombre?.toUpperCase() || "SIN MESA ASIGNADA",
                    grupo: dbGrupo?.nombre?.toUpperCase() || "SIN GRUPO ASIGNADO"
                };
            }
        }

        // Dividir los IDs en bloques si son muchos (para consultas inmensas, Cypher usa UNWIND pero es más seguro agrupar)
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
            RETURN p{
                .*, 
                id_personal_militar: p.id, 
                grado: gr{.*}, 
                arma_servicio: a{.*}, 
                organismo: org{.*}, 
                zona_militar: zm{.*}, 
                conductas: [cond IN conductas WHERE cond IS NOT NULL | cond{.*}]
            } as personal
        `;

        const personalResult = await session.run(query, { ids });

        // APLICAR SERIALIZE VALUE A CADA REGISTRO
        const personal = personalResult.records.map((r: any) => serializeValue(r.get('personal')));

        return NextResponse.json({ personal, userInfo });
    } catch (error) {
        console.error("Error obteniendo personal para exportación:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    } finally {
        await session.close();
    }
}

