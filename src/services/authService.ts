import API from "../lib/axios";
import { jwtDecode } from "jwt-decode";
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

const TOKEN_KEY = "accessToken";

export const setAccessToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAccessToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

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

export const loginByPhone = async (
  phone: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await API.post<LoginResponse>(
      "/citizens/login-by-phone",
      {
        phone,
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

export const refreshAccessToken = async (): Promise<TokenResponse> => {
  const response = await API.post<TokenResponse>(
    "/auth/refresh-token",
    {},
    { withCredentials: true }
  );
  return response.data;
};

export const validateToken = async (): Promise<{
  isValid: boolean;
  error?: string;
}> => {
  try {
    const token = getAccessToken();
    if (!token) return { isValid: false, error: "No token found" };

    const response = await API.get("/auth/validate-token", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { isValid: response.status === 200 };
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        isValid: false,
        error: error.response?.data?.message || "Token validation failed",
      };
    }
    return {
      isValid: false,
      error: "An unexpected error occurred during token validation",
    };
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Call the backend logout endpoint
    await API.post<ApiResponse<void>>(
      "/citizens/logout",
      {},
      {
        withCredentials: true, // Important for cookie handling
      }
    );

    // Clean up local storage
    removeAccessToken();

    // Clear any other auth-related storage if exists
    localStorage.clear();

    // Clear cookies by setting them to expire
    document.cookie =
      "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear local storage and cookies even if API call fails
    removeAccessToken();
    localStorage.clear();
    document.cookie =
      "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    throw error;
  }
};
