
import API from '../lib/axios';

export interface Citizen {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCitizenPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profilePicture?: string;
}

export const getCitizenById = async (id: number): Promise<Citizen> => {
  const response = await API.get(`/citizens/get-by-id/${id}`);
  return response.data;
};

export const updateCitizen = async (id: number, payload: UpdateCitizenPayload): Promise<Citizen> => {
  const response = await API.put(`/citizens/cit-adm/updateCitizen/${id}`, payload);
  return response.data;
};

export const getAllCitizens = async (): Promise<Citizen[]> => {
  const response = await API.get('/citizens/all');
  return response.data;
};
