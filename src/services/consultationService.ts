
import API from '../lib/axios';

export interface Consultation {
  id: number;
  citizenId: number;
  lawyerId: number;
  lawyerName?: string;
  title: string;
  description: string;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const getConsultations = async (): Promise<Consultation[]> => {
  const response = await API.get('/consultations/lawy-cit');
  return response.data;
};

export const getConsultationById = async (id: number): Promise<Consultation> => {
  const response = await API.get(`/consultations/${id}`);
  return response.data;
};
