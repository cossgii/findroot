// src/utils/districts.ts

export interface DistrictInfo {
  id: string; // 영문 ID (URL 파라미터용)
  name: string; // 한글 이름 (표시용)
  lat: number;
  lng: number;
}

export const SEOUL_DISTRICTS: DistrictInfo[] = [
  { id: 'all', name: '전체', lat: 37.5665, lng: 126.978 }, // 서울시청 기준
  { id: 'Gangnam-gu', name: '강남구', lat: 37.5172, lng: 127.0473 },
  { id: 'Gangdong-gu', name: '강동구', lat: 37.5301, lng: 127.1238 },
  { id: 'Gangbuk-gu', name: '강북구', lat: 37.6396, lng: 127.0257 },
  { id: 'Gangseo-gu', name: '강서구', lat: 37.5509, lng: 126.8495 },
  { id: 'Gwanak-gu', name: '관악구', lat: 37.4784, lng: 126.9515 },
  { id: 'Gwangjin-gu', name: '광진구', lat: 37.5385, lng: 127.0823 },
  { id: 'Guro-gu', name: '구로구', lat: 37.4954, lng: 126.8874 },
  { id: 'Geumcheon-gu', name: '금천구', lat: 37.4519, lng: 126.902 },
  { id: 'Nowon-gu', name: '노원구', lat: 37.6542, lng: 127.0568 },
  { id: 'Dobong-gu', name: '도봉구', lat: 37.6688, lng: 127.0471 },
  { id: 'Dongdaemun-gu', name: '동대문구', lat: 37.5744, lng: 127.0397 },
  { id: 'Dongjak-gu', name: '동작구', lat: 37.5124, lng: 126.9393 },
  { id: 'Mapo-gu', name: '마포구', lat: 37.5662, lng: 126.9016 },
  { id: 'Seodaemun-gu', name: '서대문구', lat: 37.5791, lng: 126.9368 },
  { id: 'Seocho-gu', name: '서초구', lat: 37.4837, lng: 127.0324 },
  { id: 'Seongdong-gu', name: '성동구', lat: 37.5635, lng: 127.0364 },
  { id: 'Seongbuk-gu', name: '성북구', lat: 37.5894, lng: 127.0167 },
  { id: 'Songpa-gu', name: '송파구', lat: 37.5145, lng: 127.1066 },
  { id: 'Yangcheon-gu', name: '양천구', lat: 37.5169, lng: 126.8664 },
  { id: 'Yeongdeungpo-gu_1_', name: '영등포구', lat: 37.5264, lng: 126.8963 },
  { id: 'Yongsan-gu', name: '용산구', lat: 37.5325, lng: 126.99 },
  { id: 'Eunpyeong-gu', name: '은평구', lat: 37.6027, lng: 126.9291 },
  { id: 'Jongno-gu', name: '종로구', lat: 37.573, lng: 126.9794 },
  { id: 'Jung-gu', name: '중구', lat: 37.5639, lng: 126.9975 },
  { id: 'Jungnang-gu', name: '중랑구', lat: 37.6065, lng: 127.0926 },
];
