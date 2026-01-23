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

    // User confirmed BE endpoint is GET /api/users/check-email
    const response = await fetch(`${BE_API_URL}/api/users/check-email?email=${encodeURIComponent(normalizedEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

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
  } catch (error: any) {
    console.error('Check email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
