import { NextResponse } from 'next/server'
import { driver } from '@/lib/neo4j'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json([])
    }

    const idStr = (await params).id
    const id = idStr

    if (!id) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (p:PersonalMilitar {id: $id})-[:DESEMPENO_CARGO]->(c:Cargo)
            RETURN c
            ORDER BY c.fecha_cargo DESC
        `, { id })

        const cargos = result.records.map(r => r.get('c').properties);

        return NextResponse.json(cargos)
    } catch (error) {
        console.error('Error fetching cargos:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    } finally {
        await session.close();
    }
}

