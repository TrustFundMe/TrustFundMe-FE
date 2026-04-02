import { NextRequest, NextResponse } from "next/server";

const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL || "http://localhost:8083";

function getAccessToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  const cookieToken = request.cookies.get("access_token")?.value;
  return cookieToken || "";
}

/** PATCH /api/media/[id] — update media record (e.g. link postId or campaignId) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = getAccessToken(request);
    
    if (!accessToken) {
      console.warn(`[media/id PATCH] Unauthorized: No token for id=${id}`);
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

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error body");
      console.error(`[media/id PATCH] Backend error ${response.status} for id=${id}:`, errorText);
      try {
        return NextResponse.json(JSON.parse(errorText), { status: response.status });
      } catch {
        return NextResponse.json({ error: errorText }, { status: response.status });
      }
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[media/id] PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** DELETE /api/media/[id] — delete media record */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = getAccessToken(request);
    
    if (!accessToken) {
      console.warn(`[media/id DELETE] Unauthorized: No token for id=${id}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[media/id DELETE] Proxying DELETE to ${MEDIA_SERVICE_URL}/api/media/${id}`);
    const response = await fetch(`${MEDIA_SERVICE_URL}/api/media/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error body");
      console.error(`[media/id DELETE] Backend error ${response.status} for id=${id}:`, errorText);
      try {
        return NextResponse.json(JSON.parse(errorText), { status: response.status });
      } catch {
        return NextResponse.json({ error: errorText }, { status: response.status });
      }
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[media/id] DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
