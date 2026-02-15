import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { ApiError } from '~/src/utils/api-errors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

const uploadRequestSchema = z.object({
  fileName: z
    .string()
    .min(1, { message: 'fileName is required' })
    .max(255, { message: 'fileName is too long' })
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message: 'fileName contains invalid characters',
    }),
});

export const POST = apiHandler({
  auth: true,
  bodySchema: uploadRequestSchema,
  handler: async ({ session, body }) => {
    const { fileName } = body;
    const userId = session!.user.id;
    const filePath = `${userId}/${Date.now()}-${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .createSignedUploadUrl(filePath);

    if (uploadError) {
      throw new ApiError(uploadError.message, 500);
    }

    const { data: publicUrlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return apiSuccess({
      signedUrl: uploadData.signedUrl,
      publicUrl: publicUrlData.publicUrl,
    });
  },
});
