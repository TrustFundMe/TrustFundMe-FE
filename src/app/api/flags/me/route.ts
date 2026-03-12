import { NextRequest, NextResponse } from "next/server";

const FLAG_SERVICE_URL = process.env.FLAG_SERVICE_URL || "http://localhost:8085";

function getAccessToken(request: NextRequest): string {
  const cookieToken = request.cookies.get("access_token")?.value;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return cookieToken ?? "";
}

/** GET /api/flags/me - Get current user's own submitted flags (campaign + post). Same as campaign flag flow, call flag-service directly. */
export async function GET(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "0";
    const size = searchParams.get("size") ?? "20";

    const response = await fetch(
      `${FLAG_SERVICE_URL}/api/flags/me?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[flags/me] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
