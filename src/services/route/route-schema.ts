import { z } from 'zod';
import { RouteStopLabel } from '~/src/types/shared';

// Schema for creating a new route, used for validating client data
export const NewRouteApiSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1, { message: '설명을 입력해주세요.' }),
  districtId: z.string().optional(), // districtId is now optional on the route itself
  places: z.array(
    z.object({
      placeId: z.string(),
      order: z.number().int(),
      label: z.enum(['MEAL', 'CAFE', 'BAR']),
    }),
  ),
});

// Schema for updating an existing route
export const UpdateRouteApiSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1, { message: '설명을 입력해주세요.' }).optional(),
  districtId: z.string().optional(),
  // For updating places, we'll expect a full new list of stops
  // The client will send the complete desired state of places for the route
  places: z.array(
    z.object({
      placeId: z.string(),
      order: z.number().int(),
      label: z.enum(['MEAL', 'CAFE', 'BAR']),
    }),
  ).optional(), // Places array itself is optional for update
});

export type NewRouteInput = z.infer<typeof NewRouteApiSchema>;
export type UpdateRouteInput = z.infer<typeof UpdateRouteApiSchema>;
