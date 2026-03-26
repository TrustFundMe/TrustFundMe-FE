import { NextRequest, NextResponse } from 'next/server';

const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;
    console.log('[import route] accessToken exists:', !!accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    console.log('[import route] formData keys:', Array.from(formData.keys()));
    const file = formData.get('file');
    console.log('[import route] file:', file ? (file as File).name : null);

    const beUrl = `${BE_API_URL}/api/users/import`;

    // Manually build multipart/form-data so the boundary is included in Content-Type
    const fileEntry = file as File;
    const boundary = `----NextAppBoundary${Date.now()}`;
    const bodyParts: Uint8Array[] = [];

    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileEntry.name}"\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;
    bodyParts.push(new TextEncoder().encode(fileHeader));

    const fileBuffer = await fileEntry.arrayBuffer();
    bodyParts.push(new Uint8Array(fileBuffer));

    const closingBoundary = `\r\n--${boundary}--`;
    bodyParts.push(new TextEncoder().encode(closingBoundary));

    const body = new Uint8Array(
      bodyParts.reduce((acc, part) => acc + part.length, 0)
    );
    let offset = 0;
    for (const part of bodyParts) {
      body.set(part, offset);
      offset += part.length;
    }

    const response = await fetch(beUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
      cache: 'no-store',
    });

    console.log('[import route] BE response status:', response.status);
    const data = await response.json();
    console.log('[import route] BE response data:', data);

    if (!response.ok) {
      console.error('[import route] BE error:', response.status, data);
      return NextResponse.json(
        { error: data.message || data.error || 'Failed to import users', _status: response.status },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/users/import:', error);
    return NextResponse.json(
      { error: 'Internal server error while importing' },
      { status: 500 }
    );
  }
}
