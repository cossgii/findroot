import { Dongle, Noto_Sans_KR } from 'next/font/google';

export const dongle = Dongle({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-dongle',
});

export const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-kr',
});
