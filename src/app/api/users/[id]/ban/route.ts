import { NextRequest, NextResponse } from 'next/server';

const BE_API_URL = process.env.BE_API_GATEWAY_URL || 'http://localhost:8080';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const accessToken = request.cookies.get('access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const beUrl = `${BE_API_URL}/api/users/${id}/ban`;

        const response = await fetch(beUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: (err as { message?: string }).message || 'Failed to ban user' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT /api/users/[id]/ban:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
