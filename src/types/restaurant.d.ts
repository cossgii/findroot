import { Place, Route } from '@prisma/client'; // Import Route as well

// This extends the Prisma Place model with our custom aggregated fields
export type Restaurant = Omit<Place, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  isLiked: boolean;
  link?: string | null; // Allow null for the link field
};

// New type for Route with aggregated like data
export type RouteWithLikeData = Route & {
  likesCount: number;
  isLiked: boolean;
};

export interface Category {
  id: string;
  name: string;
}
