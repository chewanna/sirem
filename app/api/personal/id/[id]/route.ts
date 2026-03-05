import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
    const id = parseInt(idStr)

    if (isNaN(id)) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    try {
        const personal = await (prisma as any).personalMilitar.findUnique({
            where: {
                id_personal_militar: id,
            },
            include: {
                grado: true,
                arma_servicio: true,
                organismo: {
                    include: {
                        region: true
                    }
                },
                zona_militar: true,
                region_militar: true,
                historial_ascensos: {
                    include: {
                        grado: true
                    },
                    orderBy: {
                        fecha_ascenso: 'desc'
                    }
                },
                historial_adscripcion: {
                    include: {
                        organismo: true
                    },
                    orderBy: {
                        fecha_inicio: 'desc'
                    }
                },
                cargos: {
                    orderBy: {
                        fecha_cargo: 'desc'
                    }
                },
                movimientos: {
                    orderBy: {
                        fecha_mov: 'desc'
                    }
                },
                familiares: true,
                conductas: {
                    orderBy: { fecha: 'desc' }
                }
            }
        })

        if (!personal) {
            return NextResponse.json({ error: 'Personal no encontrado' }, { status: 404 })
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
    }
}
