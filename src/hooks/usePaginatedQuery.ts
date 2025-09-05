'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// A generic interface for any kind of paginated API response
export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalCount?: number; // Optional total count
}

// The props for our custom hook
interface UsePaginatedQueryProps<T> {
  queryKey: (string | number | object)[]; // Base key for the query
  apiEndpoint: string; // The API endpoint to fetch data from
  queryParams?: Record<string, string | number | boolean | null | undefined>; // Additional query parameters
  initialPage?: number;
  limit?: number;
  enabled?: boolean; // To conditionally enable the query
}

// The actual fetcher function
const fetchPaginatedData = async <T>(
  apiEndpoint: string,
  queryParams: Record<string, string | number | boolean | null | undefined>,
): Promise<PaginatedResponse<T>> => {
  const params = new URLSearchParams();
  // Append all query parameters to the URL
  for (const key in queryParams) {
    if (queryParams[key] !== undefined && queryParams[key] !== null) {
      params.append(key, queryParams[key].toString());
    }
  }

  const response = await fetch(`${apiEndpoint}?${params.toString()}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch data from ${apiEndpoint}: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }
  const result = await response.json();

  // Standardize the response shape
  return {
    data: result.places || result.routes || [], // Adapt to different data keys
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    totalCount: result.totalCount,
  };
};

export function usePaginatedQuery<T>({
  queryKey,
  apiEndpoint,
  queryParams = {},
  initialPage = 1,
  limit = 5,
  enabled = true,
}: UsePaginatedQueryProps<T>) {
  const [page, setPage] = useState(initialPage);

  const fullQueryKey = [...queryKey, { ...queryParams, page, limit }];

  const queryResult = useQuery<PaginatedResponse<T>, Error>({
    queryKey: fullQueryKey,
    queryFn: () => fetchPaginatedData<T>(apiEndpoint, { ...queryParams, page, limit }),
    enabled,
    placeholderData: (previousData) => previousData, // Keep showing old data while fetching new
  });

  return {
    ...queryResult,
    page,
    setPage,
  };
}
