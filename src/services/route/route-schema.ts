import { z } from 'zod';

export const createRouteSchema = z.object({
  name: z.string().min(1, { message: '루트 이름을 입력해주세요.' }),
  description: z.string().optional(),
  districtId: z.string().optional(),
  placeForRound1Id: z.string().optional(),
  placeForRound2Id: z.string().optional(),
  placeForCafeId: z.string().optional(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
