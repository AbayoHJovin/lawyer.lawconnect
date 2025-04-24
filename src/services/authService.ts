import API from "../lib/axios";
import { jwtDecode } from "jwt-decode";

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
  const response = await API.post<LoginResponse>(
    "/citizens/login-by-email",
    {
      email,
      password,
    },
    { withCredentials: true }
  );
  return response.data;
};

export const loginByPhone = async (
  phone: string,
  password: string
): Promise<LoginResponse> => {
  const response = await API.post<LoginResponse>(
    "/citizens/login-by-phone",
    {
      phone,
      password,
    },
    { withCredentials: true }
  );
  return response.data;
};

export const refreshAccessToken = async (): Promise<TokenResponse> => {
  const response = await API.post<TokenResponse>(
    "/auth/refresh-token",
    {},
    { withCredentials: true }
  );
  return response.data;
};

export const validateToken = async (): Promise<boolean> => {
  try {
    const token = getAccessToken();
    if (!token) return false;

    const response = await API.get("/auth/validate-token", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status === 200;
  } catch (error) {
    return false;
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
 