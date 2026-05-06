import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
  GoogleLoginPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from "@/types/auth.types";
import type { User } from "@/types/user.types";

export async function register(payload: RegisterPayload): Promise<User> {
  const response = await apiClient.post<ApiSuccessResponse<User>, RegisterPayload>(
    API_ENDPOINTS.auth.register,
    payload,
  );

  return response.data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>, LoginPayload>(
    API_ENDPOINTS.auth.login,
    payload,
  );

  return response.data;
}

export async function googleLogin(
  payload: GoogleLoginPayload,
): Promise<LoginResponse> {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>, GoogleLoginPayload>(
    API_ENDPOINTS.auth.google,
    payload,
  );

  return response.data;
}
