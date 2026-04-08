import { NextRequest, NextResponse } from 'next/server';

const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const beUrl = `${BE_API_URL}/api/expenditures/import/template`;
    const response = await fetch(beUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('Backend Template Error:', response.status, errText);
      return NextResponse.json(
        { error: 'Failed to download template' },
        { status: response.status }
      );
    }

    const blob = await response.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment; filename="KhoanChi_Mau.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/expenditures/import/template:', error);
    return NextResponse.json(
      { error: 'Internal server error while downloading template' },
      { status: 500 }
    );
  }
}
