import { apiRequest } from "@/lib/api/client";
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
  const response = await apiRequest<ApiSuccessResponse<User>>(
    API_ENDPOINTS.auth.register,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiRequest<ApiSuccessResponse<LoginResponse>>(
    API_ENDPOINTS.auth.login,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function googleLogin(
  payload: GoogleLoginPayload,
): Promise<LoginResponse> {
  const response = await apiRequest<ApiSuccessResponse<LoginResponse>>(
    API_ENDPOINTS.auth.google,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}
