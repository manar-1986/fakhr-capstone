import { AuthResponse, ForgotPasswordRequest, LoginRequest, RegisterRequest } from "../types/auth.types";
import instance from "./axios";

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await instance.post<{ success: boolean; data: AuthResponse }>("/auth/login", data);
  // axios interceptor returns response.data directly, so response is already the full response object
  return (response as unknown as { success: boolean; data: AuthResponse }).data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await instance.post<{ success: boolean; data: AuthResponse }>("/auth/register", data);
  // axios interceptor returns response.data directly, so response is already the full response object
  return (response as unknown as { success: boolean; data: AuthResponse }).data;
};

/**
 * Request password reset email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (data: ForgotPasswordRequest) => {
  const response = await instance.post<{ success: boolean; data: { message: string } }>("/auth/forgot-password", data);
  // axios interceptor returns response.data directly
  return (response as unknown as { success: boolean; data: { message: string } }).data;
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (data: { token: string; password: string }) => {
  const response = await instance.post<{ success: boolean; data: { message: string } }>("/auth/reset-password", data);
  // axios interceptor returns response.data directly
  return (response as unknown as { success: boolean; data: { message: string } }).data;
};

/**
 * Logout user (invalidate token)
 * POST /api/auth/logout
 */
export const logout = async () => {
  await instance.post("/auth/logout");
};
