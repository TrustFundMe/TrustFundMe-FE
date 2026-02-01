import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";
/**
 * GET /api/users/[id]
 * Proxy to BE: GET /api/users/{id}
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";
        const accessToken = request.cookies.get("access_token")?.value;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${BE_API_URL}/api/users/${id}`, {
            method: "GET",
            headers: headers,
        });

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ message: "Failed to fetch user" }));
            return NextResponse.json(
                { error: error.message || "Failed to fetch user" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
