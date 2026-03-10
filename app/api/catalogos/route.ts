import { NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j';

export const dynamic = 'force-dynamic';

const dbProperties: Record<string, string> = {
    especialidad: 'especialidad',
    profesion: 'profesion',
    subespecialidad: 'subespecialidad',
    situacion: 'situacion',
    sexo: 'sexo',
    clasificacion: 'clasificacion',
    estadoNacimiento: 'estado_nacimiento'
};

const dbNodes: Record<string, { label: string, prop: string }> = {
    arma: { label: 'ArmaServicio', prop: 'nombre_servicio' },
    region: { label: 'RegionMilitar', prop: 'nombre_region_militar' },
    zona: { label: 'ZonaMilitar', prop: 'nombre_zona_militar' },
    unidad: { label: 'Organismo', prop: 'nombre_organismo' },
    cargo: { label: 'Cargo', prop: 'cargo' }
};

export async function GET() {
    const session = driver.session();
    try {
        const result = await session.run(`MATCH (c:Catalogo) RETURN c.tipo AS tipo, c.valor AS valor`);
        const data = result.records.map(r => ({ tipo: r.get('tipo'), valor: r.get('valor') }));
        return NextResponse.json(data);
    } catch (e) {
        console.error('Error in GET /api/catalogos', e);
        return NextResponse.json({ error: 'Error inteno' }, { status: 500 });
    } finally {
        await session.close();
    }
}

export async function POST(request: Request) {
    const { tipo, valor } = await request.json();
    if (!tipo || !valor) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    const session = driver.session();
    try {
        // También podemos crear el nodo real si aplica, pero para mantener el catálogo universal:
        await session.run(`MERGE (c:Catalogo {tipo: $tipo, valor: $valor}) RETURN c`, { tipo, valor });
        return NextResponse.json({ success: true, tipo, valor });
    } catch (e) {
        console.error('Error in POST /api/catalogos', e);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    } finally {
        await session.close();
    }
}

export async function PUT(request: Request) {
    const { tipo, oldValue, newValue } = await request.json();
    if (!tipo || !oldValue || !newValue) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    const session = driver.session();
    try {
        // 1. Actualizar en el catálogo
        await session.run(`MATCH (c:Catalogo {tipo: $tipo, valor: $oldValue}) SET c.valor = $newValue RETURN c`, { tipo, oldValue, newValue });

        // 2. Cascadas si aplica a propiedades de PersonalMilitar
        if (dbProperties[tipo]) {
            const prop = dbProperties[tipo];
            const cypher = `MATCH (p:PersonalMilitar) WHERE p.${prop} = $oldValue SET p.${prop} = $newValue`;
            await session.run(cypher, { oldValue, newValue });
        }

        // 3. Cascadas si aplica a nodos auxiliares (como ArmaServicio, etc)
        if (dbNodes[tipo]) {
            const { label, prop } = dbNodes[tipo];
            const cypher = `MATCH (n:${label}) WHERE n.${prop} = $oldValue SET n.${prop} = $newValue`;
            await session.run(cypher, { oldValue, newValue });
        }

        return NextResponse.json({ success: true, tipo, valor: newValue });
    } catch (e) {
        console.error('Error in PUT /api/catalogos', e);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    } finally {
        await session.close();
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const valor = searchParams.get('valor');

    if (!tipo || !valor) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    const session = driver.session();
    try {
        // 1. Eliminar del catálogo
        await session.run(`MATCH (c:Catalogo {tipo: $tipo, valor: $valor}) DELETE c`, { tipo, valor });

        // No borramos la propiedad de PersonalMilitar porque en una base de datos relacional/grafo eliminar una etiqueta no debe borrar la data que ya tenía ese string, pero si se desea, se pudiera hacer un set null. Sin embargo, para evitar pérdida accidental de datos, solo borramos del catálogo de opciones.

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Error in DELETE /api/catalogos', e);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    } finally {
        await session.close();
    }
}
