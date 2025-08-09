import { atom } from 'jotai';

// App-wide modal management atom

export type ModalType = 'ADD_PLACE' | 'ADD_ROUTE' | 'RESTAURANT_DETAIL';

export interface ModalState {
  type: ModalType | null;
  props?: any; // Props to be passed to the specific modal component
}

const initialState: ModalState = {
  type: null,
  props: {},
};

/**
 * App-wide modal state atom.
 * To open a modal, set this atom with the modal type and its props.
 * e.g., setModal({ type: 'ADD_PLACE', props: { onPlaceAdded: () => ... } })
 * To close any active modal, set it back to the initial state.
 * e.g., setModal({ type: null, props: {} })
 */
export const modalAtom = atom<ModalState>(initialState);
