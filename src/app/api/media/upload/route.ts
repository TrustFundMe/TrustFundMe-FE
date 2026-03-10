import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL || "http://localhost:8083";

function getSupabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SHARED_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SHARED_SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    return createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return null;
}

function getAccessToken(request: NextRequest): string {
  const cookieToken = request.cookies.get("access_token")?.value;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return cookieToken ?? "";
}

/**
 * POST /api/media/upload
 *
 * Strategy:
 * 1. Upload the file directly to Supabase (reliable, no auth issues)
 * 2. Register the resulting URL with the media-service to create a DB record
 *    (POST /api/media/register) — returns { id, url, mediaType, … }
 * 3. Return the full media record to the caller so mediaId is available.
 *
 * Fallback: if Supabase admin is not configured, proxy multipart to media-service.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // ── Path A: Supabase direct upload + DB register ───────────────────────
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const bucket =
        process.env.NEXT_PUBLIC_SUPABASE_BUCKET ||
        process.env.SHARED_SUPABASE_BUCKET ||
        "";
      if (!bucket) {
        return NextResponse.json(
          { error: "NEXT_PUBLIC_SUPABASE_BUCKET is not configured" },
          { status: 500 }
        );
      }

      const ext = (file.name || "").split(".").pop()?.toLowerCase() || "bin";
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
      const filePath = `media/${safeName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message || "Supabase upload failed" },
          { status: 500 }
        );
      }

      const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Collect extra fields from the original FormData
      const mediaType = (formData.get("mediaType") as string | null) ?? "PHOTO";
      const postId = formData.get("postId") ? Number(formData.get("postId")) : undefined;
      const campaignId = formData.get("campaignId") ? Number(formData.get("campaignId")) : undefined;
      const expenditureId = formData.get("expenditureId") ? Number(formData.get("expenditureId")) : undefined;
      const conversationId = formData.get("conversationId") ? Number(formData.get("conversationId")) : undefined;
      const description = (formData.get("description") as string | null) ?? undefined;

      // Register with media-service to create a DB record
      const accessToken = getAccessToken(request);
      const registerPayload = {
        url: publicUrl,
        mediaType,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        ...(postId != null && { postId }),
        ...(campaignId != null && { campaignId }),
        ...(expenditureId != null && { expenditureId }),
        ...(conversationId != null && { conversationId }),
        ...(description != null && { description }),
      };

      const registerHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) registerHeaders.Authorization = `Bearer ${accessToken}`;

      try {
        const registerRes = await fetch(`${MEDIA_SERVICE_URL}/api/media/register`, {
          method: "POST",
          headers: registerHeaders,
          body: JSON.stringify(registerPayload),
        });

        if (registerRes.ok) {
          const mediaRecord = await registerRes.json();
          return NextResponse.json(mediaRecord);
        }
        // If register fails, still return the URL (upload succeeded)
        console.warn("[media/upload] register failed with", registerRes.status, "— returning URL only");
      } catch (regErr) {
        console.warn("[media/upload] register error (non-fatal):", regErr);
      }

      // Fallback: return minimal response if register failed
      return NextResponse.json({ url: publicUrl });
    }

    // ── Path B: proxy multipart to media-service (supabaseAdmin was null) ──
    console.warn(
      "[media/upload] supabaseAdmin null (missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY), falling back to media-service"
    );
    const accessToken = getAccessToken(request);
    const body = new FormData();
    formData.forEach((value, key) => { body.append(key, value); });

    const fetchHeaders: Record<string, string> = {};
    if (accessToken) fetchHeaders.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(`${MEDIA_SERVICE_URL}/api/media/upload`, {
      method: "POST",
      headers: fetchHeaders,
      body,
    });

    if (!response.ok) {
      const rawText = await response.text();
      let errMessage = `Media service returned ${response.status}`;
      try {
        const parsed = JSON.parse(rawText);
        errMessage = parsed.message ?? parsed.error ?? rawText;
      } catch {
        errMessage = rawText || errMessage;
      }
      console.error(`[media/upload] media-service error ${response.status}:`, errMessage);
      return NextResponse.json({ error: errMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[media/upload] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
