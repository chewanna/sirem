import { NextResponse } from 'next/server'
import { driver } from '@/lib/neo4j'
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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json([])
    }

    const id = (await params).id
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const session = driver.session();
    try {
        // Obtenemos los familiares ignorando la dirección de la relación.
        // Si la relación sale de id hacia f, es directo.
        // Si sale de f hacia id, es inverso.
        const result = await session.run(`
            MATCH (p {id: $id})-[r:TIENE_FAMILIAR]-(f:PersonalMilitar)
            OPTIONAL MATCH (f)-[:TIENE_GRADO]->(g:Grado)
            OPTIONAL MATCH (f)-[:PERTENECE_A_ARMA]->(a:ArmaServicio)
            OPTIONAL MATCH (f)-[:ADSCRITO_A]->(org:Organismo)
            RETURN r, f, g, a, org, startNode(r) = p AS directo
        `, { id })

        const normalized = result.records.map(record => {
            const r = record.get('r').properties;
            const fNode = record.get('f').properties;
            const grado = record.get('g')?.properties;
            const arma = record.get('a')?.properties;
            const org = record.get('org')?.properties;
            const directo = record.get('directo');

            const parentescoFinal = directo ? r.parentesco : invertirParentesco(r.parentesco);

            return {
                id_familiar_militar: r.id,
                id_personal_militar: id,
                id_familiar: fNode.id,
                parentesco: parentescoFinal,
                direccion: directo ? 'propio' : 'inverso',
                fecha_registro: r.fecha_registro,
                familiar: {
                    ...fNode,
                    id_personal_militar: fNode.id,
                    grado,
                    arma_servicio: arma,
                    organismo: org
                }
            }
        });

        return NextResponse.json(normalized)
    } catch (error) {
        console.error('Error fetching familiares:', error)
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
        return NextResponse.json({})
    }

    const id = (await params).id
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const session = driver.session();
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

        const relationId = crypto.randomUUID();
        const date = new Date().toISOString();

        // Evitar duplicados
        const checkResult = await session.run(`
            MATCH (p:PersonalMilitar {id: $id})-[r:TIENE_FAMILIAR]-(f:PersonalMilitar {id: $id_familiar})
            RETURN r
        `, { id, id_familiar });

        if (checkResult.records.length > 0) {
            return NextResponse.json({ error: 'Este familiar ya está registrado' }, { status: 409 });
        }

        const result = await session.run(`
            MATCH (p1:PersonalMilitar {id: $id})
            MATCH (p2:PersonalMilitar {id: $id_familiar})
            CREATE (p1)-[r:TIENE_FAMILIAR {
                id: $relationId,
                parentesco: $parentesco,
                fecha_registro: $date
            }]->(p2)
            RETURN r
        `, { id, id_familiar, relationId, parentesco, date });

        return NextResponse.json({ ok: true, id_familiar_militar: relationId }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating familiar:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    } finally {
        await session.close();
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json({})
    }

    const session = driver.session();
    try {
        const body = await request.json()
        const { id_familiar_militar, parentesco, direccion } = body

        if (!id_familiar_militar || !parentesco) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        // Si se edita desde el lado inverso, invertir el parentesco antes de guardar
        const parentescoFinal = direccion === 'inverso' ? invertirParentesco(parentesco) : parentesco

        const result = await session.run(`
            MATCH ()-[r:TIENE_FAMILIAR {id: $relId}]->()
            SET r.parentesco = $parentescoFinal
            RETURN r
        `, { relId: id_familiar_militar, parentescoFinal });

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('Error updating familiar:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    } finally {
        await session.close();
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (process.env.BUILD_MODE === 'true' || process.env.BUILD_MODE === '1') {
        return NextResponse.json({})
    }

    const session = driver.session();
    try {
        const body = await request.json()
        const { id_familiar_militar } = body

        if (!id_familiar_militar) {
            return NextResponse.json({ error: 'Falta id_familiar_militar' }, { status: 400 })
        }

        await session.run(`
            MATCH ()-[r:TIENE_FAMILIAR {id: $relId}]->()
            DELETE r
        `, { relId: id_familiar_militar });

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('Error deleting familiar:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    } finally {
        await session.close();
    }
}
