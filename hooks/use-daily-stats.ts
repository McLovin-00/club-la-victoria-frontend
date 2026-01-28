import { useQuery } from "@tanstack/react-query";
import { getDailyStats } from "@/lib/api/statistics";

export function useDailyStats(date: string, searchTerm?: string) {
  return useQuery({
    queryKey: ['dailyStats', date, searchTerm],
    queryFn: () => getDailyStats(date, searchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
  });
}
