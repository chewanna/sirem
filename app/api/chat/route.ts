import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Puedes configurar aquí de qué proveedor usar Llama. 
// Por defecto, usa Groq para rapidez si tienes GROQ_API_KEY. 
// Si prefieres usar vLLM localmente, cambia USE_VLLM a true.
const USE_VLLM = process.env.USE_VLLM === 'true' || false;
const VLLM_URL = process.env.VLLM_URL || 'http://localhost:8000/v1/chat/completions';
const USE_OLLAMA = process.env.USE_OLLAMA === 'true' || false;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Esquema resumido para que el LLM lo entienda y sepa qué tablas consultar
const DB_SCHEMA = `
Tablas y Columnas (PostgreSQL):
- personal_militar: id_personal_militar, matricula (unique), curp, rfc, nombre, apellido_paterno, apellido_materno, sexo, estado_civil, id_grado, id_arma_servicio, id_organismo, id_zona_militar, id_region_militar, fecha_nacimiento, fecha_ingreso, situacion, especialidad, profesion.
- cat_grado: id_grado, nombre_grado, abreviatura
- cat_arma_servicio: id_arma_servicio, nombre_servicio (Ej: INFANTERIA, CABALLERIA, JUSTICIA)
- cat_organismo: id_organismo, nombre_organismo, tipo_organismo, campo_militar
- cat_zona_militar: id_zona_militar, nombre_zona_militar, numero_zona_militar
- cat_region_militar: id_region_militar, nombre_region_militar, numero_region_militar
- conducta: id_conducta, id_personal_militar, tipo (EXCELENTE, BUENA, REGULAR, MALA), descripcion, fecha
- cargo: id_cargo, id_personal_militar, cargo, unidad, fecha_cargo
- historial_ascensos: id_historial_ascenso, id_personal_militar, id_grado, fecha_ascenso
- historial_adscripcion: id_adscripcion, id_personal_militar, id_organismo, fecha_inicio, fecha_fin
- familiar: id_familiar, id_personal_militar, nombre, parentesco, militar (boolean), matricula

Relaciones Principales:
- personal_militar vincula con: cat_grado, cat_arma_servicio, cat_organismo, cat_zona_militar, cat_region_militar.
- conducta, cargo, historial_ascensos, historial_adscripcion y familiar referencian a personal_militar.id_personal_militar.
`;

async function getLlamaResponse(messages: any[]) {
    const systemPrompt = `Eres el asistente experto del SIREM (Sistema de Recursos Humanos Militar).
    Tu misión es traducir peticiones de lenguaje natural a consultas SQL precisas para PostgreSQL.

    ESTRUCTURA DE BASE DE DATOS:
    ${DB_SCHEMA}

    REGLAS CRÍTICAS DE RESPUESTA:
    1. Responde ÚNICAMENTE en JSON plano.
    2. El "intent" debe ser "sql" si requiere datos, o "conversational" si es saludo/ayuda general.
    3. En "synthesis", confirma lo que vas a buscar (ej: "Buscando oficiales de Infantería en la 1/a Región...").
    4. SQL: 
       - SIEMPRE usa ILIKE para textos (ej: p.nombre ILIKE '%juan%').
       - SIEMPRE limita a 10 resultados (LIMIT 10) a menos que se pida un COUNT.
       - Usa alias claros (p para personal_militar, g para cat_grado, etc.).
       - Para buscar por nombre completo, concatena: (nombre || ' ' || apellido_paterno || ' ' || apellido_materno).
       - Si piden "última conducta" o "cargo actual", ordena por fecha DESC.

    ESTRUCTURA JSON:
    {
      "intent": "sql" | "conversational",
      "sql_query": "SELECT ... LIMIT 10",
      "synthesis": "Explicación breve de la acción."
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
                model: 'hugging-quants/Meta-Llama-3.1-8B-Instruct-AWQ-INT4', // El modelo cargado en vLLM
                messages: formattedMessages,
                stream: false,
                temperature: 0.1,
                // vLLM no soporta response_format json_object por defecto en todos los modelos,
                // aseguramos que el prompt insista en JSON
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Error al conectar con la API de vLLM: ${errBody}`);
        }
        const data = await response.json();

        // vLLM a veces puede retornar código markdown ```json {...} ```
        let content = data.choices[0].message.content.trim();
        if (content.startsWith("\`\`\`json")) {
            content = content.replace(/\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
        }
        return JSON.parse(content);

    } else if (USE_OLLAMA) {
        // Llama local usando Ollama
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3', // o llama3.2 o llama2 según lo que tengas
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
                model: 'llama3-70b-8192', // Modelo Llama 3 en Groq
                messages: formattedMessages,
                response_format: { type: "json_object" },
                temperature: 0.1 // Baja temperatura para consultas precisas
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

// Convertir bigint a string para JSON.stringify si es necesario
const serializeData = (data: any) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
};

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
        }

        // 1. Obtención de la intención y query SQL del LLM (Llama)
        const llamaResult = await getLlamaResponse(messages);

        let results: any[] = [];
        let finalSynthesis = llamaResult.synthesis;
        let queryExecuted = llamaResult.sql_query;

        // 2. Si Llama determinó que se debe consultar SQL, ejecutamos usando Prisma
        if (llamaResult.intent === 'sql' && llamaResult.sql_query) {
            try {
                // Asegurar que solo sea un SELECT (por seguridad mínima)
                if (llamaResult.sql_query.trim().toUpperCase().startsWith('SELECT')) {
                    const rawResults = await prisma.$queryRawUnsafe(llamaResult.sql_query);
                    results = serializeData(rawResults) as any[];

                    // Opción adicional: En un sistema en producción se le pasa el 'results' a Llama de nuevo
                    // para que sintetice la respuesta final, pero aquí armamos la síntesis como preview:
                    const count = results.length;
                    finalSynthesis = count > 0
                        ? `Aquí tienes ${count} candidato(s) propuestos basados en los criterios solicitados.\n\n` + finalSynthesis
                        : `No logré encontrar opciones con esos parámetros en la base de datos.`;
                } else {
                    finalSynthesis = "Consulta rechazada por seguridad: Solo se permiten sentencias SELECT.";
                    queryExecuted = undefined;
                }
            } catch (dbError: any) {
                console.error("Error SQL:", dbError);
                return NextResponse.json({
                    synthesis: "Hubo un error al interpretar o ejecutar los criterios de la base de datos.",
                    intent: 'sql',
                    query: llamaResult.sql_query,
                    error: dbError.message || 'Error de base de datos'
                });
            }
        }

        // Return de acuerdo al formato esperado por tu frontend IA
        return NextResponse.json({
            synthesis: finalSynthesis || 'Aquí están los resultados generados por el modelo de IA.',
            intent: llamaResult.intent === 'sql' ? 'sql' : 'conversational',
            query: queryExecuted,
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
