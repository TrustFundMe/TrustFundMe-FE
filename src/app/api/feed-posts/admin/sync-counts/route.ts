import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

function getAccessToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie") || "";
  return authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : (cookieHeader.match(/access_token=([^;]+)/)?.[1] ?? "").trim();
}

/**
 * POST /api/feed-posts/admin/sync-counts
 * Recalculate commentCount/replyCount for all posts from actual DB comment count
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${BE_API_URL}/api/feed-posts/admin/sync-counts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Sync failed" }));
      return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Sync counts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
