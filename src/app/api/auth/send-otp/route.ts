import { NextRequest, NextResponse } from 'next/server';

/**
 * Send OTP to email - Proxy to BE
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

    console.log(`Proxying send-otp request to: ${BE_API_URL}/api/auth/send-otp for email: ${email}`);

    try {
      const response = await fetch(`${BE_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      // Handle non-JSON responses (e.g. 404 HTML pages, 502 Bad Gateway, etc.)
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('BE returned non-JSON response:', text);
        return NextResponse.json(
          { error: `Backend error: ${response.status} ${response.statusText}`, details: text.substring(0, 100) },
          { status: response.status }
        );
      }

      console.log('BE send-otp response:', { status: response.status, data });

      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || data.error || 'Failed to send OTP' },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } catch (fetchError: any) {
      console.error('Fetch error calling BE:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to backend service', details: fetchError.message },
        { status: 502 } // Bad Gateway
      );
    }
  } catch (error: any) {
    console.error('Send OTP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
