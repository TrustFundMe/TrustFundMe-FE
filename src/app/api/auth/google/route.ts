import { NextRequest, NextResponse } from 'next/server';

/**
 * Google OAuth - Proxy to BE
 * TODO: BE needs to implement POST /api/auth/google endpoint
 * Expected request: { idToken: string } (Google ID token)
 * Expected response: { accessToken, refreshToken, user }
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

    const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8081';

    // TODO: Check if BE has this endpoint
    // For now, return error indicating it's not implemented
    const response = await fetch(`${BE_API_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    // If endpoint doesn't exist (404), return not implemented error
    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Google OAuth is not yet implemented in the backend' },
        { status: 501 } // Not Implemented
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Google OAuth failed' },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json({
      success: true,
      user: data.user,
    });

    // Forward cookies from BE
    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append('Set-Cookie', cookie);
    });

    return nextResponse;
  } catch (error: any) {
    console.error('Google OAuth API error:', error);
    // If it's a network error (BE not available), return not implemented
    if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'Google OAuth is not yet implemented in the backend' },
        { status: 501 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
