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
 * DELETE /api/feed-posts/admin/[id] - Force delete a feed post (admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${BE_API_URL}/api/feed-posts/admin/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete post" }));
      return NextResponse.json({ error: error.message }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE feed-post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
