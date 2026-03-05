import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await context.params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  const res = await fetch(`${BE_URL}/api/feed-posts/comments/${commentId}/like`, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
