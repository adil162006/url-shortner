import api from "../lib/axios";
import type {
  AuthResponse,
  LoginPayload,
  MeResponse,
  RegisterPayload,
} from "../types/auth.types";

export const registerApi = async (
  payload: RegisterPayload
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
};

export const loginApi = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
};

export const logoutApi = async (): Promise<void> => {
  await api.post("/auth/logout");
};

// Requires the /auth/me endpoint added below (see backend note).
// Used only to hydrate auth state on app load / hard refresh, since the
// access & refresh tokens live in httpOnly cookies we can't read from JS.
export const meApi = async (): Promise<MeResponse> => {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
};