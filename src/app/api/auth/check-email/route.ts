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

    const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8080';
    const normalizedEmail = email.trim().toLowerCase();
    
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
      // If endpoint doesn't exist or error, return exists: false
      return NextResponse.json({
        exists: false,
        email: normalizedEmail,
      });
    }

    // Ensure exists is boolean (BE might return Boolean object)
    const result = {
      exists: data.exists === true || data.exists === 'true', // Explicit boolean check
      email: data.email || normalizedEmail,
      fullName: data.fullName,
    };
    
    console.log('Check email result:', result);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Check email API error:', error);
    return NextResponse.json(
      { exists: false, email: email?.trim().toLowerCase() || '' },
      { status: 200 } // Return 200 with exists: false instead of error
    );
  }
}
