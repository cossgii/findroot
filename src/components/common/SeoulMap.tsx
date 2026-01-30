'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

import SeoulDistrictsSVG from '../../../public/assets/Seoul_districts.svg';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { DISTRICT_COLORS } from '~/src/utils/colors';

// Constants for label styling
const LABEL_FONT_SIZE = '18px';
const LABEL_FONT_WEIGHT = 'bold';
const LABEL_FILL_COLOR = '#1F2937';
const LABEL_FONT_FAMILY = 'var(--font-dongle), sans-serif';

export function SeoulMap() {
  const router = useRouter();
  const svgObjectRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(
    null,
  );
  const [labelPixelPosition, setLabelPixelPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const DISTRICT_NAME_MAP: { [key: string]: string } = SEOUL_DISTRICTS.reduce(
    (acc, district) => {
      if (district.id !== 'all') {
        acc[district.id] = district.name;
      }
      return acc;
    },
    {} as { [key: string]: string },
  );

  const getPixelPosition = useCallback((svgX: number, svgY: number) => {
    const svgElement = svgObjectRef.current;
    const containerElement = containerRef.current;
    if (!svgElement || !containerElement) {
      return null;
    }

    const svgRect = svgElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();

    const viewBox = svgElement.viewBox.baseVal;
    const svgWidth = viewBox.width;
    const svgHeight = viewBox.height;

    const scaleX = svgRect.width / svgWidth;
    const scaleY = svgRect.height / svgHeight;

    const pixelX = (svgX - viewBox.x) * scaleX;
    const pixelY = (svgY - viewBox.y) * scaleY;

    const finalLeft = svgRect.left - containerRect.left + pixelX;
    const finalTop = svgRect.top - containerRect.top + pixelY;

    return { top: finalTop, left: finalLeft };
  }, []);

  const handleMouseOver = (event: MouseEvent) => {
    const target = event.target as SVGPathElement;
    if (target.tagName === 'path' && target.id) {
      setHoveredDistrictId(target.id);
      const bbox = target.getBBox();
      const newLabelSvgPosition = {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2,
      };

      const pixelPos = getPixelPosition(
        newLabelSvgPosition.x,
        newLabelSvgPosition.y,
      );
      setLabelPixelPosition(pixelPos);
    }
  };

  const handleMouseOut = (event: MouseEvent) => {
    const target = event.target as SVGPathElement;
    if (target.tagName === 'path' && target.id) {
      setHoveredDistrictId(null);
      setLabelPixelPosition(null);
    }
  };

  const handleDistrictClick = (event: MouseEvent) => {
    const target = event.target as SVGPathElement;
    if (target.tagName === 'path' && target.id) {
      router.push(`/districts/${target.id}`);
    }
  };

  const handleSvgClick = (event: MouseEvent) => {
    const target = event.target as SVGElement;
    if (target.tagName !== 'path' || !target.id) {
      router.push('/districts');
    } else {
      handleDistrictClick(event);
    }
  };

  useEffect(() => {
    const svgElement = svgObjectRef.current;
    if (!svgElement) {
      return;
    }

    const districts = svgElement.querySelectorAll('path[id]');

    districts.forEach((district, index) => {
      const path = district as SVGPathElement;
      path.style.fill = DISTRICT_COLORS[index % DISTRICT_COLORS.length];
      // Apply base class for stroke, stroke-width, transition, cursor
      path.classList.add('svg-district-path');

      const bbox = path.getBBox();
      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y + bbox.height / 2;
      path.style.transformOrigin = `${centerX}px ${centerY}px`;

      // Apply/remove hover class for transform
      if (path.id === hoveredDistrictId) {
        path.classList.add('svg-district-path-hover');
      } else {
        path.classList.remove('svg-district-path-hover');
      }
    });

    return () => {
      // Cleanup: remove classes if component unmounts or hoveredDistrictId changes
      districts.forEach((district) => {
        const path = district as SVGPathElement;
        path.classList.remove('svg-district-path');
        path.classList.remove('svg-district-path-hover');
      });
    };
  }, [router, hoveredDistrictId]);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-center h-full p-4 relative"
    >
      <SeoulDistrictsSVG
        ref={svgObjectRef}
        aria-label="Seoul Districts Interactive Map"
        className="max-w-full max-h-full"
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={handleSvgClick}
      />
      {hoveredDistrictId && labelPixelPosition && (
        <div
          style={{
            position: 'absolute',
            top: labelPixelPosition.top,
            left: labelPixelPosition.left,
            fontSize: LABEL_FONT_SIZE,
            fontWeight: LABEL_FONT_WEIGHT,
            color: LABEL_FILL_COLOR,
            textAlign: 'center',
            pointerEvents: 'none',
            fontFamily: LABEL_FONT_FAMILY,
            transform: 'translate(-50%, -50%)',
          }}
          className="svg-text-shadow"
        >
          {DISTRICT_NAME_MAP[hoveredDistrictId] || hoveredDistrictId}
        </div>
      )}
    </div>
  );
}
