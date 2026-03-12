import { NextRequest, NextResponse } from "next/server";

const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL || "http://localhost:8083";

function getAccessToken(request: NextRequest): string {
  const cookieToken = request.cookies.get("access_token")?.value;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return cookieToken ?? "";
}

/** GET /api/media/posts/[postId] — fetch media list for a feed post */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const accessToken = getAccessToken(request);
    const headers: Record<string, string> = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(
      `${MEDIA_SERVICE_URL}/api/media/posts/${postId}`,
      { headers }
    );

    const data = await response.json().catch(() => []);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[media/posts/id] Error:", error);
    return NextResponse.json([], { status: 200 }); // return empty array so page still renders
  }
}
