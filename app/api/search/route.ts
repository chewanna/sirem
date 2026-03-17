import { NextResponse } from 'next/server'
import { driver } from '@/lib/neo4j'
import neo4j from 'neo4j-driver'

export const dynamic = 'force-dynamic'

// Serializa valores de Neo4j a JSON plano
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

        // Devuelve vacío si no hay nada escrito
        if (!hasFilters) {
            return NextResponse.json([])
        }

        let whereClauses: string[] = []
        let params: any = {}

        // Búsqueda rápida genérica
        if (filtros.q) {
            whereClauses.push(`(toLower(p.matricula) CONTAINS toLower($q) OR toLower(p.nombre) CONTAINS toLower($q) OR toLower(p.apellido_paterno) CONTAINS toLower($q) OR toLower(p.apellido_materno) CONTAINS toLower($q))`)
            params.q = filtros.q
        }

        // === FILTROS MULTI-SELECT (arrays) ===
        if (filtros.empleo && filtros.empleo.length > 0) {
            whereClauses.push(`ANY(e IN $empleo WHERE toLower(gr.abreviatura) = toLower(e) OR toLower(gr.nombre_grado) = toLower(e))`)
            params.empleo = filtros.empleo
        }
        if (filtros.arma && filtros.arma.length > 0) {
            whereClauses.push(`ANY(a IN $arma WHERE toLower(arm.nombre_servicio) CONTAINS toLower(a))`)
            params.arma = filtros.arma
        }
        if (filtros.region && filtros.region.length > 0) {
            whereClauses.push(`ANY(r IN $region WHERE toLower(reg.nombre_region_militar) CONTAINS toLower(r) OR toLower(reg.numero) CONTAINS toLower(r))`)
            params.region = filtros.region
        }
        if (filtros.zona && filtros.zona.length > 0) {
            whereClauses.push(`ANY(z IN $zona WHERE toLower(zon.nombre_zona_militar) CONTAINS toLower(z) OR toLower(zon.numero) CONTAINS toLower(z))`)
            params.zona = filtros.zona
        }
        if (filtros.estadoNacimiento && filtros.estadoNacimiento.length > 0) {
            whereClauses.push(`ANY(e IN $estadoNacimiento WHERE toLower(p.estado_nacimiento) CONTAINS toLower(e))`)
            params.estadoNacimiento = filtros.estadoNacimiento
        }

        // === FILTROS DE TEXTO (string) ===
        const stringFilters: Record<string, string> = {
            apellidoPaterno: 'apellido_paterno',
            apellidoMaterno: 'apellido_materno',
            nombre: 'nombre',
            matricula: 'matricula',
            especialidad: 'especialidad',
            profesion: 'profesion',
            subespecialidad: 'subespecialidad',
            situacion: 'situacion',
            lugarNacimiento: 'lugar_nacimiento',
            ubicacion: 'ubicacion',
        }

        for (const [key, dbField] of Object.entries(stringFilters)) {
            if (filtros[key] && filtros[key].trim()) {
                whereClauses.push(`toLower(p.${dbField}) CONTAINS toLower($${key})`)
                params[key] = filtros[key]
            }
        }

        // Sexo: comparación case-insensitive
        if (filtros.sexo) {
            whereClauses.push(`toLower(p.sexo) = toLower($sexo)`)
            params.sexo = filtros.sexo
        }

        // Clasificación
        if (filtros.clasificacion) {
            whereClauses.push(`toLower(p.clasificacion) = toLower($clasificacion)`)
            params.clasificacion = filtros.clasificacion
        }

        // Unidad: buscar en el Organismo asociado
        if (filtros.unidad && filtros.unidad.trim()) {
            whereClauses.push(`toLower(org.nombre_organismo) CONTAINS toLower($unidad)`)
            params.unidad = filtros.unidad
        }

        // Cargo: buscar en los Cargos asociados
        if (filtros.cargo && filtros.cargo.trim()) {
            whereClauses.push(`toLower(cgo.cargo) CONTAINS toLower($cargo)`)
            params.cargo = filtros.cargo
        }

        // === FILTROS DE FECHA ===
        const dateFilters: { field: string; dbField: string; suffix: string }[] = [
            { field: 'fechaNacimiento', dbField: 'p.fecha_nacimiento', suffix: 'FechaNac' },
            { field: 'fechaIngreso', dbField: 'p.fecha_ingreso', suffix: 'FechaIng' },
            { field: 'fechaEmpleo', dbField: 'p.fecha_empleo', suffix: 'FechaEmp' },
            { field: 'fechaDestino', dbField: 'p.fecha_destino', suffix: 'FechaDest' },
            { field: 'edadLimite', dbField: 'p.edad_limite', suffix: 'EdadLim' },
        ]

        for (const { field, dbField, suffix } of dateFilters) {
            if (filtros[field]) {
                whereClauses.push(`${dbField} >= $gte${suffix}`)
                params[`gte${suffix}`] = filtros[field]
            }
            if (filtros[`${field}2`]) {
                whereClauses.push(`${dbField} <= $lte${suffix}`)
                params[`lte${suffix}`] = filtros[`${field}2`]
            }
        }

        // Fecha de cargo: buscar desde la relación Cargo
        if (filtros.fechaCargo) {
            whereClauses.push(`cgo.fecha_cargo >= $gteFechaCargo`)
            params.gteFechaCargo = filtros.fechaCargo
        }
        if (filtros.fechaCargo2) {
            whereClauses.push(`cgo.fecha_cargo <= $lteFechaCargo`)
            params.lteFechaCargo = filtros.fechaCargo2
        }

        // Semáforo — tiene conducta
        if (filtros.semaforo === true) {
            whereClauses.push(`EXISTS((p)-[:TIENE_CONDUCTA]->())`)
        }

        const whereString = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : ""

        const cypherQuery = `
            MATCH (p:PersonalMilitar)
            OPTIONAL MATCH (p)-[:TIENE_GRADO]->(gr:Grado)
            OPTIONAL MATCH (p)-[:PERTENECE_A_ARMA]->(arm:ArmaServicio)
            OPTIONAL MATCH (p)-[:EN_REGION]->(reg:RegionMilitar)
            OPTIONAL MATCH (p)-[:EN_ZONA]->(zon:ZonaMilitar)
            OPTIONAL MATCH (p)-[:ADSCRITO_A]->(org:Organismo)
            OPTIONAL MATCH (p)-[:DESEMPENO_CARGO]->(cgo:Cargo)
            
            WITH p, gr, arm, reg, zon, org, cgo
            ${whereString}
            
            RETURN p{
                .*,
                id_personal_militar: p.id,
                grado: gr{.*},
                arma_servicio: arm{.*},
                region_militar: reg{.*},
                zona_militar: zon{.*},
                organismo: org{.*},
                cargo_actual: cgo{.*},
                _count: {
                    familiares: size([(p)-[:TIENE_FAMILIAR]->(f) | f]),
                    conductas: size([(p)-[:TIENE_CONDUCTA]->(c) | c])
                }
                ${filtros.familiares ? ', familiares: [(p)-[:TIENE_FAMILIAR]->(f) | f{.*}]' : ''}
            } AS personal,
            ${filtros.semaforo ? '[(p)-[:TIENE_CONDUCTA]->(c) | c{tipo: c.tipo}] AS conductas' : 'null AS conductas'}
        `

        const result = await session.run(cypherQuery, params)

        const results = result.records.map(record => {
            const rawPersonal = record.get('personal')
            const personal = serializeValue(rawPersonal)
            const conductasArr = record.get('conductas')
            if (conductasArr && conductasArr.length > 0) {
                personal.conductas = [serializeValue(conductasArr[0])]
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
