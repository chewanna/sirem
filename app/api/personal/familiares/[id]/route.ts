import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PARENTESCO_INVERSO: Record<string, string> = {
    'PADRE': 'HIJO(A)',
    'MADRE': 'HIJO(A)',
    'HIJO': 'PADRE/MADRE',
    'HIJA': 'PADRE/MADRE',
    'HIJO(A)': 'PADRE/MADRE',
    'PADRE/MADRE': 'HIJO(A)',
    'HERMANO': 'HERMANO(A)',
    'HERMANA': 'HERMANO(A)',
    'HERMANO(A)': 'HERMANO(A)',
    'ESPOSO': 'ESPOSA',
    'ESPOSA': 'ESPOSO',
    'TÍO': 'SOBRINO(A)',
    'TÍA': 'SOBRINO(A)',
    'TÍO(A)': 'SOBRINO(A)',
    'PRIMO': 'PRIMO(A)',
    'PRIMA': 'PRIMO(A)',
    'PRIMO(A)': 'PRIMO(A)',
    'ABUELO': 'NIETO(A)',
    'ABUELA': 'NIETO(A)',
    'ABUELO(A)': 'NIETO(A)',
    'NIETO': 'ABUELO(A)',
    'NIETA': 'ABUELO(A)',
    'NIETO(A)': 'ABUELO(A)',
    'SOBRINO': 'TÍO(A)',
    'SOBRINA': 'TÍO(A)',
    'SOBRINO(A)': 'TÍO(A)',
    'CUÑADO': 'CUÑADO(A)',
    'CUÑADA': 'CUÑADO(A)',
    'CUÑADO(A)': 'CUÑADO(A)',
}

function invertirParentesco(parentesco: string): string {
    return PARENTESCO_INVERSO[parentesco] || parentesco
}

const includePersonal = {
    grado: true,
    arma_servicio: true,
    organismo: true,
    zona_militar: true,
    region_militar: true,
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json([])
    }

    const id = parseInt((await params).id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    try {
        const familiares = await prisma.familiarMilitar.findMany({
            where: {
                OR: [
                    { id_personal_militar: id },
                    { id_familiar: id },
                ]
            },
            include: {
                familiar: { include: includePersonal },
                personal: { include: includePersonal },
                usuario: { select: { id_usuario: true, username: true, nombre: true } },
            },
            orderBy: { id_familiar_militar: 'asc' },
        })
        const normalized = familiares.map(rel => {
            if (rel.id_personal_militar === id) {
                const { personal, ...rest } = rel
                return { ...rest, direccion: 'propio' }
            } else {
                const { personal, familiar, ...rest } = rel
                return {
                    ...rest,
                    familiar: personal,
                    parentesco: invertirParentesco(rel.parentesco),
                    direccion: 'inverso',
                }
            }
        })

        return NextResponse.json(normalized)
    } catch (error) {
        console.error('Error fetching familiares:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json({})
    }

    const id = parseInt((await params).id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    try {
        const user = await getUserFromToken()
        const body = await request.json()
        const { id_familiar, parentesco } = body

        if (!id_familiar || !parentesco) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        if (id_familiar === id) {
            return NextResponse.json({ error: 'No se puede agregar a sí mismo como familiar' }, { status: 400 })
        }

        const nuevo = await prisma.familiarMilitar.create({
            data: {
                id_personal_militar: id,
                id_familiar,
                parentesco,
                ...(user?.id ? { id_usuario: user.id } : {}),
            },
            include: {
                familiar: {
                    include: {
                        grado: true,
                        arma_servicio: true,
                        organismo: true,
                        zona_militar: true,
                        region_militar: true,
                    }
                }
            }
        })

        return NextResponse.json(nuevo, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Este familiar ya está registrado' }, { status: 409 })
        }
        console.error('Error creating familiar:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json({})
    }

    try {
        const user = await getUserFromToken()
        const body = await request.json()
        const { id_familiar_militar, parentesco, direccion } = body

        if (!id_familiar_militar || !parentesco) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        // Si se edita desde el lado inverso, invertir el parentesco antes de guardar
        const parentescoFinal = direccion === 'inverso' ? invertirParentesco(parentesco) : parentesco

        const actualizado = await prisma.familiarMilitar.update({
            where: { id_familiar_militar },
            data: { parentesco: parentescoFinal, ...(user?.id ? { id_usuario: user.id } : {}) },
        })

        return NextResponse.json(actualizado)
    } catch (error) {
        console.error('Error updating familiar:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json({})
    }

    try {
        const body = await request.json()
        const { id_familiar_militar } = body

        if (!id_familiar_militar) {
            return NextResponse.json({ error: 'Falta id_familiar_militar' }, { status: 400 })
        }

        await prisma.familiarMilitar.delete({
            where: { id_familiar_militar },
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('Error deleting familiar:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
