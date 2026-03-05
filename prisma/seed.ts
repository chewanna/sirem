import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // ============================================================
    //  SECCIÓN 1: CATÁLOGOS DE AUTENTICACIÓN
    // ============================================================

    // 1.1 Subsecciones
    const subseccionesData = [
        { id_subseccion: 1, nombresubsec: 'Jefatura' },
        { id_subseccion: 2, nombresubsec: 'Recursos Humanos' },
        { id_subseccion: 3, nombresubsec: 'Moral y Disciplina' },
        { id_subseccion: 4, nombresubsec: 'Promociones y Evaluacion' }
    ];
    for (const sub of subseccionesData) {
        await prisma.subseccion.upsert({
            where: { id_subseccion: sub.id_subseccion },
            update: sub,
            create: sub
        });
    }

    // 1.2 Grupos
    const gruposData = [
        { grupo_id: 1, nombregrupo: 'Grupo de Enlace', subsecc: 1 },
        { grupo_id: 2, nombregrupo: 'Grupo de Personal', subsecc: 2 },
        { grupo_id: 3, nombregrupo: 'Grupo de Desarrollo y Asuntos Especiales', subsecc: 2 },
        { grupo_id: 4, nombregrupo: 'Grupo de Moral', subsecc: 3 },
        { grupo_id: 5, nombregrupo: 'Grupo de Disciplina', subsecc: 3 },
        { grupo_id: 6, nombregrupo: 'Grupo Juridico', subsecc: 3 },
        { grupo_id: 7, nombregrupo: 'Grupo de Potencial', subsecc: 4 },
        { grupo_id: 8, nombregrupo: 'Grupo de Evaluacion', subsecc: 4 },
        { grupo_id: 9, nombregrupo: 'Grupo de Cuestionarios', subsecc: 4 },
        { grupo_id: 10, nombregrupo: 'Centro Integral de Evaluacion', subsecc: 4 }
    ];
    for (const grp of gruposData) {
        await prisma.grupo.upsert({
            where: { grupo_id: grp.grupo_id },
            update: grp,
            create: grp
        });
    }

    // 1.3 Mesas
    const mesasData = [
        { mesa_id: 1, nombremesa: 'Grupo de Enlace', abreviado: 'Gpo. Enl.', grupopert: 1, subsecpert: 1, clase: 'enlace' },
        { mesa_id: 2, nombremesa: 'Mesa de Diplomados', abreviado: 'Diplomados', grupopert: 2, subsecpert: 2, clase: 'dem' },
        { mesa_id: 3, nombremesa: 'Mesa de Grals., Jefes y Ofs.', abreviado: 'Oficiales', grupopert: 2, subsecpert: 2, clase: 'ofs' },
        { mesa_id: 4, nombremesa: 'Mesa de Especialistas', abreviado: 'Especialistas', grupopert: 2, subsecpert: 2, clase: 'espls' },
        { mesa_id: 5, nombremesa: 'Mesa de Reclutamiento', abreviado: 'Reclutamiento', grupopert: 3, subsecpert: 2, clase: 'rcto' },
        { mesa_id: 6, nombremesa: 'Mesa de Servicios Especiales', abreviado: '', grupopert: 3, subsecpert: 2, clase: 'svsespls' },
        { mesa_id: 7, nombremesa: 'Mesa de Normatividad Gubernamental', abreviado: '', grupopert: 3, subsecpert: 2, clase: 'ng' },
        { mesa_id: 8, nombremesa: 'Mesa Administrativa', abreviado: '', grupopert: 3, subsecpert: 2, clase: 'admtva' },
        { mesa_id: 9, nombremesa: 'Unidad de Control de Confianza', abreviado: '', grupopert: 3, subsecpert: 2, clase: 'ucc' },
        { mesa_id: 10, nombremesa: 'Mesa de Seguridad Social', abreviado: '', grupopert: 4, subsecpert: 3, clase: 'sgdsoc' },
        { mesa_id: 11, nombremesa: 'Mesa de Recompensas', abreviado: '', grupopert: 4, subsecpert: 3, clase: 'recomp' },
        { mesa_id: 12, nombremesa: 'Mesa de Licencias', abreviado: '', grupopert: 4, subsecpert: 3, clase: 'lics' },
        { mesa_id: 13, nombremesa: 'Mesa de Disciplina', abreviado: '', grupopert: 5, subsecpert: 3, clase: 'disc' },
        { mesa_id: 14, nombremesa: 'Mesa de Igualdad de Genero', abreviado: '', grupopert: 5, subsecpert: 3, clase: 'igualdad' },
        { mesa_id: 15, nombremesa: 'Mesa Penal', abreviado: '', grupopert: 6, subsecpert: 3, clase: 'penal' },
        { mesa_id: 16, nombremesa: 'Mesa de Amparos', abreviado: '', grupopert: 6, subsecpert: 3, clase: 'amparos' },
        { mesa_id: 17, nombremesa: 'Mesa Administrativa y Transparencia', abreviado: '', grupopert: 6, subsecpert: 3, clase: '' },
        { mesa_id: 18, nombremesa: 'Mesa de Derechos Humanos', abreviado: '', grupopert: 6, subsecpert: 3, clase: '' },
        { mesa_id: 19, nombremesa: 'Mesa de Promocion Superior', abreviado: '', grupopert: 7, subsecpert: 4, clase: '' },
        { mesa_id: 20, nombremesa: 'Mesa de Analisis Exps. Proms. Gral., Esp. y Sgtos. 1/os.', abreviado: '', grupopert: 7, subsecpert: 4, clase: '' },
        { mesa_id: 21, nombremesa: 'Mesa de Veteranizacion, Reclasificacion y Agregadurias Mils.', abreviado: '', grupopert: 7, subsecpert: 4, clase: '' },
        { mesa_id: 22, nombremesa: 'Mesa de Cursos Nacionales y en el Extranjero', abreviado: '', grupopert: 8, subsecpert: 4, clase: '' },
        { mesa_id: 23, nombremesa: 'Mesa del Sistema Educativo Militar', abreviado: '', grupopert: 8, subsecpert: 4, clase: '' },
        { mesa_id: 24, nombremesa: 'Coord. Gral. Grupo de Cuestionarios', abreviado: '', grupopert: 9, subsecpert: 4, clase: '' },
        { mesa_id: 25, nombremesa: 'Mesa de Coordinacion de Apoyos', abreviado: '', grupopert: 9, subsecpert: 4, clase: '' },
        { mesa_id: 26, nombremesa: 'Mesa de Cuestionarios', abreviado: '', grupopert: 9, subsecpert: 4, clase: '' },
        { mesa_id: 27, nombremesa: 'Mesa de Programacion y Captura', abreviado: '', grupopert: 9, subsecpert: 4, clase: '' },
        { mesa_id: 28, nombremesa: 'Subcentro de Evaluacion de Aptitud Profesional', abreviado: '', grupopert: 10, subsecpert: 4, clase: '' },
        { mesa_id: 29, nombremesa: 'Subcentro de Evaluacion Medica', abreviado: '', grupopert: 10, subsecpert: 4, clase: '' },
        { mesa_id: 30, nombremesa: 'Subcentro de Evaluacion de Capacidad Fisica', abreviado: '', grupopert: 10, subsecpert: 4, clase: '' },
        { mesa_id: 31, nombremesa: 'Mesa de seguimiento a tramites especificos', abreviado: '', grupopert: 1, subsecpert: 1, clase: '' }
    ];
    for (const ms of mesasData) {
        await prisma.mesa.upsert({
            where: { mesa_id: ms.mesa_id },
            update: ms,
            create: ms
        });
    }

    // 1.4 Roles
    const rolesData = [
        { id_role: 1, nombre_role: 'ADMINISTRADOR' },
        { id_role: 2, nombre_role: 'DISCIPLINA_Y_OFICIALES' },
        { id_role: 3, nombre_role: 'USUARIO_REGULAR' }
    ];
    for (const r of rolesData) {
        await prisma.role.upsert({
            where: { id_role: r.id_role },
            update: r,
            create: r
        });
    }

    // 1.5 Usuarios (passwords already hashed from DB)
    const usersData = [
        { id_usuario: 1, username: 'admin', password: '$2b$10$HRamb3mSHD6.3HWbwV47Z.3CEerMWLQ69fY3wg7m8gL9tkTKH0Psi', nombre: 'Administrador Sistema', id_role: 1, id_mesa: null, id_grupo: null, id_subsec: null },
        { id_usuario: 2, username: 'usuario_regular', password: '$2b$10$XtyE3IIBwcA8MlfBOXURj..4.DOf2ZGld022vjBklEstgQgNxPv3a', nombre: 'Usuario Regular', id_role: 3, id_mesa: 8, id_grupo: 3, id_subsec: 2 },
        { id_usuario: 3, username: 'oficiales', password: '$2b$10$dO4CuHsRtNSeQEJexwtQ2OD3NT8BQ.JhLIGYL4EANsnGZ.1L5Zhna', nombre: 'Usuario Oficiales', id_role: 2, id_mesa: 3, id_grupo: 2, id_subsec: 2 },
        { id_usuario: 4, username: 'disciplina', password: '$2b$10$qW7MTMJj.QcWkDi3mQ.iMuCgWR59JAFUnAjP/xcvR7pY.SlSKJxUa', nombre: 'Usuario Mesa Disciplina', id_role: 2, id_mesa: 13, id_grupo: 5, id_subsec: 3 },
        { id_usuario: 5, username: 'quien', password: '$2b$10$ha.Gx.mgnVx0L9qRsJF3Wuubktv8Yv.cd6HlAPq83O1ahiUyl30SW', nombre: 'perry', id_role: 3, id_mesa: 18, id_grupo: 6, id_subsec: 3 }
    ];
    for (const u of usersData) {
        await prisma.usuario.upsert({
            where: { username: u.username },
            update: { ...u, password: u.password },
            create: u
        });
    }

    // ============================================================
    //  SECCIÓN 2: CATÁLOGOS PRINCIPALES
    // ============================================================

    // 2.1 Grados
    const gradosData = [
        { id_grado: 1, nombre_grado: 'SOLDADO', abreviatura: 'SLD.' },
        { id_grado: 2, nombre_grado: 'MAYOR', abreviatura: 'MYR.' },
        { id_grado: 3, nombre_grado: 'CABO', abreviatura: '' },
        { id_grado: 4, nombre_grado: 'SARGENTO PRIMERO', abreviatura: 'SGTO. 1/o.' },
        { id_grado: 5, nombre_grado: 'SUBTENIENTE', abreviatura: 'SBTTE.' },
        { id_grado: 6, nombre_grado: 'GENERAL BRIGADIER', abreviatura: 'GRAL. BRG.' },
        { id_grado: 7, nombre_grado: 'GENERAL BRIGADA', abreviatura: 'GRAL. BGDA.' },
        { id_grado: 8, nombre_grado: 'CORONEL', abreviatura: 'COR.' },
        { id_grado: 9, nombre_grado: 'TENIENTE CORONEL', abreviatura: 'TTE. COR.' },
        { id_grado: 10, nombre_grado: 'TENIENTE', abreviatura: 'TTE.' },
        { id_grado: 11, nombre_grado: 'CAPITÁN SEGUNDO', abreviatura: 'CAP. 2/o.' },
        { id_grado: 12, nombre_grado: 'CAPITÁN PRIMERO', abreviatura: 'CAP. 1/o.' },
        { id_grado: 13, nombre_grado: 'GENERAL DIVISIÓN', abreviatura: 'GRAL. DIV.' }
    ];
    for (const g of gradosData) {
        await prisma.catGrado.upsert({ where: { id_grado: g.id_grado }, update: g, create: g });
    }

    // 2.2 Armas/Servicios
    const armasData = [
        { id_arma_servicio: 1, nombre_servicio: 'INF.' },
        { id_arma_servicio: 2, nombre_servicio: 'CAB.' },
        { id_arma_servicio: 3, nombre_servicio: 'INT.' },
        { id_arma_servicio: 4, nombre_servicio: 'ART.' },
        { id_arma_servicio: 5, nombre_servicio: 'I.C.I.' }
    ];
    for (const a of armasData) {
        await prisma.catArmaServicio.upsert({ where: { id_arma_servicio: a.id_arma_servicio }, update: a, create: a });
    }

    // 2.3 Regiones Militares
    const regionesData = [
        { id_region_militar: 1, nombre_region_militar: 'III R.M. (MAZATLÁN, SIN.)', numero_region_militar: 'III R.M.' },
        { id_region_militar: 2, nombre_region_militar: 'I R.M. (COL. AVIACION CIVIL, D.F.)', numero_region_militar: 'I R.M.' },
        { id_region_militar: 3, nombre_region_militar: 'V R.M. (GUADALAJARA, JAL.)', numero_region_militar: 'V R.M.' },
        { id_region_militar: 4, nombre_region_militar: 'II R.M. (MEXICALI, B.C.)', numero_region_militar: 'II R.M.' },
        { id_region_militar: 5, nombre_region_militar: 'IV R.M. (MONTERREY, N.L.)', numero_region_militar: 'IV R.M.' }
    ];
    for (const r of regionesData) {
        await prisma.catRegionMilitar.upsert({ where: { id_region_militar: r.id_region_militar }, update: r, create: r });
    }

    // 2.4 Zonas Militares
    const zonasData = [
        { id_zona_militar: 1, nombre_zona_militar: '3/A. Z.M. (LA PAZ, B.C.S.)', numero_zona_militar: '3/A. Z.M.' },
        { id_zona_militar: 2, nombre_zona_militar: '1/A. Z.M. (TACUBAYA, D.F.)', numero_zona_militar: '1/A. Z.M.' },
        { id_zona_militar: 3, nombre_zona_militar: '2/A. Z.M. (TIJUANA, B.C.)', numero_zona_militar: '2/A. Z.M.' },
        { id_zona_militar: 4, nombre_zona_militar: '5/A. Z.M. (CHIHUAHUA, CHIH.)', numero_zona_militar: '5/A. Z.M.' },
        { id_zona_militar: 5, nombre_zona_militar: '4/A. Z.M. (HERMOSILLO, SON.)', numero_zona_militar: '4/A. Z.M.' }
    ];
    for (const z of zonasData) {
        await prisma.catZonaMilitar.upsert({ where: { id_zona_militar: z.id_zona_militar }, update: z, create: z });
    }

    // 2.5 Organismos
    const organismosData = [
        { id_organismo: 1, nombre_organismo: 'DIR. GRAL. TIC., CAMPO MIL. NO. 1-J, PREDIO REFORMA, CD. MÉX.', tipo_organismo: null, campo_militar: 'CAMPO MIL. NO. 1-J', id_region_militar: 1 },
        { id_organismo: 2, nombre_organismo: '20/O. BN. INF., GUADALAJARA, JAL.', tipo_organismo: null, campo_militar: 'CUARTEL MILITAR, GUADALAJARA', id_region_militar: 5 },
        { id_organismo: 3, nombre_organismo: '9/O. REGT. CAB. MOT., MONTERREY, N.L.', tipo_organismo: null, campo_militar: 'CUARTEL MILITAR, MONTERREY', id_region_militar: 4 },
        { id_organismo: 4, nombre_organismo: '1/ER. BN. INF., CAMPO MIL. NO. 1-A, CD. MÉX.', tipo_organismo: null, campo_militar: 'CAMPO MIL. NO. 1-A', id_region_militar: 1 },
        { id_organismo: 5, nombre_organismo: '2/O. BN. INF., MEXICALI, B.C.', tipo_organismo: null, campo_militar: 'CUARTEL MILITAR, MEXICALI', id_region_militar: 2 }
    ];
    for (const o of organismosData) {
        await prisma.catOrganismo.upsert({ where: { id_organismo: o.id_organismo }, update: o, create: o });
    }

    // ==================== PERSONAS ====================
    const personasData = [
        { id_personal_militar: 1, matricula: 'D-5475140', curp: 'GAGL720315HDFRRN08', rfc: 'GAGL720315AB3', nombre: 'YAEL', apellido_paterno: 'SALGADO', apellido_materno: 'SANCHEZ', fecha_nacimiento: new Date('2000-04-23T00:00:00.000Z'), sexo: 'Masculino', estado_civil: 'Soltero', foto_url: '/fotos/D5475140.jpg', id_grado: 6, id_arma_servicio: 1, id_organismo: 1, id_zona_militar: 1, id_region_militar: 1, fecha_ingreso: new Date('2019-09-01T00:00:00.000Z'), fecha_empleo: new Date('2025-09-01T00:00:00.000Z'), fecha_grado: new Date('2026-09-01T00:00:00.000Z'), situacion: 'PLANTA', lugar_nacimiento: 'PUEBLA, PUE.', estado_nacimiento: 'PUEBLA', domicilio: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX', telefono: '55-1234-5678', email: 'yael.salgado@sedena.gob.mx', especialidad: null, profesion: null },
        { id_personal_militar: 2, matricula: 'D-6281034', curp: 'MALC850712HDFRRL05', rfc: 'MALC850712QR7', nombre: 'CARLOS ALBERTO', apellido_paterno: 'MARTINEZ', apellido_materno: 'LOPEZ', fecha_nacimiento: new Date('1985-07-12T00:00:00.000Z'), sexo: 'Masculino', estado_civil: 'Casado', foto_url: '/fotos/D6281034.jpg', id_grado: 11, id_arma_servicio: 2, id_organismo: 4, id_zona_militar: 4, id_region_militar: 4, fecha_ingreso: new Date('2005-01-15T00:00:00.000Z'), fecha_empleo: new Date('2020-03-01T00:00:00.000Z'), fecha_grado: new Date('2023-11-16T00:00:00.000Z'), situacion: 'PLANTA', lugar_nacimiento: 'MONTERREY, N.L.', estado_nacimiento: 'NUEVO LEON', domicilio: 'Calle Morelos 456, Col. Centro, Monterrey', telefono: '81-9876-5432', email: 'carlos.martinez@sedena.gob.mx', especialidad: null, profesion: null },
        { id_personal_militar: 3, matricula: 'D-7394521', curp: 'HEGF900320MDFRRL09', rfc: 'HEGF900320KL2', nombre: 'MARIA FERNANDA', apellido_paterno: 'HERNANDEZ', apellido_materno: 'GARCIA', fecha_nacimiento: new Date('1990-03-20T00:00:00.000Z'), sexo: 'Femenino', estado_civil: 'Soltera', foto_url: null, id_grado: 10, id_arma_servicio: 5, id_organismo: 5, id_zona_militar: 5, id_region_militar: 5, fecha_ingreso: new Date('2010-08-01T00:00:00.000Z'), fecha_empleo: new Date('2022-06-15T00:00:00.000Z'), fecha_grado: new Date('2024-01-10T00:00:00.000Z'), situacion: 'PLANTA', lugar_nacimiento: 'GUADALAJARA, JAL.', estado_nacimiento: 'JALISCO', domicilio: 'Av. Vallarta 789, Col. Americana, Guadalajara', telefono: '33-4567-8901', email: 'maria.hernandez@sedena.gob.mx', especialidad: null, profesion: null },
        { id_personal_militar: 4, matricula: 'D-8102937', curp: 'RATL780515HDFMRS06', rfc: 'RATL780515PQ8', nombre: 'JOSE LUIS', apellido_paterno: 'RAMIREZ', apellido_materno: 'TORRES', fecha_nacimiento: new Date('1978-05-15T00:00:00.000Z'), sexo: 'Masculino', estado_civil: 'Casado', foto_url: null, id_grado: 12, id_arma_servicio: 3, id_organismo: 3, id_zona_militar: 2, id_region_militar: 2, fecha_ingreso: new Date('1998-02-10T00:00:00.000Z'), fecha_empleo: new Date('2018-09-20T00:00:00.000Z'), fecha_grado: new Date('2021-06-01T00:00:00.000Z'), situacion: 'PLANTA', lugar_nacimiento: 'MEXICALI, B.C.', estado_nacimiento: 'BAJA CALIFORNIA', domicilio: 'Blvd. Benito Juárez 321, Col. Nueva, Mexicali', telefono: '686-234-5678', email: 'jose.ramirez@sedena.gob.mx', especialidad: null, profesion: null },
        { id_personal_militar: 5, matricula: 'D-9215678', curp: 'GOMA880930MDFLNL02', rfc: 'GOMA880930TT5', nombre: 'ANA PATRICIA', apellido_paterno: 'GONZALEZ', apellido_materno: 'MENDOZA', fecha_nacimiento: new Date('1988-09-30T00:00:00.000Z'), sexo: 'Femenino', estado_civil: 'Casada', foto_url: '/fotos/D9215678.jpg', id_grado: 9, id_arma_servicio: 1, id_organismo: 2, id_zona_militar: 1, id_region_militar: 1, fecha_ingreso: new Date('2008-07-01T00:00:00.000Z'), fecha_empleo: new Date('2021-01-15T00:00:00.000Z'), fecha_grado: new Date('2023-08-20T00:00:00.000Z'), situacion: 'PLANTA', lugar_nacimiento: 'CDMX', estado_nacimiento: 'CIUDAD DE MEXICO', domicilio: 'Calle Reforma 567, Col. Juárez, CDMX', telefono: '55-6789-0123', email: 'ana.gonzalez@sedena.gob.mx', especialidad: null, profesion: null },
        { id_personal_militar: 6, matricula: 'D-1043289', curp: 'FOVR920214HDFLLR07', rfc: 'FOVR920214AB1', nombre: 'RICARDO', apellido_paterno: 'FLORES', apellido_materno: 'VAZQUEZ', fecha_nacimiento: new Date('1992-02-14T00:00:00.000Z'), sexo: 'Masculino', estado_civil: 'Soltero', foto_url: '/fotos/D1043289.jpg', id_grado: 8, id_arma_servicio: 2, id_organismo: 1, id_zona_militar: 3, id_region_militar: 3, fecha_ingreso: new Date('2012-03-15T00:00:00.000Z'), fecha_empleo: new Date('2023-10-01T00:00:00.000Z'), fecha_grado: new Date('2025-05-16T00:00:00.000Z'), situacion: 'PLANTA', lugar_nacimiento: 'CULIACÁN, SIN.', estado_nacimiento: 'SINALOA', domicilio: 'Av. Obregón 890, Col. Centro, Culiacán', telefono: '667-345-6789', email: 'ricardo.flores@sedena.gob.mx', especialidad: null, profesion: null },
        { id_personal_militar: 7, matricula: 'D-1156743', curp: 'DIMA950625MDFLZR04', rfc: 'DIMA950625CD3', nombre: 'ALEJANDRA', apellido_paterno: 'DIAZ', apellido_materno: 'MORALES', fecha_nacimiento: new Date('1995-06-25T00:00:00.000Z'), sexo: 'Femenino', estado_civil: 'Soltera', foto_url: null, id_grado: 5, id_arma_servicio: 5, id_organismo: 3, id_zona_militar: 5, id_region_militar: 2, fecha_ingreso: new Date('2015-06-01T00:00:00.000Z'), fecha_empleo: new Date('2024-02-15T00:00:00.000Z'), fecha_grado: new Date('2025-11-01T00:00:00.000Z'), situacion: 'PLANTA', lugar_nacimiento: 'CHIHUAHUA, CHIH.', estado_nacimiento: 'CHIHUAHUA', domicilio: 'Calle Libertad 234, Col. Centro, Chihuahua', telefono: '614-567-8901', email: 'alejandra.diaz@sedena.gob.mx', especialidad: null, profesion: null },
        { id_personal_militar: 8, matricula: 'D-1267891', curp: 'CARM830418HDFSTS01', rfc: 'CARM830418EF6', nombre: 'MIGUEL ANGEL', apellido_paterno: 'CASTRO', apellido_materno: 'RUIZ', fecha_nacimiento: new Date('1983-04-18T00:00:00.000Z'), sexo: 'Masculino', estado_civil: 'Casado', foto_url: null, id_grado: 10, id_arma_servicio: 4, id_organismo: 4, id_zona_militar: 4, id_region_militar: 4, fecha_ingreso: new Date('2003-09-01T00:00:00.000Z'), fecha_empleo: new Date('2019-07-10T00:00:00.000Z'), fecha_grado: new Date('2022-12-16T00:00:00.000Z'), situacion: 'COMISION', lugar_nacimiento: 'HERMOSILLO, SON.', estado_nacimiento: 'SONORA', domicilio: 'Blvd. Kino 456, Col. Pitic, Hermosillo', telefono: '662-890-1234', email: 'miguel.castro@sedena.gob.mx', especialidad: null, profesion: null },
        { id_personal_militar: 9, matricula: 'D-1378456', curp: 'OIJD970810MDFRTN08', rfc: 'OIJD970810GH9', nombre: 'DIANA LAURA', apellido_paterno: 'ORTIZ', apellido_materno: 'JIMENEZ', fecha_nacimiento: new Date('1997-08-10T00:00:00.000Z'), sexo: 'Femenino', estado_civil: 'Soltera', foto_url: null, id_grado: 7, id_arma_servicio: 1, id_organismo: 2, id_zona_militar: 1, id_region_militar: 1, fecha_ingreso: new Date('2017-01-10T00:00:00.000Z'), fecha_empleo: new Date('2025-04-01T00:00:00.000Z'), fecha_grado: new Date('2026-01-16T00:00:00.000Z'), situacion: 'PLANTA', lugar_nacimiento: 'OAXACA, OAX.', estado_nacimiento: 'OAXACA', domicilio: 'Calle Macedonio Alcalá 123, Col. Centro, Oaxaca', telefono: '951-234-5678', email: 'diana.ortiz@sedena.gob.mx', especialidad: null, profesion: null },
        { id_personal_militar: 10, matricula: 'D-1489012', curp: 'PEAF800101HDFRGR03', rfc: 'PEAF800101IJ4', nombre: 'FRANCISCO JAVIER', apellido_paterno: 'PEREZ', apellido_materno: 'AGUILAR', fecha_nacimiento: new Date('1980-01-01T00:00:00.000Z'), sexo: 'Masculino', estado_civil: 'Divorciado', foto_url: null, id_grado: 9, id_arma_servicio: 3, id_organismo: 5, id_zona_militar: 5, id_region_militar: 5, fecha_ingreso: new Date('2000-06-01T00:00:00.000Z'), fecha_empleo: new Date('2017-11-16T00:00:00.000Z'), fecha_grado: new Date('2020-09-16T00:00:00.000Z'), situacion: 'PLANTA', lugar_nacimiento: 'LEÓN, GTO.', estado_nacimiento: 'GUANAJUATO', domicilio: 'Blvd. López Mateos 678, Col. León Moderno, León', telefono: '477-678-9012', email: 'francisco.perez@sedena.gob.mx', especialidad: null, profesion: null }
    ];
    for (const p of personasData) {
        await prisma.personalMilitar.upsert({
            where: { id_personal_militar: p.id_personal_militar },
            update: { ...p, id_personal_militar: undefined },
            create: p
        });
    }

    // ==================== CARGOS ====================
    const cargosData = [
        { id_cargo: 1, id_personal_militar: 1, grado: 'Teniente', fecha_cargo: new Date('2023-01-01T00:00:00.000Z'), cargo: 'Jefe de Sección TIC', unidad: 'Dir. Gral. TIC', ubicacion: 'Ciudad de México' },
        { id_cargo: 2, id_personal_militar: 1, grado: 'Subteniente', fecha_cargo: new Date('2020-06-15T00:00:00.000Z'), cargo: 'Auxiliar de Sección', unidad: '1/er. Bn. Inf.', ubicacion: 'Ciudad de México' },
        { id_cargo: 3, id_personal_militar: 2, grado: 'Coronel', fecha_cargo: new Date('2023-11-16T00:00:00.000Z'), cargo: 'Comandante de Batallón', unidad: '9/o. Regt. Cab. Mot.', ubicacion: 'Monterrey, N.L.' },
        { id_cargo: 4, id_personal_militar: 2, grado: 'Tte. Cor.', fecha_cargo: new Date('2018-05-01T00:00:00.000Z'), cargo: 'Segundo Comandante', unidad: '15/o. Bn. Inf.', ubicacion: 'Saltillo, Coah.' },
        { id_cargo: 5, id_personal_militar: 2, grado: 'Mayor', fecha_cargo: new Date('2014-09-16T00:00:00.000Z'), cargo: 'Jefe de Sección', unidad: 'E.M. IV R.M.', ubicacion: 'Monterrey, N.L.' },
        { id_cargo: 6, id_personal_militar: 3, grado: 'Tte. Cor.', fecha_cargo: new Date('2024-01-10T00:00:00.000Z'), cargo: 'Jefe de Departamento', unidad: '20/o. Bn. Inf.', ubicacion: 'Guadalajara, Jal.' },
        { id_cargo: 7, id_personal_militar: 3, grado: 'Mayor', fecha_cargo: new Date('2019-03-20T00:00:00.000Z'), cargo: 'Jefe de Sección Logística', unidad: 'E.M. V R.M.', ubicacion: 'Guadalajara, Jal.' },
        { id_cargo: 8, id_personal_militar: 4, grado: 'Gral. Bdier.', fecha_cargo: new Date('2021-06-01T00:00:00.000Z'), cargo: 'Comandante de Guarnición', unidad: '2/o. Bn. Inf.', ubicacion: 'Mexicali, B.C.' },
        { id_cargo: 9, id_personal_militar: 4, grado: 'Coronel', fecha_cargo: new Date('2015-11-16T00:00:00.000Z'), cargo: 'Comandante de Regimiento', unidad: '3/er. Regt. Art.', ubicacion: 'Ensenada, B.C.' },
        { id_cargo: 10, id_personal_militar: 4, grado: 'Tte. Cor.', fecha_cargo: new Date('2010-05-01T00:00:00.000Z'), cargo: 'Jefe de E.M.', unidad: '2/a. Z.M.', ubicacion: 'Tijuana, B.C.' },
        { id_cargo: 11, id_personal_militar: 5, grado: 'Mayor', fecha_cargo: new Date('2023-08-20T00:00:00.000Z'), cargo: 'Jefe de Sección Operaciones', unidad: '1/er. Bn. Inf.', ubicacion: 'Ciudad de México' },
        { id_cargo: 12, id_personal_militar: 5, grado: 'Cap. 1/o.', fecha_cargo: new Date('2018-04-16T00:00:00.000Z'), cargo: 'Cmdte. de Compañía', unidad: 'Bn. Guardia Presidencial', ubicacion: 'Ciudad de México' },
        { id_cargo: 13, id_personal_militar: 6, grado: 'Cap. 1/o.', fecha_cargo: new Date('2025-05-16T00:00:00.000Z'), cargo: 'Cmdte. de Compañía', unidad: 'Dir. Gral. TIC', ubicacion: 'Ciudad de México' },
        { id_cargo: 14, id_personal_militar: 6, grado: 'Capitán 2/o.', fecha_cargo: new Date('2021-09-01T00:00:00.000Z'), cargo: 'Auxiliar del E.M.', unidad: '3/a. Z.M.', ubicacion: 'La Paz, B.C.S.' },
        { id_cargo: 15, id_personal_militar: 7, grado: 'Subteniente', fecha_cargo: new Date('2025-11-01T00:00:00.000Z'), cargo: 'Jefe de Pelotón', unidad: '2/o. Bn. Inf.', ubicacion: 'Mexicali, B.C.' },
        { id_cargo: 16, id_personal_militar: 8, grado: 'Tte. Cor.', fecha_cargo: new Date('2022-12-16T00:00:00.000Z'), cargo: 'Jefe de Sección', unidad: '9/o. Regt. Cab. Mot.', ubicacion: 'Monterrey, N.L.' },
        { id_cargo: 17, id_personal_militar: 8, grado: 'Mayor', fecha_cargo: new Date('2016-06-01T00:00:00.000Z'), cargo: 'Segundo Cmdte. de Escuadrón', unidad: '4/o. Regt. Cab.', ubicacion: 'Hermosillo, Son.' },
        { id_cargo: 18, id_personal_militar: 8, grado: 'Cap. 1/o.', fecha_cargo: new Date('2011-11-16T00:00:00.000Z'), cargo: 'Cmdte. de Escuadrón', unidad: '12/o. Regt. Cab.', ubicacion: 'Chihuahua, Chih.' },
        { id_cargo: 19, id_personal_militar: 9, grado: 'Cap. 2/o.', fecha_cargo: new Date('2026-01-16T00:00:00.000Z'), cargo: 'Auxiliar de Sección', unidad: '1/er. Bn. Inf.', ubicacion: 'Ciudad de México' },
        { id_cargo: 20, id_personal_militar: 9, grado: 'Subteniente', fecha_cargo: new Date('2022-06-01T00:00:00.000Z'), cargo: 'Jefe de Pelotón', unidad: '1/er. Bn. Inf.', ubicacion: 'Ciudad de México' },
        { id_cargo: 21, id_personal_militar: 10, grado: 'Mayor', fecha_cargo: new Date('2020-09-16T00:00:00.000Z'), cargo: 'Jefe de Sección', unidad: '20/o. Bn. Inf.', ubicacion: 'Guadalajara, Jal.' },
        { id_cargo: 22, id_personal_militar: 10, grado: 'Cap. 1/o.', fecha_cargo: new Date('2015-01-01T00:00:00.000Z'), cargo: 'Cmdte. de Batería', unidad: '5/o. Regt. Art.', ubicacion: 'Zapopan, Jal.' },
        { id_cargo: 23, id_personal_militar: 10, grado: 'Capitán 2/o.', fecha_cargo: new Date('2010-11-16T00:00:00.000Z'), cargo: 'Auxiliar del E.M.', unidad: 'E.M. V R.M.', ubicacion: 'Guadalajara, Jal.' }
    ];
    for (const c of cargosData) {
        await prisma.cargo.upsert({
            where: { id_cargo: c.id_cargo },
            update: { ...c, id_cargo: undefined },
            create: c
        });
    }

    // ==================== MOVIMIENTOS ====================
    const movimientosData = [
        { id_movimiento: 1, id_personal_militar: 1, fecha_mov: new Date('2024-01-01T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Teniente', unidad: 'Dir. Gral. TIC', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 2, id_personal_militar: 1, fecha_mov: new Date('2020-06-15T00:00:00.000Z'), tipo: 'CAMBIO DE ADSCRIPCIÓN', grado: 'Subteniente', unidad: '1/er. Bn. Inf.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 3, id_personal_militar: 2, fecha_mov: new Date('2023-11-16T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Coronel', unidad: '9/o. Regt. Cab. Mot.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 4, id_personal_militar: 2, fecha_mov: new Date('2020-03-01T00:00:00.000Z'), tipo: 'CAMBIO DE ADSCRIPCIÓN', grado: 'Tte. Cor.', unidad: '15/o. Bn. Inf.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 5, id_personal_militar: 3, fecha_mov: new Date('2024-01-10T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Tte. Cor.', unidad: '20/o. Bn. Inf.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 6, id_personal_militar: 3, fecha_mov: new Date('2022-06-15T00:00:00.000Z'), tipo: 'COMISIÓN', grado: 'Mayor', unidad: 'E.M. V R.M.', situacion: 'COMISION', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 7, id_personal_militar: 4, fecha_mov: new Date('2021-06-01T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Gral. Bdier.', unidad: '2/o. Bn. Inf.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 8, id_personal_militar: 4, fecha_mov: new Date('2018-09-20T00:00:00.000Z'), tipo: 'CAMBIO DE ADSCRIPCIÓN', grado: 'Coronel', unidad: '3/er. Regt. Art.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 9, id_personal_militar: 4, fecha_mov: new Date('2015-11-16T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Coronel', unidad: '3/er. Regt. Art.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 10, id_personal_militar: 5, fecha_mov: new Date('2023-08-20T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Mayor', unidad: '1/er. Bn. Inf.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 11, id_personal_militar: 5, fecha_mov: new Date('2021-01-15T00:00:00.000Z'), tipo: 'CAMBIO DE ADSCRIPCIÓN', grado: 'Cap. 1/o.', unidad: 'Bn. Guardia Presidencial', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 12, id_personal_militar: 6, fecha_mov: new Date('2025-05-16T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Cap. 1/o.', unidad: 'Dir. Gral. TIC', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 13, id_personal_militar: 6, fecha_mov: new Date('2023-10-01T00:00:00.000Z'), tipo: 'CAMBIO DE ADSCRIPCIÓN', grado: 'Cap. 2/o.', unidad: '3/a. Z.M.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 14, id_personal_militar: 7, fecha_mov: new Date('2025-11-01T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Subteniente', unidad: '2/o. Bn. Inf.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 15, id_personal_militar: 7, fecha_mov: new Date('2024-02-15T00:00:00.000Z'), tipo: 'CAMBIO DE ADSCRIPCIÓN', grado: 'Discente', unidad: 'H. Col. Mil.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 16, id_personal_militar: 8, fecha_mov: new Date('2022-12-16T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Tte. Cor.', unidad: '9/o. Regt. Cab. Mot.', situacion: 'COMISION', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 17, id_personal_militar: 8, fecha_mov: new Date('2019-07-10T00:00:00.000Z'), tipo: 'COMISIÓN', grado: 'Mayor', unidad: '4/o. Regt. Cab.', situacion: 'COMISION', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 18, id_personal_militar: 9, fecha_mov: new Date('2026-01-16T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Cap. 2/o.', unidad: '1/er. Bn. Inf.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 19, id_personal_militar: 9, fecha_mov: new Date('2025-04-01T00:00:00.000Z'), tipo: 'CAMBIO DE ADSCRIPCIÓN', grado: 'Subteniente', unidad: '1/er. Bn. Inf.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 20, id_personal_militar: 10, fecha_mov: new Date('2020-09-16T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Mayor', unidad: '20/o. Bn. Inf.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 21, id_personal_militar: 10, fecha_mov: new Date('2017-11-16T00:00:00.000Z'), tipo: 'CAMBIO DE ADSCRIPCIÓN', grado: 'Cap. 1/o.', unidad: '5/o. Regt. Art.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 22, id_personal_militar: 10, fecha_mov: new Date('2015-01-01T00:00:00.000Z'), tipo: 'ASCENSO', grado: 'Cap. 1/o.', unidad: '5/o. Regt. Art.', situacion: 'PLANTA', motivo_movimiento: null, cargo: null, zm: null, rm: null, no_documento: null, fecha_documento: null, no_acuerdo: null, motivo_detallado: null },
        { id_movimiento: 23, id_personal_militar: 8, fecha_mov: new Date('2026-02-28T00:00:00.000Z'), tipo: '1', grado: '1', unidad: '1', situacion: '1', motivo_movimiento: '1', cargo: '1', zm: '1', rm: '1', no_documento: '1', fecha_documento: new Date('2026-02-04T00:00:00.000Z'), no_acuerdo: '1', motivo_detallado: '1' }
    ];
    for (const m of movimientosData) {
        await prisma.movimiento.upsert({
            where: { id_movimiento: m.id_movimiento },
            update: { ...m, id_movimiento: undefined },
            create: m
        });
    }

    // ==================== FAMILIARES MILITARES ====================
    const familiaresData = [
        { id_familiar_militar: 1, id_personal_militar: 1, id_familiar: 6, parentesco: 'HERMANO' },
        { id_familiar_militar: 3, id_personal_militar: 3, id_familiar: 7, parentesco: 'HERMANA' },
        { id_familiar_militar: 5, id_personal_militar: 5, id_familiar: 10, parentesco: 'ESPOSO' },
        { id_familiar_militar: 6, id_personal_militar: 9, id_familiar: 4, parentesco: 'TÍO' }
    ];
    for (const f of familiaresData) {
        await prisma.familiarMilitar.upsert({
            where: { id_familiar_militar: f.id_familiar_militar },
            update: { ...f, id_familiar_militar: undefined },
            create: f
        });
    }

    // ==================== CONDUCTAS ====================
    const conductasData = [
        { id_conducta: 7, id_personal_militar: 1, tipo: 'AMARILLO', descripcion: 'recibió comida vestido de uniforme', fecha: new Date('2026-02-24T15:24:21.997Z') },
        { id_conducta: 8, id_personal_militar: 1, tipo: 'MORADO', descripcion: 'no cumplió con la norma', fecha: new Date('2026-02-24T15:24:50.461Z') },
        { id_conducta: 9, id_personal_militar: 1, tipo: 'AZUL', descripcion: 'documentos masivos', fecha: new Date('2026-02-24T15:25:08.982Z') },
        { id_conducta: 10, id_personal_militar: 1, tipo: 'MORADO', descripcion: 'por joto', fecha: new Date('2026-02-25T18:26:06.414Z') }
    ];
    for (const c of conductasData) {
        await prisma.conducta.upsert({
            where: { id_conducta: c.id_conducta },
            update: { ...c, id_conducta: undefined },
            create: c
        });
    }

    // ==================== LISTADOS ====================
    const listadosData = [
        { id_listado: 1, nombre: 'Listado de Personal Destacado', fecha: new Date('2026-02-24T15:03:44.455Z') }
    ];
    for (const l of listadosData) {
        await prisma.listado.upsert({
            where: { id_listado: l.id_listado },
            update: { ...l, id_listado: undefined },
            create: l
        });
    }

    const listadoPersonalData = [
        { id: 47, id_listado: 1, id_personal_militar: 6, orden: 0 },
        { id: 48, id_listado: 1, id_personal_militar: 1, orden: 1 },
        { id: 49, id_listado: 1, id_personal_militar: 2, orden: 2 },
        { id: 50, id_listado: 1, id_personal_militar: 5, orden: 3 }
    ];
    for (const lp of listadoPersonalData) {
        await prisma.listadoPersonal.upsert({
            where: { id: lp.id },
            update: { ...lp, id: undefined },
            create: lp
        });
    }

    console.log('Seed completo ejecutado correctamente (auth + datos principales).');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
