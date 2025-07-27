// app/districts/page.tsx

import MainContainer from '~/src/components/layout/main-container';
import { SeoulMap } from '~/src/components/common/seoul-map';

export default function AllDistrictsPage() {
  return (
    <MainContainer>
      <h1 className="text-2xl font-bold text-center my-4">서울 전체 자치구</h1>
      <p className="text-center text-gray-600 mb-8">지도를 클릭하여 특정 자치구 정보를 확인하세요.</p>
      <SeoulMap />
    </MainContainer>
  );
}