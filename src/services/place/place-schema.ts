import { z } from 'zod';
import { PlaceCategory } from '@prisma/client';

export const createPlaceSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요.' }),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  district: z.string().optional(),
  description: z.string().optional(),
  category: z.nativeEnum(PlaceCategory), // Changed from string to enum
});

// This type is inferred from the schema
export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
