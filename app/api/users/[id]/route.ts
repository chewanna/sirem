import { NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j';
import { getUserFromToken } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const sessionToken = await getUserFromToken();
    const session = driver.session();
    try {
        const idStr = (await params).id;
        const body = await req.json();

        const { id_role, id_mesa, id_grupo, id_subsec, password, activo } = body;

        let passwordHash: string | undefined;
        if (password && password.trim() !== '') {
            passwordHash = await bcrypt.hash(password, 10);
        }

        const tx = session.beginTransaction();

        try {
            // Update native properties
            let setProps: string[] = [];
            let queryParams: any = { idStr };

            if (activo !== undefined) {
                setProps.push('u.activo = $activo');
                queryParams.activo = Boolean(activo);
            }
            if (passwordHash) {
                setProps.push('u.password = $password');
                queryParams.password = passwordHash;
            }

            if (setProps.length > 0) {
                await tx.run(`
                    MATCH (u:Usuario {id: $idStr})
                    SET ${setProps.join(', ')}
                `, queryParams);
            }

            // Roles
            if (id_role !== undefined) {
                await tx.run('MATCH (u:Usuario {id: $idStr})-[r:TIENE_ROL]->() DELETE r', { idStr });
                if (id_role) {
                    await tx.run(`
                        MATCH (u:Usuario {id: $idStr})
                        MATCH (rol:Role {id: $id_role})
                        CREATE (u)-[:TIENE_ROL]->(rol)
                    `, { idStr, id_role });
                }
            }

            // Mesa/Grupo/Subsec relationships
            if (id_mesa !== undefined || id_grupo !== undefined || id_subsec !== undefined) {
                await tx.run('MATCH (u:Usuario {id: $idStr})-[r:ASIGNADO_A]->() DELETE r', { idStr });

                // Usually assigned to Mesa if provided, otherwise maybe generic assignment isn't exactly modeled in Neo4j the same way.
                // Assuming ASIGNADO_A handles where they belong. We'll assign to the lowest level provided.
                let asignacionId = id_mesa || id_grupo || id_subsec;

                if (asignacionId) {
                    await tx.run(`
                        MATCH (u:Usuario {id: $idStr})
                        MATCH (n {id: $asignacionId}) WHERE n:Mesa OR n:Grupo OR n:Subseccion
                        CREATE (u)-[:ASIGNADO_A]->(n)
                    `, { idStr, asignacionId });
                }
            }

            await tx.commit();
            return NextResponse.json({ message: 'Usuario actualizado correctamente' });
        } catch (e) {
            await tx.rollback();
            throw e;
        }

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
    } finally {
        await session.close();
    }
}
