import { NextRequest, NextResponse } from 'next/server';
import { isJwtExpired } from '@/lib/utils';

/**
 * Update user profile
 * Syncs profile data with BE using PUT /api/users/{userId}
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, phoneNumber, avatarUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8080';
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
      console.error('[profile] No access_token in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const beUrl = `${BE_API_URL}/api/users/${userId}`;
    const putBody = { fullName, phoneNumber, avatarUrl };
    const response = await fetch(beUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(putBody),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[profile] BE PUT %s failed: status=%s, hasToken=%s, body=%o', beUrl, response.status, !!accessToken, err);

      let errorMsg: string;
      if (response.status === 401) {
        const expired = isJwtExpired(accessToken);
        errorMsg = expired
          ? 'Your session has expired. Please sign in again.'
          : 'Session invalid. Please sign in again. If it persists, run API Gateway with run-api-gateway.ps1 so JWT_SECRET is loaded from .env.';
      } else {
        errorMsg = (err as { message?: string }).message || (err as { error?: string }).error || 'Failed to update profile';
      }

      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
