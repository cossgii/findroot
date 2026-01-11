import { atom } from 'jotai';

export type ModalType =
  | 'ADD_PLACE'
  | 'ADD_ROUTE'
  | 'RESTAURANT_DETAIL'
  | 'INFO_MESSAGE'
  | 'EDIT_PLACE'
  | 'EDIT_ROUTE'
  | 'CONFIRMATION'
  | 'LOGIN_PROMPT'
  | 'ROUTE_PREVIEW';

export interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export type LoginPromptModalProps = ConfirmationModalProps;

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
  restaurantId: string;
}

export interface RoutePreviewModalProps {
  routeId: string;
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
    | ConfirmationModalProps
    | LoginPromptModalProps
    | RoutePreviewModalProps
    | Record<string, never>;
}

const initialState: ModalState = {
  type: null,
  props: {},
};

export const modalAtom = atom<ModalState>(initialState);

export const openModalAtom = atom(
  null,
  (get, set, props: ConfirmationModalProps) => {
    set(modalAtom, { type: 'CONFIRMATION', props: props });
  },
);

export const closeModalAtom = atom(null, (get, set) => {
  set(modalAtom, initialState);
});

export const isKakaoMapApiLoadedAtom = atom<boolean>(false);

export type ContentCreator =
  | { type: 'recommended' }
  | { type: 'user'; userId: string; userName: string };

export const contentCreatorAtom = atom<ContentCreator>({ type: 'recommended' });
