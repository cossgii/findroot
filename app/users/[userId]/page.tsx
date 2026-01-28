import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getUserById } from '~/src/services/user/userService';
import { getPlacesByCreatorId } from '~/src/services/place/placeService';
import { getRoutesByCreatorId } from '~/src/services/route/routeService';
import UserProfileClient from './UserProfileClient';
import { getFollowStatus } from '~/src/services/user/followService';

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({
  params: awaitedParams,
}: UserProfilePageProps) {
  const params = await awaitedParams;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  const profileUserId = params.userId;

  const user = await getUserById(profileUserId);

  if (!user) {
    notFound();
  }

  let initialIsFollowing = false;
  if (currentUserId && currentUserId !== profileUserId) {
    initialIsFollowing = await getFollowStatus(currentUserId, profileUserId);
  }

  const initialPlacesResult = await getPlacesByCreatorId(
    profileUserId,
    1, // page
    5, // limit
    undefined, // district
    currentUserId,
  );

  const initialRoutesResult = await getRoutesByCreatorId(
    profileUserId,
    1, // page
    5, // limit
    undefined, // district
  );

  return (
    <UserProfileClient
      profileUser={user}
      currentUserId={currentUserId}
      initialPlaces={initialPlacesResult.places}
      initialRoutes={initialRoutesResult.routes}
      initialIsFollowing={initialIsFollowing}
    />
  );
}
