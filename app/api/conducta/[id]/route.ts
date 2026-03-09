import { NextRequest, NextResponse } from "next/server";
import { driver } from "@/lib/neo4j";

export const dynamic = "force-dynamic";

// DELETE /api/conducta/[id]
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = driver.session();
    try {
        const id = (await params).id;
        await session.run('MATCH (c:Conducta {id: $id}) DETACH DELETE c', { id });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al eliminar conducta." }, { status: 500 });
    } finally {
        await session.close();
    }
}

