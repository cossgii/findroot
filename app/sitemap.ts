import { MetadataRoute } from 'next';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://findroot.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const districtUrls = SEOUL_DISTRICTS.map((district) => ({
    url: `${baseUrl}/districts/${district.id}`,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/districts`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...districtUrls,
  ];
}
