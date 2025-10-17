// hooks/usePaginatedSearchQuery.ts
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface UsePaginatedSearchQueryOptions<T> {
  queryKey: string;
  url: string;
  initialLimit?: number;
}

export function usePaginatedSearchQuery<T>({
  queryKey,
  url,
  initialLimit = 10,
}: UsePaginatedSearchQueryOptions<T>) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [searchTerm, setSearchTerm] = useState("");

  const setSearch = (value: string) => {
    setSearchTerm(value);
    if (page > 1) {
      setPage(1);
    }
  };

  const handlePageChange = useCallback((newPage: number) => {
    setPage((prevPage) => Math.max(1, newPage));
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing items per page
  }, []);

  const query = useQuery<PaginatedResponse<T>>({
    queryKey: [queryKey, page, limit, searchTerm],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<T>>(url, {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
        },
      });
      return data;
    },
    staleTime: STALE_TIME,
    placeholderData: (previousData) => previousData,
  });

  const totalPages = Math.ceil((query.data?.total || 0) / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    ...query,
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page,
    setPage: handlePageChange,
    nextPage: () => hasNextPage && handlePageChange(page + 1),
    prevPage: () => hasPreviousPage && handlePageChange(page - 1),
    searchTerm,
    setSearch,
    limit,
    handleLimitChange,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}
