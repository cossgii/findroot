'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSpring, useTrail, animated } from '@react-spring/web';
import { ROUTE } from '~/src/components/landing/Constants';

export const Icon = ({
  path,
  className = 'w-5 h-5',
}: {
  path: string;
  className?: string;
}) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" d={path} clipRule="evenodd"></path>
  </svg>
);

export const Marker = ({
  markerImage,
  alt,
  id,
}: {
  markerImage: string;
  alt: string;
  id: string | number;
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [styles, api] = useSpring(() => ({ from: { y: -40, scale: 0 } }));

  useEffect(() => {
    api.start({
      to: { y: inView ? 0 : -40, scale: inView ? 1 : 0 },
      from: { y: -40, scale: 0 },
      config: { tension: 250, friction: 15 },
    });
  }, [inView, api]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 },
    );
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <animated.div
      key={id}
      ref={ref}
      style={{
        transform: styles.y.to((y) => `translate(0%, -45%) translateY(${y}px)`),
        scale: styles.scale,
      }}
      className="w-8 h-8"
    >
      <Image src={markerImage} alt={alt} width={32} height={32} quality={80} />
    </animated.div>
  );
};

export const FadeInContent = ({
  children,
  sectionIndex,
  currentPage,
}: {
  children: React.ReactNode;
  sectionIndex: number;
  currentPage: number;
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const items = React.Children.toArray(children);
  const trail = useTrail(items.length, {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    from: { opacity: 0, transform: 'translateY(30px)' },
    config: { mass: 1, tension: 280, friction: 40 },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inView) {
          setInView(true);
        }
      },
      { threshold: 0.2 },
    );
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [inView]);

  useEffect(() => {
    if (sectionIndex === currentPage) {
      setInView(true);
    }
  }, [currentPage, sectionIndex]);

  return (
    <div ref={ref} style={{ willChange: 'opacity, transform' }}>
      {trail.map((props, index) => (
        <animated.div key={index} style={props}>
          {items[index]}
        </animated.div>
      ))}
    </div>
  );
};

export const RoutePath = () => {
  const [inView, setInView] = useState(false);
  const [length, setLength] = useState(0);
  const ref = useRef<SVGPathElement>(null);

  const { strokeDashoffset } = useSpring({
    from: { strokeDashoffset: length },
    to: { strokeDashoffset: inView ? 0 : length },
    config: { duration: 1500, delay: 500 },
    reset: true,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 },
    );
    const currentRef = ref.current;
    if (currentRef) {
      setLength(currentRef.getTotalLength());
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const d = useMemo(
    () =>
      ROUTE.markers
        .map((m, i) =>
          i === 0
            ? `M ${m.coords.x.replace('%', '')} ${m.coords.y.replace('%', '')}`
            : `L ${m.coords.x.replace('%', '')} ${m.coords.y.replace('%', '')}`,
        )
        .join(' '),
    [],
  );

  return (
    <animated.path
      ref={ref}
      d={d}
      stroke="#FFA500"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={length}
      strokeDashoffset={strokeDashoffset}
    />
  );
};
