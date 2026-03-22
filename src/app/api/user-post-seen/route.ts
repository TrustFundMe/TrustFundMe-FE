import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

function getAccessToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie") || "";
  return authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : (cookieHeader.match(/access_token=([^;]+)/)?.[1] ?? "").trim();
}

/** GET /api/user-post-seen - Get all seen post IDs for current user */
export async function GET(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json([], { status: 200 });
    }

    const response = await fetch(`${BE_API_URL}/api/user-post-seen`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json().catch(() => []);
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching seen posts:", error);
    return NextResponse.json([], { status: 200 });
  }
}

/** POST /api/user-post-seen - Mark post(s) as seen */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = getAccessToken(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${BE_API_URL}/api/user-post-seen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error marking posts as seen:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
