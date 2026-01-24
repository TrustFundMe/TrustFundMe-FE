import { NextRequest, NextResponse } from 'next/server';

function isPathUnder(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + '/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isStaffArea = isPathUnder(pathname, '/staff');
  const isAdminArea = isPathUnder(pathname, '/admin');

  // Only guard staff/admin areas for now.
  if (!isStaffArea && !isAdminArea) {
    return NextResponse.next();
  }

  // Use cookie presence as quick auth check (canonical validation is via /api/auth/me)
  const accessToken = request.cookies.get('access_token')?.value;
  if (!accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Ask our own API for the authenticated user (validated/authorized by BE).
  // IMPORTANT: use absolute URL for edge runtime.
  const meUrl = new URL('/api/auth/me', request.url);
  const res = await fetch(meUrl, {
    method: 'GET',
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({ user: null }));
  const role = data?.user?.role;

  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminArea && role !== 'ADMIN') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (isStaffArea && role !== 'ADMIN' && role !== 'STAFF') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/staff/:path*', '/admin/:path*'],
};
