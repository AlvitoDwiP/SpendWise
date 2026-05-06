import {
  ApiClientError,
  apiRequest,
  apiClient,
  withQuery,
} from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiSuccessResponse, PaginatedResponse } from "@/types/api.types";
import type {
  ReceiptScanSuggestion,
  Transaction,
  TransactionListParams,
  TransactionPayload,
} from "@/types/transaction.types";

export async function getTransactions(
  params: TransactionListParams = {},
): Promise<PaginatedResponse<Transaction>> {
  return apiRequest<PaginatedResponse<Transaction>>(
    withQuery(API_ENDPOINTS.transactions.list, params),
  );
}

export async function getTransactionById(id: number): Promise<Transaction> {
  const response = await apiClient.get<ApiSuccessResponse<Transaction>>(
    API_ENDPOINTS.transactions.byId(id),
  );

  return response.data;
}

export async function createTransaction(
  payload: TransactionPayload,
): Promise<Transaction> {
  const response = await apiClient.post<ApiSuccessResponse<Transaction>, TransactionPayload>(
    API_ENDPOINTS.transactions.list,
    payload,
  );

  return response.data;
}

export async function updateTransaction(
  id: number,
  payload: TransactionPayload,
): Promise<Transaction> {
  const response = await apiClient.put<ApiSuccessResponse<Transaction>, TransactionPayload>(
    API_ENDPOINTS.transactions.byId(id),
    payload,
  );

  return response.data;
}

export async function deleteTransaction(id: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<null>>(API_ENDPOINTS.transactions.byId(id));
}

export async function scanReceipt(file: File): Promise<ReceiptScanSuggestion> {
  const formData = new FormData();
  formData.append("receipt", file);

  try {
    const payload = await apiClient.post<
      ApiSuccessResponse<ReceiptScanSuggestion> | ReceiptScanSuggestion,
      FormData
    >(API_ENDPOINTS.transactions.scanReceipt, formData);

    if ("success" in payload) {
      return payload.data;
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.status === 500) {
        throw new Error("Failed to process receipt scan. Please try again shortly.");
      }
      if (error.status === 400) {
        throw new Error(error.message || "File receipt tidak valid.");
      }
      if (error.status === 401) {
        throw new Error(error.message || "Sesi Anda berakhir. Silakan login ulang.");
      }
    }

    throw error;
  }
}
