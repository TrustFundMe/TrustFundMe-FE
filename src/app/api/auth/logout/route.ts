import { NextRequest, NextResponse } from 'next/server';

/**
 * Logout - Call BE API to revoke token
 */
export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8081';

    // Call BE logout endpoint if available
    // TODO: Create BE endpoint POST /api/auth/logout
    if (refreshToken) {
      try {
        await fetch(`${BE_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Refresh-Token': refreshToken,
          },
        });
      } catch (error) {
        console.error('BE logout error:', error);
        // Continue to clear cookies even if BE call fails
      }
    }

    // Clear cookies
    const nextResponse = NextResponse.json({ success: true });
    nextResponse.cookies.delete('access_token');
    nextResponse.cookies.delete('refresh_token');

    return nextResponse;
  } catch (error: any) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
