import { NextRequest, NextResponse } from 'next/server';

/**
 * Register - Call BE API directly
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8080';
    
    // Map firstName + lastName to fullName for BE
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    const response = await fetch(`${BE_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(),
        password,
        fullName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Registration failed' },
        { status: response.status }
      );
    }

    // Set httpOnly cookies for tokens
    const nextResponse = NextResponse.json({
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenType: data.tokenType || 'Bearer',
      expiresIn: data.expiresIn,
      user: data.user,
    });

    // Set cookies if BE provides them, otherwise set manually
    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        nextResponse.headers.append('Set-Cookie', cookie);
      });
    } else {
      // Set cookies manually
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
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/',
        });
      }
    }

    return nextResponse;
  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
