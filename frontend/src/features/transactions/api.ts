import {
  apiRequest,
  buildUrl,
  getErrorMessage,
  getToken,
  removeToken,
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
  const response = await apiRequest<ApiSuccessResponse<Transaction>>(
    API_ENDPOINTS.transactions.byId(id),
  );

  return response.data;
}

export async function createTransaction(
  payload: TransactionPayload,
): Promise<Transaction> {
  const response = await apiRequest<ApiSuccessResponse<Transaction>>(
    API_ENDPOINTS.transactions.list,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function updateTransaction(
  id: number,
  payload: TransactionPayload,
): Promise<Transaction> {
  const response = await apiRequest<ApiSuccessResponse<Transaction>>(
    API_ENDPOINTS.transactions.byId(id),
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deleteTransaction(id: number): Promise<void> {
  await apiRequest<ApiSuccessResponse<null>>(API_ENDPOINTS.transactions.byId(id), {
    method: "DELETE",
  });
}

export async function scanReceipt(file: File): Promise<ReceiptScanSuggestion> {
  const formData = new FormData();
  formData.append("receipt", file);

  const headers = new Headers();
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(API_ENDPOINTS.transactions.scanReceipt), {
    method: "POST",
    body: formData,
    headers,
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    if (response.status === 401) {
      removeToken();
      throw new Error(message || "Sesi Anda berakhir. Silakan login ulang.");
    }
    if (response.status === 500) {
      throw new Error("Failed to process receipt scan. Please try again shortly.");
    }
    if (response.status === 400) {
      throw new Error(message || "File receipt tidak valid.");
    }
    throw new Error(message);
  }

  const payload =
    (await response.json()) as
      | ApiSuccessResponse<ReceiptScanSuggestion>
      | ReceiptScanSuggestion;

  if ("success" in payload) {
    return payload.data;
  }

  return payload;
}
