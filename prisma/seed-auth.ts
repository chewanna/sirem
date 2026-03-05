import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // 1. Insertar subsecciones
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

    // Insertar grupos
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

    // Insertar mesas
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

    // Insertar Roles
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

    // Insertar un usuario admin por defecto si no existe
    const adminPasswordHashed = await bcrypt.hash('admin', 10);
    const regularPasswordHashed = await bcrypt.hash('1234', 10);
    const oficialesPasswordHashed = await bcrypt.hash('ofi123', 10);

    const usersData = [
        {
            id_usuario: 1,
            username: 'admin',
            password: adminPasswordHashed,
            nombre: 'Administrador Sistema',
            id_role: 1,
            id_mesa: null,
            id_grupo: null,
            id_subsec: null
        },
        {
            id_usuario: 2,
            username: 'usuario_regular',
            password: regularPasswordHashed,
            nombre: 'Usuario Regular',
            id_role: 3,
            id_mesa: 8,
            id_grupo: 3,
            id_subsec: 2
        },
        {
            id_usuario: 3,
            username: 'oficiales',
            password: oficialesPasswordHashed,
            nombre: 'Usuario Oficiales',
            id_role: 2,
            id_mesa: 3,
            id_grupo: 2,
            id_subsec: 2
        },
        {
            id_usuario: 4,
            username: 'disciplina',
            password: oficialesPasswordHashed,
            nombre: 'Usuario Mesa Disciplina',
            id_role: 2,
            id_mesa: 13,
            id_grupo: 5,
            id_subsec: 3
        }
    ];

    for (const u of usersData) {
        await prisma.usuario.upsert({
            where: { username: u.username },
            update: { ...u, password: u.password },
            create: u
        });
    }

    console.log('Catálogos y roles iniciales creados.');
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
