import { atom } from 'jotai';

// 맛집 상세 모달의 ID를 저장하는 아톰 (null이면 모달 닫힘)
export const activeRestaurantModalIdAtom = atom<number | null, [number | null], void>(
  null,
  (get, set, newValue) => {
    set(activeRestaurantModalIdAtom, newValue);
  }
);