import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.text();
        const accessToken = request.cookies.get("access_token")?.value;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const beUrl = `${BE_API_URL}/api/modules/${id}`;
        const response = await fetch(beUrl, {
            method: "PUT",
            headers,
            body,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data?.message || data?.error || "Cập nhật mục thất bại" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating module:", error);
        return NextResponse.json(
            { message: "Lỗi máy chủ khi cập nhật mục menu" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const accessToken = request.cookies.get("access_token")?.value;

        const headers: Record<string, string> = {};
        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const beUrl = `${BE_API_URL}/api/modules/${id}`;
        const response = await fetch(beUrl, {
            method: "DELETE",
            headers,
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: data?.message || data?.error || "Xóa mục thất bại" },
                { status: response.status }
            );
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting module:", error);
        return NextResponse.json(
            { message: "Lỗi máy chủ khi xóa mục menu" },
            { status: 500 }
        );
    }
}
