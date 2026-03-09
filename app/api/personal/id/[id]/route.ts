import { NextResponse } from 'next/server'
import { driver } from '@/lib/neo4j'
import { getUserFromToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json({})
    }
    const idStr = (await params).id
    const id = idStr

    if (!id) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const session = driver.session();

    try {
        const result = await session.run(`
            MATCH (p:PersonalMilitar {id: $id})
            OPTIONAL MATCH (p)-[:TIENE_GRADO]->(gr:Grado)
            OPTIONAL MATCH (p)-[:PERTENECE_A_ARMA]->(arm:ArmaServicio)
            OPTIONAL MATCH (p)-[:ADSCRITO_A]->(org:Organismo)
            OPTIONAL MATCH (org)-[:UBICADO_EN]->(org_reg:RegionMilitar)
            OPTIONAL MATCH (p)-[:EN_ZONA]->(zon:ZonaMilitar)
            OPTIONAL MATCH (p)-[:EN_REGION]->(reg:RegionMilitar)

            RETURN p{
                .*,
                id_personal_militar: p.id,
                grado: gr{.*},
                arma_servicio: arm{.*},
                organismo: org{.*, region: org_reg{.*}},
                zona_militar: zon{.*},
                region_militar: reg{.*},
                historial_ascensos: [(p)-[:TUVO_ASCENSO]->(a)-[:A_GRADO]->(ag) | a{.*, grado: ag{.*}}],
                historial_adscripcion: [(p)-[:ESTUVO_EN]->(ha)-[:A_ORG]->(ho) | ha{.*, organismo: ho{.*}}],
                cargos: [(p)-[:DESEMPENO_CARGO]->(c) | c{.*}],
                movimientos: [(p)-[:TUVO_MOVIMIENTO]->(m) | m{.*}],
                familiares: [(p)-[:TIENE_FAMILIAR]->(f) | f{.*}],
                conductas: [(p)-[:TIENE_CONDUCTA]->(con) | con{.*}]
            } AS personal
        `, { id })

        if (result.records.length === 0) {
            return NextResponse.json({ error: 'Personal no encontrado' }, { status: 404 })
        }

        const personal = result.records[0].get('personal');

        // Sorting embedded arrays simulating prisma's orderBy
        if (personal.historial_ascensos) {
            personal.historial_ascensos.sort((a: any, b: any) => new Date(b.fecha_ascenso || 0).getTime() - new Date(a.fecha_ascenso || 0).getTime());
        }
        if (personal.historial_adscripcion) {
            personal.historial_adscripcion.sort((a: any, b: any) => new Date(b.fecha_inicio || 0).getTime() - new Date(a.fecha_inicio || 0).getTime());
        }
        if (personal.cargos) {
            personal.cargos.sort((a: any, b: any) => new Date(b.fecha_cargo || 0).getTime() - new Date(a.fecha_cargo || 0).getTime());
        }
        if (personal.movimientos) {
            personal.movimientos.sort((a: any, b: any) => new Date(b.fecha_mov || 0).getTime() - new Date(a.fecha_mov || 0).getTime());
        }
        if (personal.conductas) {
            personal.conductas.sort((a: any, b: any) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime());
        }

        const user = await getUserFromToken();
        const isAdmin = user?.role === 'ADMINISTRADOR';

        // Usuarios de mesa de disciplina u oficiales NO pueden ver la descripción
        if (!isAdmin && personal.conductas) {
            personal.conductas = personal.conductas.map((c: any) => ({ ...c, descripcion: 'Oculto por permisos' }));
        }

        return NextResponse.json(personal)
    } catch (error) {
        console.error('Error fetching personal by ID:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    } finally {
        await session.close();
    }
}
