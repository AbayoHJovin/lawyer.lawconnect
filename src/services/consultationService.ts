import API from "@/lib/axios";

export interface ConsultationDto {
  id: string;
  subject: string;
  description: string;
  createdAt: number;
  status: ConsultationStatus;
  citizenId: string;
  lawyerID: string;
}

export enum ConsultationStatus {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const getConsultationsForCitizen = async () => {
  const response = await API.get<ApiResponse<ConsultationDto[]>>(
    "/consultations/lawy-cit/get-by-citizen"
  );
  return response.data;
};

export const getConsultationStats = (consultations: ConsultationDto[]) => {
  return {
    pending: consultations.filter(
      (c) => c.status === ConsultationStatus.PENDING
    ).length,
    accepted: consultations.filter(
      (c) => c.status === ConsultationStatus.ACCEPTED
    ).length,
    ongoing: consultations.filter(
      (c) => c.status === ConsultationStatus.ONGOING
    ).length,
    completed: consultations.filter(
      (c) => c.status === ConsultationStatus.COMPLETED
    ).length,
    total: consultations.length,
  };
};

export interface CreateConsultationRequest {
  lawyerId: string;
  subject: string;
  description?: string;
}

export interface Consultation {
  id: string;
  subject: string;
  description?: string;
  status: string;
  lawyer: {
    id: string;
    fullName: string;
  };
  citizen: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

export const createConsultation = async (
  data: CreateConsultationRequest
): Promise<Consultation> => {
  const response = await API.post("/api/v1/consultations/lawy-cit/add", data);
  return response.data.data;
};
