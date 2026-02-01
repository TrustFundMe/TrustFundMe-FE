import { NextRequest, NextResponse } from 'next/server';
import { isJwtExpired } from '@/lib/utils';

const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8080';

/** GET /api/users/[id] - Lấy thông tin user theo id (dùng cho tên/avatar tác giả bài viết) */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BE_API_URL}/api/users/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as { message?: string }).message ?? 'User not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const accessToken = request.cookies.get('access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const beUrl = `${BE_API_URL}/api/users/${id}`;

        const response = await fetch(beUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error('[users/[id]] BE PUT %s failed: status=%s, hasToken=%s, body=%o', beUrl, response.status, !!accessToken, err);

            let errorMsg: string;
            if (response.status === 401) {
                const expired = isJwtExpired(accessToken);
                errorMsg = expired
                    ? 'Your session has expired. Please sign in again.'
                    : 'Session invalid. Please sign in again.';
            } else {
                errorMsg = (err as { message?: string }).message || (err as { error?: string }).error || 'Failed to update user';
            }

            return NextResponse.json({ error: errorMsg }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT /api/users/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
