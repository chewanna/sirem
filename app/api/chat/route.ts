import { NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j';


// Puedes configurar aquí de qué proveedor usar Llama. 
// Por defecto, usa Groq para rapidez si tienes GROQ_API_KEY. 
// Si prefieres usar vLLM localmente, cambia USE_VLLM a true.
const USE_VLLM = process.env.USE_VLLM === 'true' || false;
const VLLM_URL = process.env.VLLM_URL || 'http://localhost:8000/v1/chat/completions';
const USE_OLLAMA = process.env.USE_OLLAMA === 'true' || false;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Esquema EXACTO de la base de datos Neo4j (nombres reales de propiedades)
const DB_SCHEMA = `
Nodos principales (Neo4j Grafos):
- PersonalMilitar: id, matricula, curp, rfc, nombre, apellido_paterno, apellido_materno, sexo, situacion, estado_civil, fecha_nacimiento, fecha_ingreso, especialidad.
- Grado: id, nombre_grado, abreviatura
- ArmaServicio: id, nombre_servicio
- Organismo: id, nombre_organismo, campo_militar
- ZonaMilitar: id, nombre_zona_militar, numero
- RegionMilitar: id, nombre_region_militar, numero
- Conducta: id, tipo, descripcion, fecha
- Cargo: id, cargo, unidad, ubicacion, fecha_cargo
- Movimiento: id, tipo, grado, unidad, fecha_mov

Relaciones: 
- (PersonalMilitar)-[:TIENE_GRADO]->(Grado)
- (PersonalMilitar)-[:PERTENECE_A_ARMA]->(ArmaServicio)
- (PersonalMilitar)-[:ADSCRITO_A]->(Organismo)
- (PersonalMilitar)-[:EN_ZONA]->(ZonaMilitar)
- (PersonalMilitar)-[:EN_REGION]->(RegionMilitar)
- (PersonalMilitar)-[:TIENE_CONDUCTA]->(Conducta)
- (PersonalMilitar)-[:DESEMPENO_CARGO]->(Cargo)
- (PersonalMilitar)-[:TUVO_MOVIMIENTO]->(Movimiento)

IMPORTANTE - Nombres exactos de propiedades:
- Los grados usan "nombre_grado" (NO "nombre")
- Las armas/servicios usan "nombre_servicio" (NO "nombre")
- Los organismos usan "nombre_organismo" (NO "nombre")
- Las zonas militares usan "nombre_zona_militar" (NO "nombre")
- Las regiones militares usan "nombre_region_militar" (NO "nombre")
`;

async function getLlamaResponse(messages: any[]) {
    const systemPrompt = `Eres el asistente experto del SIREM (Sistema de Recursos Humanos Militar).
Tu misión es traducir peticiones de lenguaje natural a consultas Cypher para ejecutarlas en Neo4j.

ESTRUCTURA DE BASE DE DATOS:
${DB_SCHEMA}

REGLAS CRÍTICAS DE RESPUESTA:
1. Responde ÚNICAMENTE en JSON plano, sin bloques de código markdown.
2. El "intent" debe ser "cypher" si requiere datos de la base de datos, o "conversational" si es un saludo, ayuda o pregunta general.
3. En "synthesis", explica brevemente lo que vas a buscar o responder.
4. Para consultas Cypher:
   - SIEMPRE usa LIMIT 10 al final.
   - Para búsquedas de texto parcial usa SIEMPRE expresiones regulares: =~ '(?i).*texto.*'
   - SEMÁNTICA IMPORTANTE: 
     * "buena conducta": busca (c:Conducta) WHERE c.tipo IN ['FELICITACION', 'MENCION HONORIFICA'] OR c.descripcion =~ '(?i).*buena.*' o excluye arrestos.
     * "mal comportamiento": busca (c:Conducta) WHERE c.tipo = 'ARRESTO'
     * Si el usuario pide "propuestas para una comisión/puesto en [Organismo]", NO filtres el organismo actual con ese nombre, ya que los estás BUSCANDO para enviarlos ahí. Filtra solo por los méritos/conducta o rama si se especifica.
   - Para aplicar filtros en relaciones, debes hacer MATCH a través de la relación:
     Ej: MATCH (p:PersonalMilitar)-[:TIENE_CONDUCTA]->(c:Conducta) WHERE c.tipo IN ['FELICITACION', 'MENCION HONORIFICA']
   - Para devolver al personal con sus datos completos para el frontend (como grado, arma y organismo), usa un patrón así después de tus filtros:
     MATCH (p:PersonalMilitar)
     // ... <AQUÍ VAN TUS FILTROS MATCH / WHERE (ej. conducta, zonas, etc)> ...
     OPTIONAL MATCH (p)-[:TIENE_GRADO]->(g:Grado)
     OPTIONAL MATCH (p)-[:PERTENECE_A_ARMA]->(a:ArmaServicio)
     OPTIONAL MATCH (p)-[:ADSCRITO_A]->(orgDefault:Organismo)
     RETURN p.nombre AS nombre, p.apellido_paterno AS apellido_paterno, p.apellido_materno AS apellido_materno,
            p.matricula AS matricula, p.curp AS curp, p.sexo AS sexo, p.situacion AS situacion,
            g.nombre_grado AS grado, a.nombre_servicio AS arma, orgDefault.nombre_organismo AS organismo
     LIMIT 10
   - SIEMPRE devuelve propiedades individuales con alias descriptivos. NUNCA uses p{.*} ni RETURN p.

ESTRUCTURA JSON SOLICITADA EXACTA:
{
  "intent": "cypher",
  "cypher_query": "MATCH (p:PersonalMilitar) WHERE p.nombre =~ '(?i).*yael.*' OPTIONAL MATCH (p)-[:TIENE_GRADO]->(g:Grado) RETURN p.nombre AS nombre, p.apellido_paterno AS apellido_paterno, p.matricula AS matricula, g.nombre_grado AS grado LIMIT 10",
  "synthesis": "Buscando información del personal militar llamado Yael..."
}

Para respuestas conversacionales:
{
  "intent": "conversational",
  "cypher_query": null,
  "synthesis": "Tu respuesta aquí"
}`;

    const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    if (USE_VLLM) {
        // vLLM local usando formato OpenAI
        const response = await fetch(VLLM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'hugging-quants/Meta-Llama-3.1-8B-Instruct-AWQ-INT4',
                messages: formattedMessages,
                stream: false,
                temperature: 0.1,
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Error al conectar con la API de vLLM: ${errBody}`);
        }
        const data = await response.json();

        let content = data.choices[0].message.content.trim();
        // Limpiar posible markdown
        if (content.startsWith("```json")) {
            content = content.replace(/```json/, "").replace(/```$/, "").trim();
        } else if (content.startsWith("```")) {
            content = content.replace(/```/, "").replace(/```$/, "").trim();
        }
        return JSON.parse(content);

    } else if (USE_OLLAMA) {
        // Llama local usando Ollama
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                messages: formattedMessages,
                stream: false,
                format: 'json'
            })
        });

        if (!response.ok) throw new Error('Error al conectar con la API de Ollama');
        const data = await response.json();
        return JSON.parse(data.message.content);

    } else {
        // Groq usando Llama-3
        if (!GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY no configurada. Por favor configúrala en el archivo .env o en el sistema.');
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192',
                messages: formattedMessages,
                response_format: { type: "json_object" },
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Error de Groq API: ${errBody}`);
        }

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    }
}

// Serializar datos de Neo4j: convierte Neo4j Integer a number y aplana objetos
const serializeNeo4jValue = (value: any): any => {
    if (value === null || value === undefined) return null;

    // Neo4j Integer (tiene propiedades low y high)
    if (typeof value === 'object' && value.low !== undefined && value.high !== undefined) {
        return value.low; // Para números que caben en 32 bits
    }

    // BigInt nativo
    if (typeof value === 'bigint') {
        return Number(value);
    }

    // Neo4j Node/Relationship — extraer properties
    if (typeof value === 'object' && value.properties) {
        const flat: any = {};
        for (const [k, v] of Object.entries(value.properties)) {
            flat[k] = serializeNeo4jValue(v);
        }
        return flat;
    }

    // Arreglos
    if (Array.isArray(value)) {
        return value.map(serializeNeo4jValue);
    }

    // Objetos planos
    if (typeof value === 'object' && !(value instanceof Date)) {
        const flat: any = {};
        for (const [k, v] of Object.entries(value)) {
            flat[k] = serializeNeo4jValue(v);
        }
        return flat;
    }

    return value;
};

// Aplanar resultados: si un record tiene una sola key con valor objeto, expandirlo
const flattenResults = (results: any[]): any[] => {
    return results.map(row => {
        const keys = Object.keys(row);
        // Si solo hay una key y su valor es un objeto, expandirlo
        if (keys.length === 1 && typeof row[keys[0]] === 'object' && row[keys[0]] !== null && !Array.isArray(row[keys[0]])) {
            return row[keys[0]];
        }
        // Si hay keys con valores que son objetos, expandirlos con prefijo
        const flat: any = {};
        for (const [key, val] of Object.entries(row)) {
            if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                for (const [subKey, subVal] of Object.entries(val as Record<string, any>)) {
                    flat[subKey] = subVal;
                }
            } else {
                flat[key] = val;
            }
        }
        return flat;
    });
};

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
        }

        // 1. Obtención de la intención y query Cypher del LLM (Llama)
        let llamaResult;
        try {
            llamaResult = await getLlamaResponse(messages);
        } catch (llmError: any) {
            console.error("Error LLM:", llmError);
            return NextResponse.json({
                synthesis: "Error al conectar con el modelo de IA. Verifica que el servicio esté activo.",
                intent: 'conversational',
                query: null,
                results: [],
                error: llmError.message
            });
        }

        let results: any[] = [];
        let finalSynthesis = llamaResult.synthesis || '';
        let queryExecuted = llamaResult.cypher_query;

        // 2. Si el LLM determinó que se debe consultar Neo4j, ejecutamos la query Cypher
        if (llamaResult.intent === 'cypher' && llamaResult.cypher_query) {
            const session = driver.session();
            try {
                const rawResponse = await session.run(llamaResult.cypher_query);

                let dataExtracted: any[] = [];
                for (const record of rawResponse.records) {
                    const obj: any = {};
                    record.keys.forEach((key: any) => {
                        const rawVal = record.get(key);
                        obj[key] = serializeNeo4jValue(rawVal);
                    });
                    dataExtracted.push(obj);
                }

                // Aplanar resultados para que la tabla los muestre correctamente
                results = flattenResults(dataExtracted);

                const count = results.length;
                if (count > 0) {
                    finalSynthesis = `Se encontraron ${count} resultado(s).\n\n${finalSynthesis}`;
                } else {
                    finalSynthesis = `No se encontraron resultados con esos criterios en la base de datos.`;
                }
            } catch (dbError: any) {
                console.error("Error Cypher:", dbError);
                // Devolver el error detallado para debugging pero con mensaje amigable
                return NextResponse.json({
                    synthesis: `Hubo un error al ejecutar la consulta en Neo4j. Es posible que la consulta generada tenga un error de sintaxis.\n\nDetalle: ${dbError.message}`,
                    intent: 'cypher',
                    query: llamaResult.cypher_query,
                    results: [],
                    error: dbError.message
                });
            } finally {
                await session.close();
            }
        }

        return NextResponse.json({
            synthesis: finalSynthesis || 'Aquí están los resultados generados por el modelo de IA.',
            intent: llamaResult.intent === 'cypher' ? 'cypher' : 'conversational',
            query: queryExecuted || null,
            results: results
        });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
