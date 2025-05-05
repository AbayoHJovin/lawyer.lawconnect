import API from "../lib/axios";
import { AxiosError } from "axios";

export interface SpecializationDto {
  specializationId: string;
  specializationName: string;
}

export interface LawyerDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  languagePreference: string;
  licenseNumber: string;
  yearsOfExperience: number;
  location: string;
  availableForWork: boolean;
  specializations: SpecializationDto[];
  averageRating: number;
  lawyerBio: string | null;
}

export interface RatingDto {
  ratingId: string;
  citizenName: string;
  ratingScore: number;
  reviewText: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface ApiListResponse<T> {
  message: string;
  data: T[];
}

export const getAllLawyers = async (): Promise<ApiListResponse<LawyerDto>> => {
  const response = await API.get<ApiListResponse<LawyerDto>>("/lawyers/all");
  return response.data;
};

export const getLawyerById = async (
  id: string
): Promise<ApiResponse<LawyerDto>> => {
  const response = await API.get<ApiResponse<LawyerDto>>(
    `/lawyers/get-by-id/${id}`
  );
  return response.data;
};

export const getLawyerByEmail = async (email: string): Promise<LawyerDto[]> => {
  const res = await API.get(
    `/lawyers/find-by-email?email=${encodeURIComponent(email)}`
  );
  return res.data;
};

export const getLawyersByRatingAbove = async (
  value: number
): Promise<LawyerDto[]> => {
  const res = await API.get(`/lawyers/find-rating-above/${value}`);
  return res.data;
};

export const getLawyersByRatingBelow = async (
  value: number
): Promise<LawyerDto[]> => {
  const res = await API.get(`/lawyers/find-rating-below/${value}`);
  return res.data;
};

export const getLawyersByRatingEquals = async (
  value: number
): Promise<LawyerDto[]> => {
  const res = await API.get(`/lawyers/find-rating-equals-to/${value}`);
  return res.data;
};

export const bookConsultation = async (consultation: {
  citizenId: number;
  lawyerId: number;
  title: string;
  description: string;
}) => {
  const res = await API.post("/consultations/lawy-cit/add", consultation);
  return res.data;
};

export const getLawyerRatings = async (
  lawyerId: string
): Promise<ApiListResponse<RatingDto>> => {
  const response = await API.get<ApiListResponse<RatingDto>>(
    `/lawyers/get-all-rating/${lawyerId}`
  );
  return response.data;
};

export const getLawyerPhoneNumber = async (
  lawyerId: string
): Promise<string> => {
  const response = await API.get<ApiResponse<string>>(
    `/lawyers/find-lawyer-phone-by-lawyerId/${lawyerId}`
  );
  return response.data.data;
};

export interface LawyerLoginResponse {
  accessToken: string;
  refreshToken: string;
  lawyer: LawyerDto;
}

export interface LawyerAuthError {
  message: string;
  code: string;
}

export const lawyerLoginByEmail = async (
  email: string,
  password: string
): Promise<LawyerLoginResponse> => {
  try {
    const response = await API.post<LawyerLoginResponse>(
      "/lawyers/login-by-email",
      { email, password },
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
      } as LawyerAuthError;
    }
    throw {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    } as LawyerAuthError;
  }
};

export interface UpdateLawyerRequest {
  fullName?: string;
  phoneNumber?: string;
  languagePreference?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  location?: string;
  specialization?: { specializationName: string }[];
  lawyerBio?: string;
}

export const updateLawyer = async (
  data: UpdateLawyerRequest
): Promise<LawyerDto> => {
  const response = await API.patch<ApiResponse<LawyerDto>>(
    "/lawyers/lawy/update",
    data
  );
  if (!response.data.data) {
    throw new Error("Failed to update lawyer profile");
  }
  return response.data.data;
};

export const getAllSpecializations = async (): Promise<SpecializationDto[]> => {
  const response = await API.get<ApiListResponse<SpecializationDto>>(
    "/specializations/all"
  );
  return response.data.data;
};
