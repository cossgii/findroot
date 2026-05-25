import { notFound } from 'next/navigation';
import { getRouteById } from '~/src/services/route/routeService';
import RouteDetailClient from '~/src/components/routes/RouteDetailClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import type { Metadata } from 'next';

interface RouteDetailPageProps {
  params: Promise<{ routeId: string }>;
}

export async function generateMetadata({ params: awaitedParams }: RouteDetailPageProps): Promise<Metadata> {
  const params = await awaitedParams;
  const route = await getRouteById(params.routeId);
  if (!route) return { title: '루트를 찾을 수 없습니다' };

  return {
    title: route.name,
    description: route.description,
    openGraph: {
      title: route.name,
      description: route.description,
      images: [`/api/routes/${params.routeId}/image`],
    },
  };
}

export default async function RouteDetailPage({
  params: awaitedParams,
}: RouteDetailPageProps) {
  const params = await awaitedParams;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const route = await getRouteById(params.routeId, userId);

  if (!route) {
    notFound();
  }

  return <RouteDetailClient route={route} />;
}
