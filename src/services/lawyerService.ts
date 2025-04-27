import API from "../lib/axios";

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

export const getLawyerByPhone = async (phone: string): Promise<LawyerDto[]> => {
  const res = await API.get(
    `/lawyers/find-by-phone?phone=${encodeURIComponent(phone)}`
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
