import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

/**
 * POST /api/media/upload - Proxy multipart upload to BE media-service with auth from cookie
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieHeader = request.headers.get("cookie") || "";
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : (cookieHeader.match(/access_token=([^;]+)/)?.[1] ?? "").trim();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Missing access token" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Bad Request", message: "File is required" },
        { status: 400 }
      );
    }

    const body = new FormData();
    body.append("file", file);

    const response = await fetch(`${BE_API_URL}/api/media/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Upload failed" }));
      return NextResponse.json(
        { error: err.message ?? "Upload failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Media upload proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
