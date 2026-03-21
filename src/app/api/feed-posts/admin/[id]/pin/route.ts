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
 * PATCH /api/feed-posts/admin/[id]/pin - Toggle pin status (admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const endpoint = `${BE_API_URL}/api/feed-posts/admin/${id}/pin`;
    const methodsToTry: Array<"PATCH" | "PUT" | "POST"> = ["PATCH", "PUT", "POST"];
    let lastStatus = 500;
    let lastMessage = "Failed to toggle pin";

    for (const method of methodsToTry) {
      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return NextResponse.json(data);
      }

      lastStatus = response.status;
      const error = await response.json().catch(() => ({ message: "Failed to toggle pin" }));
      lastMessage = error?.message || lastMessage;

      // Method not allowed or server error -> try next method variant.
      if (![405, 500].includes(response.status)) {
        break;
      }
    }

    return NextResponse.json({ error: lastMessage }, { status: lastStatus });
  } catch (error) {
    console.error("Admin PATCH pin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
