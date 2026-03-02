'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { SeoulMap } from '~/src/components/common/SeoulMap';
import LandingPicture from '~/public/assets/landing-picture.png';
import { PLACES, ROUTE } from '~/src/components/landing/Constants';
import {
  Icon,
  Marker,
  FadeInContent,
  RoutePath,
} from '~/src/components/landing/Animations';

export const HeroSection = ({ showHero }: { showHero: boolean }) => {
  const heroFade = useSpring({
    opacity: showHero ? 1 : 0,
    config: { duration: 1000 },
  });

  return (
    <div
      className="relative w-full h-screen bg-gray-100 flex items-center justify-center overflow-hidden"
      style={{ willChange: 'contents' }}
    >
      <div
        className="absolute inset-0"
        style={{ userSelect: 'none', pointerEvents: 'auto' }}
      >
        <SeoulMap />
      </div>
      <animated.div
        style={{
          ...heroFade,
          pointerEvents: showHero ? 'auto' : 'none',
        }}
        className="text-center text-white p-4 rounded-lg z-10 relative"
      >
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold drop-shadow-lg">
          FindRoot
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl font-medium drop-shadow-md">
          흩어진 장소들을 연결해, 나만의 루트로.
        </p>
      </animated.div>
    </div>
  );
};

export const PlacesSection = ({ currentPage }: { currentPage: number }) => {
  const [selectedPlace, setSelectedPlace] = useState(PLACES[1]);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {});

    resizeObserver.observe(imageContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const calculatePosition = (coords: { x: string; y: string }) => {
    const x = parseFloat(coords.x);
    const y = parseFloat(coords.y);
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div
      className="w-full min-h-screen bg-gray-100 flex items-center justify-center py-8 sm:py-12 md:py-0"
      style={{ willChange: 'contents' }}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          <div className="text-center md:text-left">
            <FadeInContent sectionIndex={1} currentPage={currentPage}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600 mb-4">
                나만의 장소,
                <br />
                지도 위에 모아보기.
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                맛집, 카페, 산책로. 나만 알고 싶은 장소들을 지도에 저장하고,
                다른 사람들의 추천도 확인해보세요.
              </p>
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold break-words">
                      {selectedPlace.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-600 text-sm sm:text-base">
                    <div className="flex items-center whitespace-nowrap">
                      <Icon
                        path="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-red-500"
                      />
                      <span>{selectedPlace.likes}</span>
                    </div>
                    <div className="flex items-center whitespace-nowrap">
                      <Icon path="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" />
                      <span>{selectedPlace.comments}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm sm:text-base my-4">
                  {selectedPlace.description}
                </p>
              </div>
            </FadeInContent>
          </div>

          <div
            ref={imageContainerRef}
            className="relative w-full h-64 sm:h-80 md:h-96 rounded-lg shadow-xl overflow-hidden"
          >
            <Image
              src={LandingPicture}
              alt="홍대 지도"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
              quality={85}
            />
            {PLACES.map((place) => (
              <div
                key={place.name}
                onClick={() => setSelectedPlace(place)}
                className="absolute cursor-pointer"
                style={calculatePosition(place.coords)}
              >
                <Marker
                  markerImage={place.markerImage}
                  alt={place.name}
                  id={place.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RoutesSection = ({ currentPage }: { currentPage: number }) => {
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {});

    resizeObserver.observe(imageContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const calculatePosition = (coords: { x: string; y: string }) => {
    const x = parseFloat(coords.x);
    const y = parseFloat(coords.y);
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div
      className="w-full min-h-screen bg-gray-100 flex items-center justify-center py-8 sm:py-12 md:py-0"
      style={{ willChange: 'contents' }}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          <div className="text-center md:text-left md:order-last">
            <FadeInContent sectionIndex={2} currentPage={currentPage}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600 mb-4">
                장소들을 엮어,
                <br />
                테마가 있는 루트로.
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                저장한 장소들을 엮어 성수동 카페 투어, 가족 나들이 코스 등
                나만의 루트를 만들어보세요. 다른 사람들을 팔로우를 하여 추천된
                장소와 루트도 즐겨보세요.
              </p>
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold break-words">
                      {ROUTE.name}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">
                    {ROUTE.description}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    주요 경유지
                  </p>
                  <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 gap-1">
                    {ROUTE.places.map((p, i) => (
                      <span key={p.name} className="flex items-center">
                        <span className="break-words">{p.name}</span>
                        {i < ROUTE.places.length - 1 && (
                          <span className="mx-1 sm:mx-2 font-sans">→</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeInContent>
          </div>

          <div
            ref={imageContainerRef}
            className="relative w-full h-64 sm:h-80 md:h-96 rounded-lg shadow-xl overflow-hidden md:order-first"
          >
            <Image
              src={LandingPicture}
              alt="홍대 지도"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
              quality={85}
            />
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <RoutePath />
            </svg>
            {ROUTE.markers.map((marker, i) => (
              <div
                key={i}
                className="absolute"
                style={calculatePosition(marker.coords)}
              >
                <Marker
                  markerImage={marker.markerImage}
                  alt={`Route marker ${i + 1}`}
                  id={i}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
