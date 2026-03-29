import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

/**
 * GET /api/chat/conversations/campaign/[campaignId]
 * Proxy to BE: GET /api/chat/conversations/campaign/[id]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    try {
        const { campaignId } = await params;
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

        const response = await fetch(`${BE_API_URL}/api/chat/conversations/campaign/${campaignId}`, {
            method: "GET",
            headers: headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch {
                errorJson = { message: "Failed to fetch conversation" };
            }

            return NextResponse.json(
                { error: errorJson.message || "Failed to fetch conversation" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("BFF getConversationByCampaignId error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
