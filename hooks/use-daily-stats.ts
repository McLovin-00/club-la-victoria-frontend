import { useQuery } from "@tanstack/react-query";
import { getDailyStats } from "@/lib/api/statistics";

export function useDailyStats(date: string) {
  return useQuery({
    queryKey: ['dailyStats', date],
    queryFn: () => getDailyStats(date),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
  });
}
