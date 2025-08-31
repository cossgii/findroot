import { z } from 'zod';
import { PlaceCategory } from '@prisma/client';

const placeCategoryValues = Object.values(PlaceCategory) as [
  string,
  ...string[],
];

export const createPlaceSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요.' }),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  district: z.string().optional(),
  description: z.string().optional(),
  category: z.string().refine(val => placeCategoryValues.includes(val), {
    message: "카테고리를 선택해주세요."
  }),
});

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;