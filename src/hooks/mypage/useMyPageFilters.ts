'use client';

import { useState, useMemo } from 'react';
import { Place, Route } from '@prisma/client';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { LikedPlace, MyLikedRoute } from './useMyPageData';

interface FilterProps {
  myCreatedPlaces: Place[];
  myCreatedRoutes: Route[];
  likedPlaces: LikedPlace[];
  likedRoutes: MyLikedRoute[];
}

export function useMyPageFilters({
  myCreatedPlaces,
  myCreatedRoutes,
  likedPlaces,
  likedRoutes,
}: FilterProps) {
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const filteredCreatedPlaces = useMemo(() => {
    if (selectedDistrict === 'all') return myCreatedPlaces;
    const districtName = SEOUL_DISTRICTS.find(
      (d) => d.id === selectedDistrict,
    )?.name;
    return myCreatedPlaces.filter((place) => place.district === districtName);
  }, [myCreatedPlaces, selectedDistrict]);

  const filteredCreatedRoutes = useMemo(() => {
    if (selectedDistrict === 'all') return myCreatedRoutes;
    return myCreatedRoutes.filter(
      (route) => route.districtId === selectedDistrict,
    );
  }, [myCreatedRoutes, selectedDistrict]);

  const filteredLikedPlaces = useMemo(() => {
    if (selectedDistrict === 'all') return likedPlaces;
    const districtName = SEOUL_DISTRICTS.find(
      (d) => d.id === selectedDistrict,
    )?.name;
    return likedPlaces.filter((like) => like.place?.district === districtName);
  }, [likedPlaces, selectedDistrict]);

  const filteredLikedRoutes = useMemo(() => {
    if (selectedDistrict === 'all') return likedRoutes;
    return likedRoutes.filter(
      (like) => like.route?.districtId === selectedDistrict,
    );
  }, [likedRoutes, selectedDistrict]);

  return {
    selectedDistrict,
    setSelectedDistrict,
    filteredCreatedPlaces,
    filteredCreatedRoutes,
    filteredLikedPlaces,
    filteredLikedRoutes,
  };
}
