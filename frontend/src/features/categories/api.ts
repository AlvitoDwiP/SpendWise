import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiSuccessResponse } from "@/types/api.types";
import type { Category, CategoryPayload } from "@/types/category.types";

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<ApiSuccessResponse<Category[]>>(
    API_ENDPOINTS.categories.list,
  );

  return response.data;
}

export async function getCategoryById(id: number): Promise<Category> {
  const response = await apiClient.get<ApiSuccessResponse<Category>>(
    API_ENDPOINTS.categories.byId(id),
  );

  return response.data;
}

export async function createCategory(
  payload: CategoryPayload,
): Promise<Category> {
  const response = await apiClient.post<ApiSuccessResponse<Category>, CategoryPayload>(
    API_ENDPOINTS.categories.list,
    payload,
  );

  return response.data;
}

export async function updateCategory(
  id: number,
  payload: CategoryPayload,
): Promise<Category> {
  const response = await apiClient.put<ApiSuccessResponse<Category>, CategoryPayload>(
    API_ENDPOINTS.categories.byId(id),
    payload,
  );

  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<null>>(API_ENDPOINTS.categories.byId(id));
}
