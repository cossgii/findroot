export const PLACES = [
  {
    name: '홍대 맛집',
    category: '맛집',
    likes: 128,
    comments: 42,
    markerImage: '/assets/marker-meal.png',
    coords: { x: '50%', y: '40%' },
    description: '젊음과 문화가 넘치는, 홍대 대표 맛집입니다.',
  },
  {
    name: '합정 카페',
    category: '카페',
    likes: 256,
    comments: 88,
    markerImage: '/assets/marker-drink.png',
    coords: { x: '25%', y: '65%' },
    description:
      '개성 넘치는 인테리어와 다양한 커피와 디저트가 준비되어 있는 합정 대표 카페입니다.',
  },
  {
    name: '경의선숲길 술집',
    category: '술집',
    likes: 94,
    comments: 15,
    markerImage: '/assets/marker-drink.png',
    coords: { x: '90%', y: '35%' },
    description:
      '아름다운 노을과 함께, 트렌딩한 위스키와 칵테일을 즐길 수 있습니다.',
  },
];

export const ROUTE = {
  name: '합정 데이트 코스',
  description: '합정역에서 접근성이 매우 좋으면서 카페, 라멘집, 이자카야까지',
  places: [
    { name: '합정 카페', coords: { x: '25%', y: '65%' } },
    { name: '합정 라멘집', coords: { x: '20%', y: '70%' } },
    { name: '합정 이자카야', coords: { x: '15%', y: '55%' } },
  ],
  markers: [
    {
      category: 'DRINK',
      coords: { x: '25%', y: '65%' },
      markerImage: '/assets/marker-drink.png',
    },
    {
      category: 'MEAL',
      coords: { x: '20%', y: '70%' },
      markerImage: '/assets/marker-meal.png',
    },
    {
      category: 'MEAL',
      coords: { x: '15%', y: '55%' },
      markerImage: '/assets/marker-meal.png',
    },
  ],
};

export const TOTAL_PAGES = 3;
