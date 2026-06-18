import { z } from 'zod';
import { PlaceCategory } from '@prisma/client';

export const createPlaceSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요.' }),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  district: z.string().optional(),
  description: z.string().min(1, { message: '설명을 입력해주세요.' }),
  link: z
    .union([
      z.string().url({ message: '유효한 웹사이트 주소를 입력해주세요.' }),
      z.literal('').transform((): null => null),
      z.null(),
    ])
    .optional(),
  category: z.nativeEnum(PlaceCategory),
});

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
