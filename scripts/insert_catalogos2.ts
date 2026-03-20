import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'sirem_password';
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const subsecciones = [
  { id: '1', nombre: 'Jefatura' },
  { id: '3', nombre: 'Moral y Disciplina' },
  { id: '4', nombre: 'Promociones y Evaluacion' },
  { id: '2', nombre: 'Recursos Humanos' }
];

const grupos = [
  { id: '1', nombre: 'Grupo de Enlace', subseccionId: '1' },
  { id: '2', nombre: 'Grupo de Personal', subseccionId: '2' },
  { id: '3', nombre: 'Grupo de Desarrollo y Asuntos Especiales', subseccionId: '2' },
  { id: '4', nombre: 'Grupo de Moral', subseccionId: '3' },
  { id: '5', nombre: 'Grupo de Disciplina', subseccionId: '3' },
  { id: '6', nombre: 'Grupo Juridico', subseccionId: '3' },
  { id: '7', nombre: 'Grupo de Potencial', subseccionId: '4' },
  { id: '8', nombre: 'Grupo de Evaluacion', subseccionId: '4' },
  { id: '9', nombre: 'Grupo de Cuestionarios', subseccionId: '4' },
  { id: '10', nombre: 'Centro Integral de Evaluacion', subseccionId: '4' }
];

const mesas = [
  { id: '1', nombre: 'Grupo de Enlace', abreviatura: 'Gpo. Enl.', grupoId: '1', clase: 'enlace' },
  { id: '2', nombre: 'Mesa de Diplomados', abreviatura: 'Diplomados', grupoId: '2', clase: 'dem' },
  { id: '3', nombre: 'Mesa de Grals., Jefes y Ofs.', abreviatura: 'Oficiales', grupoId: '2', clase: 'ofs' },
  { id: '4', nombre: 'Mesa de Especialistas', abreviatura: 'Especialistas', grupoId: '2', clase: 'espls' },
  { id: '5', nombre: 'Mesa de Reclutamiento', abreviatura: 'Reclutamiento', grupoId: '3', clase: 'rcto' },
  { id: '6', nombre: 'Mesa de Servicios Especiales', abreviatura: '', grupoId: '3', clase: 'svsespls' },
  { id: '7', nombre: 'Mesa de Normatividad Gubernamental', abreviatura: '', grupoId: '3', clase: 'ng' },
  { id: '8', nombre: 'Mesa Administrativa', abreviatura: '', grupoId: '3', clase: 'admtva' },
  { id: '9', nombre: 'Unidad de Control de Confianza', abreviatura: '', grupoId: '3', clase: 'ucc' },
  { id: '10', nombre: 'Mesa de Seguridad Social', abreviatura: '', grupoId: '4', clase: 'sgdsoc' },
  { id: '11', nombre: 'Mesa de Recompensas', abreviatura: '', grupoId: '4', clase: 'recomp' },
  { id: '12', nombre: 'Mesa de Licencias', abreviatura: '', grupoId: '4', clase: 'lics' },
  { id: '13', nombre: 'Mesa de Disciplina', abreviatura: '', grupoId: '5', clase: 'disc' },
  { id: '14', nombre: 'Mesa de Igualdad de Genero', abreviatura: '', grupoId: '5', clase: 'igualdad' },
  { id: '15', nombre: 'Mesa Penal', abreviatura: '', grupoId: '6', clase: 'penal' },
  { id: '16', nombre: 'Mesa de Amparos', abreviatura: '', grupoId: '6', clase: 'amparos' },
  { id: '17', nombre: 'Mesa Administrativa y Transparencia', abreviatura: '', grupoId: '6', clase: '' },
  { id: '18', nombre: 'Mesa de Derechos Humanos', abreviatura: '', grupoId: '6', clase: '' },
  { id: '19', nombre: 'Mesa de Promocion Superior', abreviatura: '', grupoId: '7', clase: '' },
  { id: '20', nombre: 'Mesa de Analisis Exps. Proms. Gral., Esp. y Sgtos. 1/os.', abreviatura: '', grupoId: '7', clase: '' },
  { id: '21', nombre: 'Mesa de Veteranizacion, Reclasificacion y Agregadurias Mils.', abreviatura: '', grupoId: '7', clase: '' },
  { id: '22', nombre: 'Mesa de Cursos Nacionales y en el Extranjero', abreviatura: '', grupoId: '8', clase: '' },
  { id: '23', nombre: 'Mesa del Sistema Educativo Militar', abreviatura: '', grupoId: '8', clase: '' },
  { id: '24', nombre: 'Coord. Gral. Grupo de Cuestionarios', abreviatura: '', grupoId: '9', clase: '' },
  { id: '25', nombre: 'Mesa de Coordinacion de Apoyos', abreviatura: '', grupoId: '9', clase: '' },
  { id: '26', nombre: 'Mesa de Cuestionarios', abreviatura: '', grupoId: '9', clase: '' },
  { id: '27', nombre: 'Mesa de Programacion y Captura', abreviatura: '', grupoId: '9', clase: '' },
  { id: '28', nombre: 'Subcentro de Evaluacion de Aptitud Profesional', abreviatura: '', grupoId: '10', clase: '' },
  { id: '29', nombre: 'Subcentro de Evaluacion Medica', abreviatura: '', grupoId: '10', clase: '' },
  { id: '30', nombre: 'Subcentro de Evaluacion de Capacidad Fisica', abreviatura: '', grupoId: '10', clase: '' },
  { id: '31', nombre: 'Mesa de seguimiento a tramites especificos', abreviatura: '', grupoId: '1', clase: '' },
  { id: '32', nombre: 'Mesa TIC', abreviatura: 'TIC', grupoId: '3', clase: 'svsespls' }
];

async function main() {
    const session = driver.session();
    try {
        console.log('Insertando Subsecciones...');
        for (const s of subsecciones) {
            await session.run(`
                MERGE (sub:Subseccion {id: $id})
                SET sub.nombre = $nombre
            `, { id: s.id, nombre: s.nombre });
        }

        console.log('Insertando Grupos...');
        for (const g of grupos) {
            await session.run(`
                MERGE (gr:Grupo {id: $id})
                SET gr.nombre = $nombre
                WITH gr
                MATCH (sub:Subseccion {id: $subseccionId})
                MERGE (gr)-[:PERTENECE_A]->(sub)
            `, { id: g.id, nombre: g.nombre, subseccionId: g.subseccionId });
        }

        console.log('Insertando Mesas...');
        for (const m of mesas) {
            await session.run(`
                MERGE (mesa:Mesa {id: $id})
                SET mesa.nombre = $nombre, mesa.abreviatura = $abreviatura, mesa.clase = $clase
                WITH mesa
                MATCH (gr:Grupo {id: $grupoId})
                MERGE (mesa)-[:PERTENECE_A]->(gr)
            `, { id: m.id, nombre: m.nombre, abreviatura: m.abreviatura, clase: m.clase, grupoId: m.grupoId });
        }

        console.log('Hecho!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

main();
