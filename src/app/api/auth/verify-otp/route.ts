import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify OTP - Proxy to BE
 * Returns token if OTP is correct
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8080';

    console.log(`Proxying verify-otp request to: ${BE_API_URL}/api/auth/verify-otp for email: ${email}`);

    try {
      const response = await fetch(`${BE_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('BE returned non-JSON response for verify-otp:', text);
        return NextResponse.json(
          { error: `Backend error: ${response.status} ${response.statusText}`, details: text.substring(0, 100) },
          { status: response.status }
        );
      }

      console.log('BE verify-otp response:', { status: response.status, success: response.ok });

      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || data.error || 'Invalid or expired OTP' },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } catch (fetchError: any) {
      console.error('Fetch error calling BE verify-otp:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to backend service', details: fetchError.message },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
