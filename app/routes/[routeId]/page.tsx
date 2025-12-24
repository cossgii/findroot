import { getRouteById } from '~/src/services/route/routeService';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import RouteDetailClient from '~/src/components/routes/RouteDetailClient';

interface RouteDetailPageProps {
  params: {
    routeId: string;
  };
}

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const route = await getRouteById(params.routeId, userId);

  if (!route) {
    notFound();
  }

  return <RouteDetailClient route={route} />;
}
