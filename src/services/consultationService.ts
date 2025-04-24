import API from "@/lib/axios";

export interface CreateConsultationRequest {
  lawyerId: string;
  subject: string;
  description: string;
}

export type ConsultationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "ONGOING";

export interface ConsultationDto {
  id: string; // UUID
  subject: string;
  description: string;
  createdAt: number; // Long timestamp
  status: ConsultationStatus;
  citizenId: string; // UUID
  lawyerID: string; // UUID - uppercase ID to match backend
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const createConsultation = async (
  request: CreateConsultationRequest
): Promise<ApiResponse<ConsultationDto>> => {
  const response = await API.post<ApiResponse<ConsultationDto>>(
    "/consultations/lawy-cit/add",
    request
  );
  return response.data;
};

export const getConsultationsForCitizen = async () => {
  const response = await API.get<ApiResponse<ConsultationDto[]>>(
    "/consultations/lawy-cit/get-by-citizen"
  );
  return response.data;
};

export const getConsultationById = async (consultationId: string) => {
  const response = await API.get<ApiResponse<ConsultationDto>>(
    `/consultations/lawy-cit/get-by-id/${consultationId}`
  );
  return response.data;
};

export const getConsultationStats = (consultations: ConsultationDto[]) => {
  return {
    pending: consultations.filter((c) => c.status === "PENDING").length,
    accepted: consultations.filter((c) => c.status === "ACCEPTED").length,
    rejected: consultations.filter((c) => c.status === "REJECTED").length,
    completed: consultations.filter((c) => c.status === "COMPLETED").length,
    total: consultations.length,
  };
};

export const deleteConsultation = async (
  consultationId: string
): Promise<ApiResponse<void>> => {
  const response = await API.delete<ApiResponse<void>>(
    `/consultations/lawy-cit/delete/${consultationId}`
  );
  return response.data;
};
