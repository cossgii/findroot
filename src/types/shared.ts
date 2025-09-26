export enum PlaceCategory {
  MEAL = 'MEAL',
  DRINK = 'DRINK',
}

export enum RouteStopLabel {
  MEAL = 'MEAL',
  CAFE = 'CAFE',
  BAR = 'BAR',
}

// Client-safe Place interface
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

// Client-safe Route interface
export interface ClientRoute {
  id: string;
  name: string;
  description: string;
  districtId: string | null;
}

// Client-safe User interface
export interface ClientUser {
  id: string;
  name: string | null;
  loginId: string;
  email: string | null;
  image: string | null;
  password?: string | null; // password can be null for social logins
}

// Client-safe Message interface
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