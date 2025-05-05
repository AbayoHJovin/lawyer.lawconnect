import API from "../lib/axios";
import { AxiosError } from "axios";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  citizen: {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
}

export interface TokenResponse {
  message: string;
  data: string;
}

export interface AuthError {
  message: string;
  code: string;
}

export const loginByEmail = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await API.post<LoginResponse>(
      "/citizens/login-by-email",
      {
        email,
        password,
      },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message || "Login failed";
      const errorCode = error.response?.data?.code || "AUTH_ERROR";
      throw {
        message: errorMessage,
        code: errorCode,
      } as AuthError;
    }
    throw {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    } as AuthError;
  }
};

export const validateToken = async (): Promise<{
  isValid: boolean;
  error?: string;
}> => {
  try {
    // This function is now a stub, as token validation is handled by the backend
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: "An unexpected error occurred during token validation",
    };
  }
};

export const isTokenExpired = (_token: string): boolean => {
  // No longer needed, always return false
  return false;
};

export const logout = async (): Promise<void> => {
  try {
    await API.post<unknown>(
      "/citizens/logout",
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    // Optionally handle error
    throw error;
  }
};
