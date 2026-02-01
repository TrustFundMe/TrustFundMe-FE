import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

/**
 * GET /api/chat/conversations
 * Proxy to BE: GET /api/conversations
 */
export async function GET(request: NextRequest) {
    try {
        const accessToken = request.cookies.get("access_token")?.value;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
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
