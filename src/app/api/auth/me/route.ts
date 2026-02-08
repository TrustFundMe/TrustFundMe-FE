import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns current authenticated BE user based on access_token cookie.
 * This is the canonical server-side source for user role in FE.
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8081';

    // Decode JWT to get userId (we still rely on BE to authorize the request)
    let userId: string | number | undefined;
    try {
      const payloadPart = accessToken.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString());
      userId = payload.sub;
    } catch {
      // If token cannot be decoded, treat as unauthenticated
      return NextResponse.json({ user: null }, { status: 200 });
    }

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const response = await fetch(`${BE_API_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await response.json();
    return NextResponse.json({
      user,
      session: { access_token: accessToken }
    }, { status: 200 });
  } catch (error) {
    console.error('Auth me API error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
