import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ClientUserSummary } from '~/src/types/shared';

export const useUserSearch = (searchTerm: string) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  return useQuery<ClientUserSummary[], Error>({
    queryKey: ['users', 'search', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) {
        return [];
      }
      const response = await fetch(`/api/users/search?q=${debouncedSearchTerm}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    enabled: !!debouncedSearchTerm, // 검색어가 있을 때만 쿼리 실행
  });
};
