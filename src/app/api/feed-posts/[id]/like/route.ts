import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

function getAccessToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie") || "";
  return authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : (cookieHeader.match(/access_token=([^;]+)/)?.[1] ?? "").trim();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = getAccessToken(request);

    const response = await fetch(`${BE_API_URL}/api/feed-posts/${id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
