import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from "@/types/auth.types";
import type { User } from "@/types/user.types";

export async function getMe(): Promise<User> {
  const response = await apiClient.get<ApiSuccessResponse<User>>(
    API_ENDPOINTS.profile.me,
  );

  return response.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiClient.put<ApiSuccessResponse<User>, UpdateProfilePayload>(
    API_ENDPOINTS.profile.me,
    payload,
  );

  return response.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.put<ApiSuccessResponse<null>, ChangePasswordPayload>(
    API_ENDPOINTS.profile.password,
    payload,
  );
}

export async function resetUserData(): Promise<void> {
  await apiClient.post<ApiSuccessResponse<null>>(API_ENDPOINTS.profile.resetData);
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<null>>(API_ENDPOINTS.profile.deleteAccount);
}

export async function uploadProfilePhoto(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await apiClient.put<ApiSuccessResponse<User>, FormData>(
    API_ENDPOINTS.profile.photo,
    formData,
  );

  return response.data;
}
