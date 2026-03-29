import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

/**
 * GET /api/users
 * Proxy to BE: GET /api/users
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

        // Forward query params (page, size) to backend
        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();
        const beUrl = `${BE_API_URL}/api/users${queryString ? '?' + queryString : ''}`;

        const response = await fetch(beUrl, {
            method: "GET",
            headers: headers,
        }).catch(err => {
            console.error("Fetch error:", err);
            return null;
        });

        if (!response) {
            return NextResponse.json(
                { error: "Không thể kết nối đến máy chủ backend (localhost:8080). Vui lòng kiểm tra lại server backend." },
                { status: 503 }
            );
        }

        if (!response.ok) {
            const body = await response.text();
            let errorMessage = "Failed to fetch users";
            try {
                const errorJson = JSON.parse(body);
                errorMessage = errorJson.error || errorJson.message || errorMessage;
            } catch (e) {
                // If not JSON, use standard error or peek at HTML if short
                if (body.includes("<!DOCTYPE html>") || body.includes("<html>")) {
                    errorMessage = `Backend error (${response.status}): ${response.statusText}`;
                } else {
                    errorMessage = body || errorMessage;
                }
            }
            
            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Internal server error: " + (error?.message || "Unknown error") },
            { status: 500 }
        );
    }
}
