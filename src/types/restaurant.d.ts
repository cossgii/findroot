import { ClientPlace, ClientRoute } from '~/src/types/shared';

export type Restaurant = Omit<ClientPlace, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  isLiked: boolean;
  link?: string | null;
};

export type RouteWithLikeData = ClientRoute & {
  likesCount: number;
  isLiked: boolean;
};

export interface Category {
  id: string;
  name: string;
}
