import { NextRequest, NextResponse } from 'next/server';

const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const beUrl = `${BE_API_URL}/api/users/export`;
    const response = await fetch(beUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('Backend Export Error:', response.status, errText);
      return NextResponse.json(
        { error: 'Failed to export users' },
        { status: response.status }
      );
    }

    // Read the stream into a Blob safely (avoids Next.js / Node streaming bugs)
    const blob = await response.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment; filename="users.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/users/export:', error);
    return NextResponse.json(
      { error: 'Internal server error while exporting' },
      { status: 500 }
    );
  }
}
