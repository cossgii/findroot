export interface Category {
  id: string;
  name: string;
}

export const CATEGORIES: Category[] = [
  { id: 'MEAL', name: '식사' }, // Aligned with PlaceCategory enum
  { id: 'DRINK', name: '음료' }, // Aligned with PlaceCategory enum
];
