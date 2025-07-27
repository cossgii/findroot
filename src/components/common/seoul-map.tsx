'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import SeoulDistrictsSVG from '../../../public/images/Seoul_districts.svg';
import { SEOUL_DISTRICTS } from '~/src/utils/districts'; // districts 데이터 임포트
import { DISTRICT_COLORS } from '~/src/utils/colors'; // colors 데이터 임포트

export function SeoulMap() {
  const router = useRouter();
  const svgObjectRef = useRef<SVGSVGElement>(null);

  // SEOUL_DISTRICTS에서 ID를 키로, 한글 이름을 값으로 하는 맵 생성
  const DISTRICT_NAME_MAP: { [key: string]: string } = SEOUL_DISTRICTS.reduce((acc, district) => {
    if (district.id !== 'all') { // 'all' 항목은 지도에 표시되지 않으므로 제외
      acc[district.id] = district.name;
    }
    return acc;
  }, {} as { [key: string]: string });

  useEffect(() => {
    const svgElement = svgObjectRef.current;
    console.log('svgElement:', svgElement);
    if (!svgElement) {
      console.log('svgElement is null or undefined.');
      return;
    }
    console.log('svgElement children:', svgElement.children);

    const districts = svgElement.querySelectorAll('path[id]');
    console.log('districts found:', districts.length, districts);

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

      if (target.parentNode) {
        target.parentNode.appendChild(target);
      }

      target.style.transform = 'scale(1.1)';

      const bbox = target.getBBox();
      const x = bbox.x + bbox.width / 2;
      const y = bbox.y + bbox.height / 2;

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x.toString());
      text.setAttribute('y', y.toString());

      const koreanName = DISTRICT_NAME_MAP[target.id] || target.id;
      text.textContent = koreanName;

      text.setAttribute('id', 'district-label');
      text.style.fontSize = '24px';
      text.style.fontWeight = 'bold';
      text.style.fill = '#1F2937';
      text.style.textAnchor = 'middle';
      text.style.dominantBaseline = 'middle';
      text.style.pointerEvents = 'none';
      text.style.textShadow = '0px 0px 4px white';

      svgElement.appendChild(text);
    };

    const handleMouseOut = (event: Event) => {
      const target = event.target as SVGPathElement;
      target.style.transform = 'scale(1)';

      const existingLabel = svgElement.getElementById('district-label');
      if (existingLabel && existingLabel.parentNode) {
        existingLabel.parentNode.removeChild(existingLabel);
      }
    };

    const handleClick = (event: Event) => {
      const target = event.target as SVGPathElement;
      router.push(`/districts/${target.id}`);
    };

    districts.forEach((district) => {
      const pathElement = district as SVGPathElement;
      pathElement.style.cursor = 'pointer';
      pathElement.addEventListener('mouseover', handleMouseOver);
      pathElement.addEventListener('mouseout', handleMouseOut);
      pathElement.addEventListener('click', handleClick);
    });

    return () => {
      districts.forEach((district) => {
        const pathElement = district as SVGPathElement;
        pathElement.removeEventListener('mouseover', handleMouseOver);
        pathElement.removeEventListener('mouseout', handleMouseOut);
        pathElement.removeEventListener('click', handleClick);
      });
    };
  }, [router]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <SeoulDistrictsSVG
        ref={svgObjectRef}
        aria-label="Seoul Districts Interactive Map"
        className="w-full h-full"
      />
    </div>
  );
}
