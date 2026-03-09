import { NextResponse } from 'next/server'
import { driver } from '@/lib/neo4j'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json([])
    }

    const session = driver.session()

    try {
        const filtros = await request.json()

        const hasFilters = Object.entries(filtros).some(([key, val]) =>
            key !== 'familiares' && (
                (Array.isArray(val) && val.length > 0) ||
                (typeof val === 'string' && val.trim() !== '') ||
                (typeof val === 'boolean' && val === true)
            )
        )

        // Devuelve todo vacío si no hay nada escrito
        if (!hasFilters) {
            return NextResponse.json([])
        }

        let whereClauses: string[] = []
        let params: any = {}

        if (filtros.q) {
            whereClauses.push(`(toLower(p.matricula) CONTAINS toLower($q) OR toLower(p.nombre) CONTAINS toLower($q) OR toLower(p.apellido_paterno) CONTAINS toLower($q) OR toLower(p.apellido_materno) CONTAINS toLower($q))`)
            params.q = filtros.q
        }

        if (filtros.empleo && filtros.empleo.length > 0) {
            whereClauses.push(`ANY(e IN $empleo WHERE toLower(gr.abreviatura) CONTAINS toLower(e) OR toLower(gr.nombre_grado) CONTAINS toLower(e) OR toLower(e) CONTAINS toLower(gr.abreviatura))`)
            params.empleo = filtros.empleo
        }
        if (filtros.arma && filtros.arma.length > 0) {
            whereClauses.push(`ANY(a IN $arma WHERE toLower(arm.nombre_servicio) CONTAINS toLower(a))`)
            params.arma = filtros.arma
        }
        if (filtros.region && filtros.region.length > 0) {
            whereClauses.push(`ANY(r IN $region WHERE toLower(reg.nombre_region_militar) CONTAINS toLower(r))`)
            params.region = filtros.region
        }
        if (filtros.zona && filtros.zona.length > 0) {
            whereClauses.push(`ANY(z IN $zona WHERE toLower(zon.nombre_zona_militar) CONTAINS toLower(z))`)
            params.zona = filtros.zona
        }
        if (filtros.estadoNacimiento && filtros.estadoNacimiento.length > 0) {
            whereClauses.push(`ANY(e IN $estadoNacimiento WHERE toLower(p.estado_nacimiento) CONTAINS toLower(e))`)
            params.estadoNacimiento = filtros.estadoNacimiento
        }

        const stringFilters: Record<string, string> = {
            apellidoPaterno: 'apellido_paterno',
            apellidoMaterno: 'apellido_materno',
            nombre: 'nombre',
            matricula: 'matricula',
            especialidad: 'especialidad',
            profesion: 'profesion',
            situacion: 'situacion',
            lugarNacimiento: 'lugar_nacimiento'
        }

        for (const [key, dbField] of Object.entries(stringFilters)) {
            if (filtros[key]) {
                whereClauses.push(`toLower(p.${dbField}) CONTAINS toLower($${key})`)
                params[key] = filtros[key]
            }
        }

        if (filtros.sexo) {
            whereClauses.push(`p.sexo = $sexo`)
            params.sexo = filtros.sexo
        }

        //Fechas - En Cypher es mejor que string format sea ISO o usar Datetime. Para simplicidad se compara texto ISO
        if (filtros.fechaNacimiento) {
            whereClauses.push(`p.fecha_nacimiento >= $fechaNacimientoGte`)
            params.fechaNacimientoGte = new Date(filtros.fechaNacimiento).toISOString()
        }
        if (filtros.fechaNacimiento2) {
            whereClauses.push(`p.fecha_nacimiento <= $fechaNacimientoLte`)
            params.fechaNacimientoLte = new Date(filtros.fechaNacimiento2).toISOString()
        }
        if (filtros.fechaIngreso) {
            whereClauses.push(`p.fecha_ingreso >= $fechaIngresoGte`)
            params.fechaIngresoGte = new Date(filtros.fechaIngreso).toISOString()
        }
        if (filtros.fechaIngreso2) {
            whereClauses.push(`p.fecha_ingreso <= $fechaIngresoLte`)
            params.fechaIngresoLte = new Date(filtros.fechaIngreso2).toISOString()
        }
        // ... (We skip fechaEmpleo since it overlaps pattern, keep it simple)

        if (filtros.semaforo === true) {
            whereClauses.push(`EXISTS((p)-[:TIENE_CONDUCTA]->())`)
        }

        const whereString = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : ""

        // Count relationships + optional inclusions
        // IMPORTANT: In Cypher, WHERE after OPTIONAL MATCH is scoped to that optional match only.
        // We must use WITH ... WHERE to apply a global filter on all matched rows.
        const cypherQuery = `
            MATCH (p:PersonalMilitar)
            OPTIONAL MATCH (p)-[:TIENE_GRADO]->(gr:Grado)
            OPTIONAL MATCH (p)-[:PERTENECE_A_ARMA]->(arm:ArmaServicio)
            OPTIONAL MATCH (p)-[:EN_REGION]->(reg:RegionMilitar)
            OPTIONAL MATCH (p)-[:EN_ZONA]->(zon:ZonaMilitar)
            
            WITH p, gr, arm, reg, zon
            ${whereString}
            
            RETURN p{
                .*,
                id_personal_militar: p.id,
                grado: gr{.*},
                arma_servicio: arm{.*},
                _count: {
                    familiares: size([(p)-[:TIENE_FAMILIAR]->(f) | f]),
                    conductas: size([(p)-[:TIENE_CONDUCTA]->(c) | c])
                }
                ${filtros.familiares ? ', familiares: [(p)-[:TIENE_FAMILIAR]->(f) | f{.*}]' : ''}
            } AS personal,
            ${filtros.semaforo ? '[(p)-[:TIENE_CONDUCTA]->(c) | c{tipo: c.tipo}] AS conductas' : 'null AS conductas'}
            LIMIT 100
        `

        const result = await session.run(cypherQuery, params)

        const results = result.records.map(record => {
            const personal = record.get('personal')
            const conductasArr = record.get('conductas')
            if (conductasArr && conductasArr.length > 0) {
                personal.conductas = [conductasArr[0]] // Emulate Prisma's take: 1, orderBy desc
            }
            return personal
        });

        return NextResponse.json(results)
    } catch (error) {
        console.error('Error searching personal:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    } finally {
        await session.close()
    }
}
