import { PlaceCategory, RouteStopLabel } from '@prisma/client';

export type { PlaceCategory, RouteStopLabel } from '@prisma/client';

export interface ClientUserSummary {
  id: string;
  name: string | null;
  image: string | null;
}

export interface ClientPlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  description: string;
  link: string | null;
  district: string | null;
  category: PlaceCategory;
  creator: ClientUserSummary;
}

export interface ClientRoute {
  id: string;
  name: string;
  description: string;
  districtId: string | null;
  creator: ClientUserSummary;
  isRepresentative: boolean;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
}

export interface RouteWithPlaces extends ClientRoute {
  places: ClientRoutePlace[];
}

export interface ClientUser {
  id: string;
  name: string | null;
  loginId: string;
  email: string | null;
  image: string | null;
  password?: string | null;
}

export interface ClientMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export interface ClientRoutePlace {
  id: string;
  routeId: string;
  placeId: string;
  order: number;
  label: RouteStopLabel;
  place: ClientPlace;
}
