import { NextResponse } from 'next/server'
import { driver } from '@/lib/neo4j'
import { getUserFromToken } from '@/lib/auth'

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
            MATCH (p:PersonalMilitar {id: $id})-[:TUVO_MOVIMIENTO]->(m:Movimiento)
            RETURN m
            ORDER BY m.fecha_mov DESC
        `, { id })

        const movimientos = result.records.map(r => r.get('m').properties);

        return NextResponse.json(movimientos)
    } catch (error) {
        console.error('Error fetching movimientos:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    } finally {
        await session.close();
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json([])
    }

    const user = await getUserFromToken();
    if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (user.role === 'USUARIO_REGULAR') {
        return NextResponse.json({ error: 'No tienes permiso para agregar movimientos' }, { status: 403 })
    }

    const idStr = (await params).id
    const id = idStr

    if (!id) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const session = driver.session();
    try {
        const body = await request.json()

        let fecha_mov: Date
        try {
            fecha_mov = new Date(body.fecha_mov)
        } catch (e) {
            fecha_mov = new Date()
        }

        let fecha_documento: Date | null = null
        if (body.fecha_documento) {
            try {
                fecha_documento = new Date(body.fecha_documento)
            } catch (e) { }
        }

        const movimientoId = crypto.randomUUID();

        const result = await session.run(`
            MATCH (p:PersonalMilitar {id: $id})
            CREATE (m:Movimiento {
                id: $movimientoId,
                fecha_mov: $fecha_mov,
                tipo: $tipo,
                grado: $grado,
                unidad: $unidad,
                situacion: $situacion,
                motivo_movimiento: $motivo_movimiento,
                cargo: $cargo,
                zm: $zm,
                rm: $rm,
                no_documento: $no_documento,
                fecha_documento: $fecha_documento,
                no_acuerdo: $no_acuerdo,
                motivo_detallado: $motivo_detallado
            })
            CREATE (p)-[:TUVO_MOVIMIENTO]->(m)
            RETURN m
        `, {
            id,
            movimientoId,
            fecha_mov: fecha_mov.toISOString(),
            tipo: body.tipo || '',
            grado: body.grado || '',
            unidad: body.unidad || '',
            situacion: body.situacion || null,
            motivo_movimiento: body.motivo_movimiento || null,
            cargo: body.cargo || null,
            zm: body.zm || null,
            rm: body.rm || null,
            no_documento: body.no_documento || null,
            fecha_documento: fecha_documento ? fecha_documento.toISOString() : null,
            no_acuerdo: body.no_acuerdo || null,
            motivo_detallado: body.motivo_detallado || null,
        })

        if (result.records.length === 0) {
            return NextResponse.json({ error: 'Personal no encontrado' }, { status: 404 })
        }

        const newMovimiento = result.records[0].get('m').properties;

        return NextResponse.json(newMovimiento, { status: 201 })
    } catch (error) {
        console.error('Error creating movimiento:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    } finally {
        await session.close();
    }
}
