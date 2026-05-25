import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://findroot.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'FindRoot',
    template: '%s | FindRoot',
  },
  description: '서울의 맛집과 코스 루트를 공유하는 서비스입니다.',
  keywords: ['서울 맛집', '서울 코스', '데이트 코스', '맛집 루트', 'FindRoot'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: baseUrl,
    siteName: 'FindRoot',
    title: 'FindRoot',
    description: '서울의 맛집과 코스 루트를 공유하는 서비스입니다.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindRoot',
    description: '서울의 맛집과 코스 루트를 공유하는 서비스입니다.',
  },
  robots: {
    index: true,
    follow: true,
  },
};
