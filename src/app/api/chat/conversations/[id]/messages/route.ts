import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

/**
 * GET /api/chat/conversations/[id]/messages
 * Proxy to BE: GET /api/conversations/[id]/messages
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const accessToken = request.cookies.get("access_token")?.value;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${BE_API_URL}/api/conversations/${id}/messages`, {
            method: "GET",
            headers: headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch {
                errorJson = { message: "Failed to fetch messages" };
            }

            return NextResponse.json(
                { error: errorJson.message || "Failed to fetch messages" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const accessToken = request.cookies.get("access_token")?.value;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${process.env.BE_API_GATEWAY_URL}/api/conversations/${id}/messages`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch {
                errorJson = { message: "Failed to send message" };
            }

            return NextResponse.json(
                { error: errorJson.message || "Failed to send message" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
