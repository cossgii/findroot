import { getRouteById } from '~/src/services/route/routeService';
import MainContainer from '~/src/components/layout/MainContainer';
import RouteDetailClient from '~/src/components/routes/RouteDetailClient';

interface RoutePageProps {
  params: { routeId: string };
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { routeId } = params;
  const route = await getRouteById(routeId);

  if (!route) {
    return <MainContainer>Route not found</MainContainer>;
  }

  return (
    <MainContainer className="flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <RouteDetailClient route={route} />
      </div>
    </MainContainer>
  );
}