import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const uploadRequestSchema = z.object({
  fileName: z.string().min(1, { message: 'fileName is required' }).max(255, { message: 'fileName is too long' }).regex(/^[a-zA-Z0-9_.-]+$/, { message: 'fileName contains invalid characters' }),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fileName } = uploadRequestSchema.parse(await request.json());

    const userId = session.user.id;
    const filePath = `${userId}/${Date.now()}-${fileName}`;

    // 1. Generate a signed URL for the upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .createSignedUploadUrl(filePath);

    if (uploadError) {
      console.error('Supabase signed URL error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 2. Get the public URL for the file path
    const { data: publicUrlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      signedUrl: uploadData.signedUrl, 
      publicUrl: publicUrlData.publicUrl 
    });

  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}