import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
        const cargos = await prisma.cargo.findMany({
            where: {
                id_personal_militar: id,
            },
            orderBy: {
                fecha_cargo: 'desc',
            },
        })

        return NextResponse.json(cargos)
    } catch (error) {
        console.error('Error fetching cargos:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
