import { driver } from '../lib/neo4j';
import * as bcrypt from 'bcryptjs';

async function main() {
    console.log('Iniciando seed para Neo4j (Grafos)...');

    const session = driver.session();

    try {
        // Limpiamos base de datos actual (solo para desarrollo/pruebas)
        console.log('Limpiando base de datos...');
        await session.run('MATCH (n) DETACH DELETE n');

        // ============================================================
        //  CATÁLOGOS
        // ============================================================
        console.log('Insertando catálogos...');

        await session.run(`
            CREATE 
            // Roles
            (r1:Role {id: '1', nombre: 'ADMINISTRADOR'}),
            (r2:Role {id: '2', nombre: 'DISCIPLINA_Y_OFICIALES'}),
            (r3:Role {id: '3', nombre: 'USUARIO_REGULAR'}),
            
            // Subsecciones
            (s1:Subseccion {id: '1', nombre: 'Jefatura'}),
            (s2:Subseccion {id: '2', nombre: 'Recursos Humanos'}),
            (s3:Subseccion {id: '3', nombre: 'Moral y Disciplina'}),
            (s4:Subseccion {id: '4', nombre: 'Promociones y Evaluacion'}),
            
            // Grupos (con relación a Subseccion)
            (g1:Grupo {id: '1', nombre: 'Grupo de Enlace'})-[:PERTENECE_A]->(s1),
            (g2:Grupo {id: '2', nombre: 'Grupo de Personal'})-[:PERTENECE_A]->(s2),
            (g3:Grupo {id: '3', nombre: 'Grupo de Desarrollo y Asuntos Especiales'})-[:PERTENECE_A]->(s2),
            (g4:Grupo {id: '4', nombre: 'Grupo de Moral'})-[:PERTENECE_A]->(s3),
            (g5:Grupo {id: '5', nombre: 'Grupo de Disciplina'})-[:PERTENECE_A]->(s3),
            
            // Mesas
            (m1:Mesa {id: '1', nombre: 'Grupo de Enlace', clase: 'enlace'})-[:PERTENECE_A]->(g1),
            (m2:Mesa {id: '2', nombre: 'Mesa de Diplomados', clase: 'dem'})-[:PERTENECE_A]->(g2),
            (m3:Mesa {id: '3', nombre: 'Mesa de Grals., Jefes y Ofs.', clase: 'ofs'})-[:PERTENECE_A]->(g2),
            (m4:Mesa {id: '13', nombre: 'Mesa de Disciplina', clase: 'disc'})-[:PERTENECE_A]->(g5),
            
            // Grados
            (gr1:Grado {id: '1', nombre_grado: 'SOLDADO', abreviatura: 'SLD.'}),
            (gr6:Grado {id: '6', nombre_grado: 'GENERAL BRIGADIER', abreviatura: 'GRAL. BRG.'}),
            (gr8:Grado {id: '8', nombre_grado: 'CORONEL', abreviatura: 'COR.'}),
            (gr11:Grado {id: '11', nombre_grado: 'CAPITÁN SEGUNDO', abreviatura: 'CAP. 2/o.'}),
            
            // Armas
            (arm1:ArmaServicio {id: '1', nombre_servicio: 'INF.'}),
            (arm2:ArmaServicio {id: '2', nombre_servicio: 'CAB.'}),
            
            // Regiones y Zonas
            (reg1:RegionMilitar {id: '1', nombre_region_militar: 'III R.M. (MAZATLÁN, SIN.)', numero: 'III R.M.'}),
            (reg4:RegionMilitar {id: '4', nombre_region_militar: 'IV R.M. (MONTERREY, N.L.)', numero: 'IV R.M.'}),
            (zon1:ZonaMilitar {id: '1', nombre_zona_militar: '3/A. Z.M. (LA PAZ, B.C.S.)', numero: '3/A. Z.M.'}),
            (zon4:ZonaMilitar {id: '4', nombre_zona_militar: '5/A. Z.M. (CHIHUAHUA, CHIH.)', numero: '5/A. Z.M.'}),
            
            // Organismos
            (org1:Organismo {id: '1', nombre_organismo: 'DIR. GRAL. TIC.', campo_militar: 'CAMPO MIL. NO. 1-J'})-[:UBICADO_EN]->(reg1),
            (org2:Organismo {id: '4', nombre_organismo: '1/ER. BN. INF.', campo_militar: 'CAMPO MIL. 1-A'})-[:UBICADO_EN]->(reg1),
            (org3:Organismo {id: '3', nombre_organismo: '9/O. REGT. CAB. MOT.', campo_militar: 'MONTERREY'})-[:UBICADO_EN]->(reg4)
        `);

        // ============================================================
        //  USUARIOS
        // ============================================================
        console.log('Insertando usuarios...');
        const passwordHash = await bcrypt.hash('admin123', 10);

        await session.run(`
            MATCH (r1:Role {id: '1'})
            MATCH (r3:Role {id: '3'})
            MATCH (r2:Role {id: '2'})
            MATCH (m3:Mesa {id: '3'})
            MATCH (m4:Mesa {id: '13'})
            
            CREATE (u1:Usuario {id: '1', username: 'admin', nombre: 'Administrador Sistema', password: $passwordHash})-[:TIENE_ROL]->(r1)
            CREATE (u2:Usuario {id: '2', username: 'usuario_regular', nombre: 'Usuario Regular', password: $passwordHash})-[:TIENE_ROL]->(r3)
            CREATE (u3:Usuario {id: '3', username: 'oficiales', nombre: 'Usuario Oficiales', password: $passwordHash})-[:TIENE_ROL]->(r2)
            CREATE (u4:Usuario {id: '4', username: 'disciplina', nombre: 'Usuario Mesa Disciplina', password: $passwordHash})-[:TIENE_ROL]->(r2)
            
            CREATE (u3)-[:ASIGNADO_A]->(m3)
            CREATE (u4)-[:ASIGNADO_A]->(m4)
        `, { passwordHash });

        // ============================================================
        //  PERSONAL MILITAR Y RELACIONES
        // ============================================================
        console.log('Insertando personal militar y relaciones...');
        await session.run(`
            MATCH (gr6:Grado {id: '6'})
            MATCH (gr11:Grado {id: '11'})
            MATCH (arm1:ArmaServicio {id: '1'})
            MATCH (arm2:ArmaServicio {id: '2'})
            MATCH (org1:Organismo {id: '1'})
            MATCH (org2:Organismo {id: '4'})
            MATCH (zon1:ZonaMilitar {id: '1'})
            MATCH (zon4:ZonaMilitar {id: '4'})
            MATCH (reg1:RegionMilitar {id: '1'})
            MATCH (reg4:RegionMilitar {id: '4'})

            CREATE (p1:PersonalMilitar {
                id: '1', matricula: 'D-5475140', curp: 'GAGL720315HDFRRN08', rfc: 'GAGL720315AB3', 
                nombre: 'YAEL', apellido_paterno: 'SALGADO', apellido_materno: 'SANCHEZ', sexo: 'Masculino',
                situacion: 'PLANTA'
            })
            CREATE (p1)-[:TIENE_GRADO]->(gr6)
            CREATE (p1)-[:PERTENECE_A_ARMA]->(arm1)
            CREATE (p1)-[:ADSCRITO_A]->(org1)
            CREATE (p1)-[:EN_ZONA]->(zon1)
            CREATE (p1)-[:EN_REGION]->(reg1)
            
            CREATE (p2:PersonalMilitar {
                id: '2', matricula: 'D-6281034', curp: 'MALC850712HDFRRL05', rfc: 'MALC850712QR7', 
                nombre: 'CARLOS ALBERTO', apellido_paterno: 'MARTINEZ', apellido_materno: 'LOPEZ', sexo: 'Masculino',
                situacion: 'PLANTA'
            })
            CREATE (p2)-[:TIENE_GRADO]->(gr11)
            CREATE (p2)-[:PERTENECE_A_ARMA]->(arm2)
            CREATE (p2)-[:ADSCRITO_A]->(org2)
            CREATE (p2)-[:EN_ZONA]->(zon4)
            CREATE (p2)-[:EN_REGION]->(reg4)
        `);

        // ============================================================
        //  CARGOS Y MOVIMIENTOS
        // ============================================================
        console.log('Insertando cargos y movimientos...');
        await session.run(`
            MATCH (p1:PersonalMilitar {id: '1'})
            MATCH (p2:PersonalMilitar {id: '2'})
            
            // Movimientos
            CREATE (m1:Movimiento {id: '1', tipo: 'ASCENSO', grado: 'Teniente', unidad: 'Dir. Gral. TIC', fecha_mov: '2024-01-01'})
            CREATE (p1)-[:TUVO_MOVIMIENTO]->(m1)
            
            CREATE (m2:Movimiento {id: '3', tipo: 'ASCENSO', grado: 'Coronel', unidad: '9/o. Regt. Cab. Mot.', fecha_mov: '2023-11-16'})
            CREATE (p2)-[:TUVO_MOVIMIENTO]->(m2)
            
            // Cargos
            CREATE (c1:Cargo {id: '1', cargo: 'Jefe de Sección TIC', unidad: 'Dir. Gral. TIC', ubicacion: 'CDMX', fecha_cargo: '2023-01-01'})
            CREATE (p1)-[:DESEMPENO_CARGO]->(c1)
            
            CREATE (c2:Cargo {id: '3', cargo: 'Comandante de Batallón', unidad: '9/o. Regt. Cab. Mot.', ubicacion: 'Mty', fecha_cargo: '2023-11-16'})
            CREATE (p2)-[:DESEMPENO_CARGO]->(c2)
        `);

        console.log('Seed completo ejecutado correctamente para Neo4j (Grafos).');
    } catch (error) {
        console.error('Error durante el seed de Neo4j:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

main();
