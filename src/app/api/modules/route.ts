import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const accessToken = request.cookies.get("access_token")?.value;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const beUrl = `${BE_API_URL}/api/modules`;
        const response = await fetch(beUrl, {
            method: "POST",
            headers,
            body,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data?.message || data?.error || "Tạo mục thất bại" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error creating module:", error);
        return NextResponse.json(
            { message: "Lỗi máy chủ khi tạo mục menu" },
            { status: 500 }
        );
    }
}
