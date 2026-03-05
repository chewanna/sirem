import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json([])
    }

    try {
        const filtros = await request.json()

        // Si no hay ningún filtro activo, devolvemos un arreglo vacío
        const hasFilters = Object.entries(filtros).some(([key, val]) =>
            key !== 'familiares' && (
                (Array.isArray(val) && val.length > 0) ||
                (typeof val === 'string' && val.trim() !== '') ||
                (typeof val === 'boolean' && val === true)
            )
        )

        if (!hasFilters) {
            return NextResponse.json([])
        }

        const where: any = {}

        if (filtros.q) {
            where.OR = [
                { matricula: { contains: filtros.q, mode: 'insensitive' } },
                { nombre: { contains: filtros.q, mode: 'insensitive' } },
                { apellido_paterno: { contains: filtros.q, mode: 'insensitive' } },
                { apellido_materno: { contains: filtros.q, mode: 'insensitive' } }
            ]
        }

        if (filtros.empleo && filtros.empleo.length > 0) {
            where.grado = { abreviatura: { in: filtros.empleo } }
        }
        if (filtros.arma && filtros.arma.length > 0) {
            where.arma_servicio = { nombre_servicio: { in: filtros.arma } }
        }
        if (filtros.region && filtros.region.length > 0) {
            where.region_militar = { nombre_region_militar: { in: filtros.region } }
        }
        if (filtros.zona && filtros.zona.length > 0) {
            where.zona_militar = { nombre_zona_militar: { in: filtros.zona } }
        }
        if (filtros.estadoNacimiento && filtros.estadoNacimiento.length > 0) {
            where.estado_nacimiento = { in: filtros.estadoNacimiento }
        }

        if (filtros.apellidoPaterno) {
            where.apellido_paterno = { contains: filtros.apellidoPaterno, mode: 'insensitive' }
        }
        if (filtros.apellidoMaterno) {
            where.apellido_materno = { contains: filtros.apellidoMaterno, mode: 'insensitive' }
        }
        if (filtros.nombre) {
            where.nombre = { contains: filtros.nombre, mode: 'insensitive' }
        }
        if (filtros.matricula) {
            where.matricula = { contains: filtros.matricula, mode: 'insensitive' }
        }
        if (filtros.especialidad) {
            where.especialidad = { contains: filtros.especialidad, mode: 'insensitive' }
        }
        if (filtros.profesion) {
            where.profesion = { contains: filtros.profesion, mode: 'insensitive' }
        }
        if (filtros.situacion) {
            where.situacion = { contains: filtros.situacion, mode: 'insensitive' }
        }
        if (filtros.sexo) {
            where.sexo = { equals: filtros.sexo }
        }
        if (filtros.lugarNacimiento) {
            where.lugar_nacimiento = { contains: filtros.lugarNacimiento, mode: 'insensitive' }
        }

        if (filtros.fechaNacimiento || filtros.fechaNacimiento2) {
            where.fecha_nacimiento = {}
            if (filtros.fechaNacimiento) where.fecha_nacimiento.gte = new Date(filtros.fechaNacimiento)
            if (filtros.fechaNacimiento2) where.fecha_nacimiento.lte = new Date(filtros.fechaNacimiento2)
        }
        if (filtros.fechaIngreso || filtros.fechaIngreso2) {
            where.fecha_ingreso = {}
            if (filtros.fechaIngreso) where.fecha_ingreso.gte = new Date(filtros.fechaIngreso)
            if (filtros.fechaIngreso2) where.fecha_ingreso.lte = new Date(filtros.fechaIngreso2)
        }
        if (filtros.fechaEmpleo || filtros.fechaEmpleo2) {
            where.fecha_empleo = {}
            if (filtros.fechaEmpleo) where.fecha_empleo.gte = new Date(filtros.fechaEmpleo)
            if (filtros.fechaEmpleo2) where.fecha_empleo.lte = new Date(filtros.fechaEmpleo2)
        }
        // Filtro: solo personal que tiene al menos una conducta (semáforo)
        if (filtros.semaforo === true) {
            where.conductas = { some: {} }
        }


        const results = await prisma.personalMilitar.findMany({
            where,
            include: {
                grado: true,
                arma_servicio: true,
                _count: {
                    select: {
                        familiares: true,
                        conductas: true
                    }
                },
                ...(filtros.familiares === true && {
                    familiares: true
                }),
                ...(filtros.semaforo === true && {
                    conductas: {
                        orderBy: { fecha: 'desc' },
                        take: 1,
                        select: { tipo: true }
                    }
                })
            },
            take: 100
        })

        return NextResponse.json(results)
    } catch (error) {
        console.error('Error searching personal:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
