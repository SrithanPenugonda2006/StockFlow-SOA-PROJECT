import { apiClient } from "./axios";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SendOtpResponse,
  VerifyOtpResponse,
  ForgotPasswordResponse,
  VerifyResetTokenResponse,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from "../types/auth";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login", credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<string> => {
    const response = await apiClient.post<string>("/api/auth/register", userData);
    return response.data;
  },

  sendOtp: async (email: string): Promise<SendOtpResponse> => {
    const response = await apiClient.post<SendOtpResponse>("/api/auth/send-otp", { email });
    return response.data;
  },

  verifyOtp: async (email: string, otp: string): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<VerifyOtpResponse>("/api/auth/verify-otp", { email, otp });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>("/api/auth/forgot-password", { email });
    return response.data;
  },

  verifyResetToken: async (token: string): Promise<VerifyResetTokenResponse> => {
    const response = await apiClient.get<VerifyResetTokenResponse>(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
    return response.data;
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>("/api/auth/reset-password", payload);
    return response.data;
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>("/api/auth/change-password", payload);
    return response.data;
  },
};
