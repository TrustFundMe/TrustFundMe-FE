import { NextRequest, NextResponse } from 'next/server';

/**
 * Check if email exists - Call BE API
 * BE endpoint: GET /api/users/check-email?email={email}
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8081';
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`Proxying check-email request to: ${BE_API_URL}/api/users/check-email?email=${normalizedEmail}`);

    try {
      // User confirmed BE endpoint is GET /api/users/check-email
      const response = await fetch(`${BE_API_URL}/api/users/check-email?email=${encodeURIComponent(normalizedEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('BE returned non-JSON response for check-email:', text);
        return NextResponse.json(
          { error: `Backend error: ${response.status} ${response.statusText}`, details: text.substring(0, 100) },
          { status: response.status }
        );
      }

      // Debug log
      console.log('BE check-email response:', { status: response.status, data });

      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || data.error || 'Failed to check email' },
          { status: response.status }
        );
      }

      const result = {
        exists: data.exists === true || data.exists === 'true',
        email: data.email || normalizedEmail,
        fullName: data.fullName,
      };

      console.log('Check email result:', result);
      return NextResponse.json(result);
    } catch (fetchError: any) {
      console.error('Fetch error calling BE check-email:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to backend service', details: fetchError.message },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('Check email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
