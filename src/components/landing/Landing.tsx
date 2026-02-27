'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TOTAL_PAGES } from '~/src/components/landing/Constants';
import {
  HeroSection,
  PlacesSection,
  RoutesSection,
} from '~/src/components/landing/Sections';

export default function Landing() {
  const [showHero, setShowHero] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const isScrollingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHero(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (isScrollingRef.current) return;

      const scrollDown = event.deltaY > 0;
      let nextPage = currentPage;

      if (scrollDown && currentPage < TOTAL_PAGES - 1) {
        nextPage = currentPage + 1;
      } else if (!scrollDown && currentPage > 0) {
        nextPage = currentPage - 1;
      } else {
        return;
      }

      event.preventDefault();
      isScrollingRef.current = true;

      const targetScroll = nextPage * window.innerHeight;
      const startScroll = window.scrollY;
      const distance = targetScroll - startScroll;
      const duration = 300;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeProgress =
          progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

        window.scrollTo(0, startScroll + distance * easeProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          window.scrollTo(0, targetScroll);
          setCurrentPage(nextPage);
          isScrollingRef.current = false;
        }
      };

      animate();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentPage]);

  return (
    <div ref={containerRef} className="w-full bg-gray-100">
      <HeroSection showHero={showHero} />
      <PlacesSection currentPage={currentPage} />
      <RoutesSection currentPage={currentPage} />
    </div>
  );
}
