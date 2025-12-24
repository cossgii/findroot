import { z } from 'zod';
import { RoutePurpose, RouteStopLabel } from '@prisma/client';

const RoutePlaceSchema = z.object({
  placeId: z.string(),
  order: z.number().int(),
  label: z.nativeEnum(RouteStopLabel),
});

export const NewRouteApiSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1, { message: '설명을 입력해주세요.' }),
  districtId: z.string().nullable().optional(),
  places: z.array(RoutePlaceSchema),
  purpose: z.nativeEnum(RoutePurpose),
});

export const UpdateRouteApiSchema = z.object({
  name: z.string().min(1).optional(),
  description: z
    .string()
    .min(1, { message: '설명을 입력해주세요.' })
    .optional(),
  districtId: z.string().optional(),
  places: z.array(RoutePlaceSchema).optional(),
  purpose: z.nativeEnum(RoutePurpose).optional(),
});

export type NewRouteInput = z.infer<typeof NewRouteApiSchema>;
export type UpdateRouteInput = z.infer<typeof UpdateRouteApiSchema>;
