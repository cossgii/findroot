import React from 'react';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { RouteStopLabel } from '@prisma/client';
import { RouteWithPlaces } from '~/src/types/shared';

export const runtime = 'edge';

const routeStopColorMap: Record<RouteStopLabel, string> = {
  MEAL: '#F97316', // primary-500
  CAFE: '#3B82F6', // blue-500
  BAR: '#8B5CF6', // violet-500
};

const routeStopLabelTextMap: Record<RouteStopLabel, string> = {
  MEAL: '식사',
  CAFE: '카페',
  BAR: '주점',
};

export async function GET(
  req: NextRequest,
  { params: awaitedParams }: { params: Promise<{ routeId: string }> },
) {
  try {
    const params = await awaitedParams;
    const { routeId } = params;
    const routeApiUrl = `${new URL(req.url).origin}/api/routes/${routeId}`;
    const response = await fetch(routeApiUrl, { cache: 'no-store' });

    if (!response.ok) {
      return new Response(
        `Failed to fetch route data: ${response.statusText}`,
        {
          status: response.status,
        },
      );
    }

    const route = (await response.json()) as RouteWithPlaces | null;

    if (!route) {
      return new ImageResponse(
        <div
          style={{
            fontSize: 60,
            color: 'black',
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          루트를 찾을 수 없습니다.
        </div>,
        { width: 1200, height: 630 },
      );
    }

    const districtName =
      SEOUL_DISTRICTS.find((d) => d.id === route.districtId)?.name || '서울';

    const sortedPlaces = [...route.places].sort((a, b) => a.order - b.order);

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          padding: '40px',
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 'bold',
            color: 'black',
            marginBottom: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span style={{ fontSize: '48px' }}>📍</span>
          <span>{districtName}</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '24px',
            maxWidth: '90%',
          }}
        >
          {sortedPlaces.map((rp, index) => (
            <div
              key={`waypoint-${index}`}
              style={{ display: 'flex', alignItems: 'center', gap: '24px' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: routeStopColorMap[rp.label] || '#2678FF',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                    border: '5px solid white',
                  }}
                >
                  {routeStopLabelTextMap[rp.label] || '?'}
                </div>
              </div>
              {index < sortedPlaces.length - 1 && (
                <div
                  style={{
                    fontSize: '56px',
                    color: 'rgba(0, 0, 0, 0.7)',
                    fontWeight: 'bold',
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600',
        },
      },
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new ImageResponse(
      <div
        style={{
          fontSize: 60,
          color: 'white',
          background: 'red',
          width: '100%',
          height: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        이미지 생성 오류
      </div>,
      { width: 1200, height: 630 },
    );
  }
}
