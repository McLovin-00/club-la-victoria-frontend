import apiClient from "./client";
import { StatisticsResponseDto } from "@/lib/types";

export async function getDailyStats(
  date: string,
  searchTerm?: string,
): Promise<StatisticsResponseDto> {
  const response = await apiClient.get<StatisticsResponseDto>("/statistics", {
    params: { date, searchTerm },
  });
  return response.data;
}
