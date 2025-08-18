import { atom } from 'jotai';
// Place 타입은 RestaurantDetailModalProps에서 사용될 수 있으므로 필요하다면 import
// import { Place } from '@prisma/client';

export type ModalType = 
  | 'ADD_PLACE'
  | 'ADD_ROUTE'
  | 'RESTAURANT_DETAIL'
  | 'INFO_MESSAGE'
  | 'EDIT_PLACE'
  | 'EDIT_ROUTE';

// 각 모달 타입에 대한 props 인터페이스 정의
// 이 인터페이스들은 Modal을 호출하는 컴포넌트에서 atom에 저장하는 props의 형태를 정의합니다.
// 최종적으로 Modal 컴포넌트가 받는 props(isOpen, onClose 등)와는 다릅니다.
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

// ModalState 인터페이스를 단순화하여 props의 타입을 유니온으로 정의
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

// Kakao Map API 로드 상태를 위한 atom
export const isKakaoMapApiLoadedAtom = atom<boolean>(false);