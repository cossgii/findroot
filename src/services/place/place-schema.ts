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
  description: z.string().min(1, { message: '설명을 입력해주세요.' }),
  link: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const urlRegex =
          /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i;
        return urlRegex.test(val);
      },
      {
        message:
          '유효한 웹사이트 주소를 입력해주세요 (예: www.example.com 또는 https://example.com)',
      },
    ),
  category: z.string().refine((val) => placeCategoryValues.includes(val), {
    message: '카테고리를 선택해주세요.',
  }),
});

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
