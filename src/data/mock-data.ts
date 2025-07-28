import { Restaurant, Category } from '~/src/types/restaurant';

export const mockRestaurants: Restaurant[] = [
  { id: 1, name: '멋진 카페', category: 'cafe', imageUrl: '/images/profile-large.png', address: '서울시 강남구', district: 'Gangnam-gu' },
  { id: 2, name: '맛있는 1차', category: 'meal', imageUrl: '/images/profile-large.png', address: '서울시 강남구', district: 'Gangnam-gu' },
  { id: 3, name: '즐거운 2차', category: 'drink', imageUrl: '/images/profile-large.png', address: '서울시 종로구', district: 'Jongno-gu' },
  { id: 4, name: '또 다른 카페', category: 'cafe', imageUrl: '/images/profile-large.png', address: '서울시 종로구', district: 'Jongno-gu' },
  { id: 5, name: '든든한 1차', category: 'meal', imageUrl: '/images/profile-large.png', address: '서울시 강남구', district: 'Gangnam-gu' },
  { id: 6, name: '종로의 숨은 카페', category: 'cafe', imageUrl: '/images/profile-large.png', address: '서울시 종로구', district: 'Jongno-gu' },
];

export const CATEGORIES: Category[] = [
  { id: 'cafe', name: '카페' },
  { id: 'meal', name: '1차' },
  { id: 'drink', name: '2차' },
];
