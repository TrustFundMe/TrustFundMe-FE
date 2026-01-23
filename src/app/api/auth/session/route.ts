import { NextRequest, NextResponse } from 'next/server';

/**
 * Get current session - Verify token with BE
 */
export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { session: null, user: null },
        { status: 200 }
      );
    }

    const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8081';

    // Verify token with BE (we can decode JWT client-side or call BE to verify)
    // For now, we'll try to get user info using the token
    // BE should have an endpoint like GET /api/users/me or verify token

    // Option 1: Decode JWT client-side (not recommended for verification)
    // Option 2: Call BE endpoint to verify token and get user

    // TODO: Create BE endpoint GET /api/users/me (returns current user from token)
    // For now, we'll decode JWT to get user ID, then fetch user

    try {
      // Decode JWT to get user ID (basic decode, BE should verify)
      const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
      const userId = payload.sub;

      // Get user from BE
      const response = await fetch(`${BE_API_URL}/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { session: null, user: null },
          { status: 200 }
        );
      }

      const user = await response.json();

      return NextResponse.json({
        session: {
          access_token: accessToken,
          token_type: 'Bearer',
        },
        user,
      });
    } catch (decodeError) {
      console.error('Failed to decode token:', decodeError);
      return NextResponse.json(
        { session: null, user: null },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('Get session API error:', error);
    return NextResponse.json(
      { session: null, user: null },
      { status: 200 }
    );
  }
}
