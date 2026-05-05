import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from "@/types/auth.types";
import type { User } from "@/types/user.types";

export async function getMe(): Promise<User> {
  const response = await apiRequest<ApiSuccessResponse<User>>(
    API_ENDPOINTS.profile.me,
  );

  return response.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiRequest<ApiSuccessResponse<User>>(
    API_ENDPOINTS.profile.me,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiRequest<ApiSuccessResponse<null>>(API_ENDPOINTS.profile.password, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function resetUserData(): Promise<void> {
  await apiRequest<ApiSuccessResponse<null>>(API_ENDPOINTS.profile.resetData, {
    method: "POST",
  });
}
