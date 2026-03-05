import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
    const id = parseInt(idStr)

    if (isNaN(id)) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    try {
        const movimientos = await prisma.movimiento.findMany({
            where: {
                id_personal_militar: id,
            },
            orderBy: {
                fecha_mov: 'desc',
            },
        })

        return NextResponse.json(movimientos)
    } catch (error) {
        console.error('Error fetching movimientos:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
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
    const id = parseInt(idStr)

    if (isNaN(id)) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

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

        const newMovimiento = await prisma.movimiento.create({
            data: {
                id_personal_militar: id,
                fecha_mov,
                tipo: body.tipo || '',
                grado: body.grado || '',
                unidad: body.unidad || '',
                situacion: body.situacion || null,
                motivo_movimiento: body.motivo_movimiento || null,
                cargo: body.cargo || null,
                zm: body.zm || null,
                rm: body.rm || null,
                no_documento: body.no_documento || null,
                fecha_documento: fecha_documento,
                no_acuerdo: body.no_acuerdo || null,
                motivo_detallado: body.motivo_detallado || null,
            }
        })

        return NextResponse.json(newMovimiento, { status: 201 })
    } catch (error) {
        console.error('Error creating movimiento:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
