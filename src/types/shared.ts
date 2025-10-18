export enum PlaceCategory {
  MEAL = 'MEAL',
  DRINK = 'DRINK',
}

export enum RouteStopLabel {
  MEAL = 'MEAL',
  CAFE = 'CAFE',
  BAR = 'BAR',
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
}

export interface ClientRoute {
  id: string;
  name: string;
  description: string;
  districtId: string | null;
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
