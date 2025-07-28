import { Dongle, Noto_Sans_KR, Roboto } from 'next/font/google';

export const dongle = Dongle({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-dongle',
});

export const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-noto-sans-kr',
});

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto',
});
