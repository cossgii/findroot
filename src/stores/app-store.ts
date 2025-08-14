import { atom } from 'jotai';
// Place 타입은 RestaurantDetailModalProps에서 사용될 수 있으므로 필요하다면 import
// import { Place } from '@prisma/client';

export type ModalType =
  | 'ADD_PLACE'
  | 'ADD_ROUTE'
  | 'RESTAURANT_DETAIL'
  | 'INFO_MESSAGE';

// 각 모달 타입에 대한 props 인터페이스 정의
export interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceAdded: () => void;
}

export interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteAdded: () => void;
}

export interface RestaurantDetailModalProps {
  restaurantId: number; // RestaurantDetailModal에서 restaurantId를 number로 사용
  onClose: () => void;
}

export interface InfoMessageModalProps {
  title: string;
  message: string;
}

// ModalState 인터페이스를 제네릭으로 정의하여 props의 타입을 동적으로 지정
export interface ModalState<T extends ModalType | null = null> {
  type: T;
  props?: T extends 'ADD_PLACE'
    ? AddPlaceModalProps
    : T extends 'ADD_ROUTE'
      ? AddRouteModalProps
      : T extends 'RESTAURANT_DETAIL'
        ? RestaurantDetailModalProps
        : T extends 'INFO_MESSAGE'
          ? InfoMessageModalProps
          : Record<string, never>; // type이 null일 경우 빈 객체
}

const initialState: ModalState<null> = {
  type: null,
  props: {},
};

export const modalAtom = atom<ModalState<ModalType | null>>(initialState);

// Kakao Map API 로드 상태를 위한 atom
export const isKakaoMapApiLoadedAtom = atom<boolean>(false);
