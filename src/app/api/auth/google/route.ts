import { NextRequest, NextResponse } from 'next/server';

/**
 * Google OAuth - Proxy to BE identity-service POST /api/auth/google-login
 * Request: { idToken: string } (Google ID token from @react-oauth/google)
 * BE verifies idToken, returns { accessToken, refreshToken, expiresIn, user }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: 'Google ID token is required' },
        { status: 400 }
      );
    }

    const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8080';

    const response = await fetch(`${BE_API_URL}/api/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Google OAuth failed' },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json({
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenType: data.tokenType || 'Bearer',
      expiresIn: data.expiresIn,
      user: data.user,
    });

    const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        nextResponse.headers.append('Set-Cookie', cookie);
      });
    } else {
      if (data.accessToken) {
        nextResponse.cookies.set('access_token', data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: data.expiresIn ? Math.floor(data.expiresIn / 1000) : 15 * 60,
          path: '/',
        });
      }
      if (data.refreshToken) {
        nextResponse.cookies.set('refresh_token', data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });
      }
    }

    return nextResponse;
  } catch (error: unknown) {
    console.error('Google OAuth API error:', error);
    const err = error as NodeJS.ErrnoException;
    if (err?.code === 'ECONNREFUSED' || err?.message?.includes?.('fetch failed')) {
      return NextResponse.json(
        { error: 'Cannot reach auth service. Please try again later.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
