import { z } from 'zod';
import { RouteStopLabel } from '~/src/types/shared';

const RoutePlaceSchema = z.object({
  placeId: z.string(),
  order: z.number().int(),
  label: z.enum(Object.values(RouteStopLabel) as [RouteStopLabel, ...RouteStopLabel[]]),
});

export const NewRouteApiSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1, { message: '설명을 입력해주세요.' }),
  districtId: z.string().nullable().optional(),
  places: z.array(RoutePlaceSchema),
});

export const UpdateRouteApiSchema = z.object({
  name: z.string().min(1).optional(),
  description: z
    .string()
    .min(1, { message: '설명을 입력해주세요.' })
    .optional(),
  districtId: z.string().optional(),
  places: z.array(RoutePlaceSchema).optional(),
});

export type NewRouteInput = z.infer<typeof NewRouteApiSchema>;
export type UpdateRouteInput = z.infer<typeof UpdateRouteApiSchema>;
