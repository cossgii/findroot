import { notFound } from 'next/navigation';
import { getRouteById } from '~/src/services/route/routeService';
import RouteDetailClient from '~/src/components/routes/RouteDetailClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';

interface RouteDetailPageProps {
  params: { routeId: string };
}

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // 미들웨어에 의해 로그인된 사용자만 접근하므로 userId는 항상 존재합니다.
  // 하지만 타입 안전성을 위해 userId를 전달합니다.
  const route = await getRouteById(params.routeId, userId);

  if (!route) {
    notFound();
  }

  return <RouteDetailClient route={route} />;
}