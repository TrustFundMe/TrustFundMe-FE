import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload avatar to Supabase Storage (bucket Avatars) using Service Role.
 * Bypasses RLS - use only when user is authenticated via BE (access_token cookie).
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (or SHARED_SUPABASE_KEY) is not set' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing file or userId' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPG, PNG, GIF or WebP.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image must be less than 5MB' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `avatars/${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('Avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || 'Upload failed' },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('Avatars')
      .getPublicUrl(filePath);

    return NextResponse.json({ avatarUrl: urlData.publicUrl });
  } catch (e) {
    console.error('Upload avatar error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
