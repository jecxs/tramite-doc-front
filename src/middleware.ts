import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Obtener token desde cookies
    const token = request.cookies.get('access_token')?.value;

    console.log('🔵 Middleware - Ruta:', pathname);
    console.log('🔵 Middleware - Token presente:', !!token);

    // Si es una ruta pública, permitir acceso
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        // Si ya está autenticado y trata de ir a login, redirigir a home
        if (token && pathname === '/login') {
            console.log('Middleware - Redirigiendo usuario autenticado desde login');
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Si no hay token y trata de acceder a ruta protegida, redirigir a login
    if (!token) {
        console.log('Middleware - Sin token, redirigiendo a login');
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Si hay token, permitir acceso
    console.log('Middleware - Permitiendo acceso');
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
};