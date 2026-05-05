import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiSuccessResponse } from "@/types/api.types";
import type { Category, CategoryPayload } from "@/types/category.types";

export async function getCategories(): Promise<Category[]> {
  const response = await apiRequest<ApiSuccessResponse<Category[]>>(
    API_ENDPOINTS.categories.list,
  );

  return response.data;
}

export async function getCategoryById(id: number): Promise<Category> {
  const response = await apiRequest<ApiSuccessResponse<Category>>(
    API_ENDPOINTS.categories.byId(id),
  );

  return response.data;
}

export async function createCategory(
  payload: CategoryPayload,
): Promise<Category> {
  const response = await apiRequest<ApiSuccessResponse<Category>>(
    API_ENDPOINTS.categories.list,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function updateCategory(
  id: number,
  payload: CategoryPayload,
): Promise<Category> {
  const response = await apiRequest<ApiSuccessResponse<Category>>(
    API_ENDPOINTS.categories.byId(id),
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiRequest<ApiSuccessResponse<null>>(API_ENDPOINTS.categories.byId(id), {
    method: "DELETE",
  });
}
