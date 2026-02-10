'use client';

import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import { SeoulMap } from '~/src/components/common/SeoulMap';

export default function Page() {
  return (
    <div className="h-full w-full bg-gray-100">
      <Parallax
        pages={3}
        style={{ top: '0', left: '0', width: '100%', height: '100%' }}
      >
        <ParallaxLayer offset={0} speed={1}>
          <div className="h-full w-full">
            <SeoulMap />
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={1} speed={0.2} />

        <ParallaxLayer offset={1} speed={0.8}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-2 items-center gap-16 max-w-6xl mx-auto px-8">
              <div className="relative h-96 flex items-center justify-center">
                <div className="absolute top-10 left-10 w-64 h-44 bg-white rounded-lg shadow-lg transform -rotate-6 transition-transform duration-500 hover:rotate-0" />
                <div className="absolute top-24 left-24 w-64 h-44 bg-white rounded-lg shadow-2xl transform rotate-6 transition-transform duration-500 hover:rotate-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-primary-500 rounded-full shadow-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  나만의 장소를 발견하고 공유하세요
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  서울의 숨겨진 보석 같은 카페, 맛집을 찾아보세요. 다른 사람들과
                  공유하고, 나만의 지도에 저장할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={2} speed={0.2} />

        <ParallaxLayer offset={2} speed={0.8}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-2 items-center gap-16 max-w-6xl mx-auto px-8">
              <div className="text-left">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  테마가 있는 경로로 서울을 즐겨보세요
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  데이트, 산책, 쇼핑 등 다양한 테마로 구성된 경로를 따라가
                  보세요. 다른 사용자가 만든 최고의 경로를 발견하거나, 직접
                  경로를 만들어 공유할 수도 있습니다.
                </p>
              </div>
              <div className="relative h-96 flex items-center justify-center">
                <svg
                  width="250"
                  height="150"
                  viewBox="0 0 250 150"
                  className="opacity-80"
                >
                  <path
                    d="M 20 75 Q 70 30, 125 75 T 230 75"
                    stroke="#fb923c"
                    fill="none"
                    strokeWidth="6"
                    strokeDasharray="10 10"
                    strokeLinecap="round"
                  />
                  <circle cx="20" cy="75" r="10" fill="#c2410c" />
                  <circle cx="125" cy="75" r="10" fill="#c2410c" />
                  <circle cx="230" cy="75" r="10" fill="#c2410c" />
                </svg>
              </div>
            </div>
          </div>
        </ParallaxLayer>
      </Parallax>
    </div>
  );
}
