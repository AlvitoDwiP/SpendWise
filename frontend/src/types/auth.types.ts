import type { User } from "@/types/user.types";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type GoogleLoginPayload = {
  id_token: string;
};

export type UpdateProfilePayload = {
  name: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};
