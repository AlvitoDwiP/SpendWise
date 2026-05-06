import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiSuccessResponse } from "@/types/api.types";
import type { DashboardSummary } from "@/types/dashboard.types";
import type { Transaction } from "@/types/transaction.types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<ApiSuccessResponse<DashboardSummary>>(
    API_ENDPOINTS.dashboard.summary,
  );

  return response.data;
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  const response = await apiClient.get<ApiSuccessResponse<Transaction[]>>(
    API_ENDPOINTS.transactions.recent,
  );

  return response.data;
}
