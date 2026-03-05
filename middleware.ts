import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// Secret debe ser el mismo que utilizas al crear el token
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'supersecret_local_dev_key'
);

// Rutas que no requieren autenticación (donde cualquiera puede entrar)
const publicPaths = ['/login', '/api/auth/login'];

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Revisamos si la ruta a la que quiere ir es pública
    const isPublicPath = publicPaths.includes(path) || path.startsWith('/api/auth/login');

    // Obtenemos el token de la sesión llamado 'sismov_token'
    const token = req.cookies.get('sismov_token')?.value;

    // Si tiene un token e intenta ir al /login, lo redireccionamos a su vista principal
    if (path === '/login' && token) {
        try {
            await jose.jwtVerify(token, JWT_SECRET);
            // Redirigir a busqueda (u otra si prefieres) si ya tiene sesión y entra al login
            return NextResponse.redirect(new URL('/busqueda', req.url));
        } catch (error) {
            // Token inválido, permitirle el paso al login
        }
    }

    // Si la ruta NO es pública y NO tiene token, lo echamos al login
    if (!isPublicPath) {
        if (!token) {
            // IMPORTANT: If this is an API call, we must return JSON so `res.json()` doesn't crash
            if (path.startsWith('/api/')) {
                return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            // Verificamos que el token no haya sido manipulado o expirado
            await jose.jwtVerify(token, JWT_SECRET);

            // Puedes añadir aquí validaciones de roles si lo deseas, 
            // sacando el { payload } de jose.jwtVerify()

        } catch (error) {
            // Token inválido o ha caducado
            let response;
            if (path.startsWith('/api/')) {
                response = NextResponse.json({ error: 'Token inválido o caducado' }, { status: 401 });
            } else {
                response = NextResponse.redirect(new URL('/login', req.url));
            }
            response.cookies.delete('sismov_token');
            return response;
        }
    }

    // Dejamos que la petición continúe si todo está bien
    return NextResponse.next();
}

// Aquí indicamos en qué rutas debe ejecutarse el middleware
export const config = {
    matcher: [
        /*
         * Ignora las siguientes rutas (que son imágenes, o estáticos de Next.js)
         * y aplica el middleware a todo lo demás.
         */
        '/((?!_next|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.mp4).*)',
    ],
};
