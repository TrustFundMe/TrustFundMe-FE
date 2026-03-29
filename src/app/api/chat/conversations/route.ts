import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

/**
 * GET /api/chat/conversations
 * Proxy to BE: GET /api/conversations
 */
export async function GET(request: NextRequest) {
    try {
        const accessToken = request.cookies.get("access_token")?.value;

        // Support both cookie and Authorization header
        const authHeader = request.headers.get("Authorization");
        const token = accessToken || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${BE_API_URL}/api/conversations`, {
            method: "GET",
            headers: headers,
        });

        if (!response.ok) {
            const errorText = await response.text();

            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch {
                errorJson = { message: "Failed to fetch conversations" };
            }

            return NextResponse.json(
                { error: errorJson.message || "Failed to fetch conversations" },
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

/**
 * POST /api/chat/conversations
 * Proxy to BE: POST /api/conversations
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const accessToken = request.cookies.get("access_token")?.value;

        // Support both cookie and Authorization header
        const authHeader = request.headers.get("Authorization");
        const token = accessToken || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${BE_API_URL}/api/conversations`, {
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
                errorJson = { message: "Failed to create conversation" };
            }

            return NextResponse.json(
                { error: errorJson.message || "Failed to create conversation" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("BFF createConversation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
