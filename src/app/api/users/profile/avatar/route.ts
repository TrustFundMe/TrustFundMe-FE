import { NextRequest, NextResponse } from 'next/server';

/**
 * Update user avatar URL
 * Syncs avatar URL with BE using PUT /api/users/{userId}
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, avatarUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'Avatar URL is required' },
        { status: 400 }
      );
    }

    const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8080';
    
    // Get BE JWT from cookies
    const cookies = request.headers.get('cookie') || '';
    
    const response = await fetch(`${BE_API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
        // Also try Authorization header if available
        ...(request.headers.get('authorization') && {
          Authorization: request.headers.get('authorization') || '',
        }),
      },
      credentials: 'include',
      body: JSON.stringify({ avatarUrl }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update avatar' }));
      return NextResponse.json(
        { error: error.message || 'Failed to update avatar' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
