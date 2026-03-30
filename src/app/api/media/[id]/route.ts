import { NextRequest, NextResponse } from "next/server";

const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL || "http://localhost:8083";

function getAccessToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  const cookieHeader = request.headers.get("cookie") || "";
  return (cookieHeader.match(/access_token=([^;]+)/)?.[1] ?? "").trim();
}

/** PATCH /api/media/[id] — update media record (e.g. link postId or campaignId) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = getAccessToken(request);
    console.log(`[media/id PATCH] id=${id}, token length=${accessToken?.length ?? 0}, prefix=${accessToken?.slice(0, 20)}`);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    const response = await fetch(`${MEDIA_SERVICE_URL}/api/media/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[media/id] PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
