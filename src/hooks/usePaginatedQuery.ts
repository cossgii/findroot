'use client';

import { useState, useEffect } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalCount?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UsePaginatedQueryProps<T> {
  queryKey: (string | number | object)[];
  apiEndpoint: string;
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  initialPage?: number;
  limit?: number;
  enabled?: boolean;
  suspense?: boolean;
}
const fetchPaginatedData = async <T>(
  apiEndpoint: string,
  queryParams: Record<string, string | number | boolean | null | undefined>,
): Promise<PaginatedResponse<T>> => {
  const params = new URLSearchParams();
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

  return {
    data: result.places || result.routes || [],
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
  suspense = false,
}: UsePaginatedQueryProps<T>) {
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(queryParams), JSON.stringify(queryKey)]);

  const fullQueryKey = [...queryKey, { ...queryParams, page, limit }];

  const queryOptions = {
    queryKey: fullQueryKey,
    queryFn: () =>
      fetchPaginatedData<T>(apiEndpoint, { ...queryParams, page, limit }),
    enabled,
  };

  const queryResult = suspense
    ? useSuspenseQuery(queryOptions)
    : useQuery({
        ...queryOptions,
        placeholderData: (previousData) => previousData,
      });

  return {
    ...queryResult,
    page,
    setPage,
  };
}
