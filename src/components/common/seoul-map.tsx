'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import SeoulDistrictsSVG from '../../../public/assets/Seoul_districts.svg';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { DISTRICT_COLORS } from '~/src/utils/colors';

export function SeoulMap() {
  const router = useRouter();
  const svgObjectRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const DISTRICT_NAME_MAP: { [key: string]: string } = SEOUL_DISTRICTS.reduce(
    (acc, district) => {
      if (district.id !== 'all') {
        acc[district.id] = district.name;
      }
      return acc;
    },
    {} as { [key: string]: string },
  );

  useEffect(() => {
    const svgElement = svgObjectRef.current;
    if (!svgElement) {
      return;
    }

    const districts = svgElement.querySelectorAll('path[id]');

    districts.forEach((district, index) => {
      const path = district as SVGPathElement;
      path.style.fill = DISTRICT_COLORS[index % DISTRICT_COLORS.length];
      path.style.stroke = '#FFFFFF';
      path.style.strokeWidth = '2px';
      path.style.transition = 'transform 0.2s ease-in-out';

      const bbox = path.getBBox();
      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y + bbox.height / 2;
      path.style.transformOrigin = `${centerX}px ${centerY}px`;
    });

    const handleMouseOver = (event: Event) => {
      const target = event.target as SVGPathElement;
      if (target.tagName === 'path' && target.id) {
        if (target.parentNode) {
          target.parentNode.appendChild(target);
        }
        target.style.transform = 'scale(1.1)';
        const bbox = target.getBBox();
        const x = bbox.x + bbox.width / 2;
        const y = bbox.y + bbox.height / 2;
        const text = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text',
        );
        text.setAttribute('x', x.toString());
        text.setAttribute('y', y.toString());
        const koreanName = DISTRICT_NAME_MAP[target.id] || target.id;
        text.textContent = koreanName;
        text.setAttribute('id', 'district-label');
        text.style.fontSize = '36px';
        text.style.fontWeight = 'bold';
        text.style.fill = '#1F2937';
        text.style.textAnchor = 'middle';
        text.style.dominantBaseline = 'middle';
        text.style.pointerEvents = 'none';
        text.style.textShadow = '0px 0px 4px white';
        text.style.fontFamily = 'var(--font-dongle), sans-serif';
        svgElement.appendChild(text);
      }
    };

    const handleMouseOut = (event: Event) => {
      const target = event.target as SVGPathElement;
      if (target.tagName === 'path' && target.id) {
        target.style.transform = 'scale(1)';
        const existingLabel = svgElement.getElementById('district-label');
        if (existingLabel && existingLabel.parentNode) {
          existingLabel.parentNode.removeChild(existingLabel);
        }
      }
    };

    const handleDistrictClick = (event: Event) => {
      const target = event.target as SVGPathElement;
      if (target.tagName === 'path' && target.id) {
        router.push(`/districts/${target.id}`);
      }
    };

    const handleSvgClick = (event: MouseEvent) => {
      const target = event.target as SVGElement;
      if (target.tagName !== 'path' || !target.id) {
        router.push('/districts');
      }
    };

    districts.forEach((district) => {
      const pathElement = district as SVGPathElement;
      pathElement.style.cursor = 'pointer';
      pathElement.addEventListener('mouseover', handleMouseOver);
      pathElement.addEventListener('mouseout', handleMouseOut);
      pathElement.addEventListener('click', handleDistrictClick);
    });

    svgElement.addEventListener('click', handleSvgClick);

    return () => {
      districts.forEach((district) => {
        const pathElement = district as SVGPathElement;
        pathElement.removeEventListener('mouseover', handleMouseOver);
        pathElement.removeEventListener('mouseout', handleMouseOut);
        pathElement.removeEventListener('click', handleDistrictClick);
      });
      svgElement.removeEventListener('click', handleSvgClick);
    };
  }, [router]);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-center h-full p-4"
    >
      <SeoulDistrictsSVG
        ref={svgObjectRef}
        aria-label="Seoul Districts Interactive Map"
        className="max-w-full max-h-full"
      />
    </div>
  );
}
