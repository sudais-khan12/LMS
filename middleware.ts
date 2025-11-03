import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Role type to avoid importing from Prisma until client is generated
type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Allow public routes
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/select-role',
    '/api/auth',
    '/_next',
    '/favicon.ico',
  ];

  const isPublicPath = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(publicPath + '/')
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as Role;

  // Protect admin routes
  if (path.startsWith('/admin') || path.startsWith('/dashboard/admin')) {
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect teacher routes
  if (path.startsWith('/teacher') || path.startsWith('/dashboard/teacher')) {
    if (userRole !== 'TEACHER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect student routes
  if (path.startsWith('/student') || path.startsWith('/dashboard/student')) {
    if (userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect API routes (except auth routes)
  if (path.startsWith('/api') && !path.startsWith('/api/auth')) {
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};

