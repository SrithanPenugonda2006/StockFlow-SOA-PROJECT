export type UserRole = "ADMIN" | "MANAGER" | "CUSTOMER";

export interface User {
  username: string;
  email?: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  mustChangePassword?: boolean;
  message?: string;
}

export interface SendOtpResponse {
  message: string;
  email: string;
  otp?: string;
}

export interface VerifyOtpResponse {
  message: string;
  verified: boolean;
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyResetTokenResponse {
  valid: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}

export interface JwtPayload {
  sub: string; // username
  role: UserRole;
  iat?: number;
  exp?: number;
}
