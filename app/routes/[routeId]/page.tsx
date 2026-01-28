import { notFound } from 'next/navigation';
import { getRouteById } from '~/src/services/route/routeService';
import RouteDetailClient from '~/src/components/routes/RouteDetailClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';

interface RouteDetailPageProps {
  params: Promise<{ routeId: string }>;
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
