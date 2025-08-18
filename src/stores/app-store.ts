import { atom } from 'jotai';

export type ModalType =
  | 'ADD_PLACE'
  | 'ADD_ROUTE'
  | 'RESTAURANT_DETAIL'
  | 'INFO_MESSAGE'
  | 'EDIT_PLACE'
  | 'EDIT_ROUTE';

export interface AddPlaceModalProps {
  onPlaceAdded: () => void;
}

export interface EditPlaceModalProps {
  placeId: string;
  onPlaceUpdated: () => void;
}

export interface AddRouteModalProps {
  onRouteAdded: () => void;
}

export interface EditRouteModalProps {
  routeId: string;
  onRouteUpdated: () => void;
}

export interface RestaurantDetailModalProps {
  restaurantId: string; // RestaurantDetailModal에서 restaurantId를 string으로 사용
}

export interface InfoMessageModalProps {
  title: string;
  message: string;
}

export interface ModalState {
  type: ModalType | null;
  props?:
    | AddPlaceModalProps
    | AddRouteModalProps
    | RestaurantDetailModalProps
    | InfoMessageModalProps
    | EditPlaceModalProps
    | EditRouteModalProps
    | Record<string, never>;
}

const initialState: ModalState = {
  type: null,
  props: {},
};

export const modalAtom = atom<ModalState>(initialState);

export const isKakaoMapApiLoadedAtom = atom<boolean>(false);
