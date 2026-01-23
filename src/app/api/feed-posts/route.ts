import { NextRequest, NextResponse } from "next/server";

const BE_API_URL = process.env.BE_API_GATEWAY_URL || "http://localhost:8080";

/**
 * GET /api/feed-posts - Get all feed posts
 */
export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || "";

    const response = await fetch(`${BE_API_URL}/api/feed-posts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization") || "",
        }),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to fetch feed posts" }));
      return NextResponse.json(
        { error: error.message || "Failed to fetch feed posts" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feed-posts - Create a new feed post
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";

    const response = await fetch(`${BE_API_URL}/api/feed-posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization") || "",
        }),
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to create feed post" }));
      return NextResponse.json(
        { error: error.message || "Failed to create feed post" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating feed post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
