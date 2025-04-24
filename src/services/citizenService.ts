import API from "../lib/axios";
import axios from "axios";
import { API_BASE_URL } from "../config";

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

export interface CitizenProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  languagePreference: string;
  location: string;
}

export const getCitizenById = async (id: number): Promise<Citizen> => {
  const response = await API.get(`/citizens/get-by-id/${id}`);
  return response.data;
};

export const updateCitizen = async (
  data: Partial<CitizenProfile>
): Promise<CitizenProfile> => {
  const response = await API.patch("/citizens/cit/update-citizen", data);
  return response.data.data;
};

export const getAllCitizens = async (): Promise<Citizen[]> => {
  const response = await API.get("/citizens/all");
  return response.data;
};

export const getCitizenProfile = async (): Promise<CitizenProfile> => {
  const response = await axios.get(`${API_BASE_URL}/cit/profile`);
  return response.data.data;
};

export const updateCitizenProfile = async (
  data: Partial<CitizenProfile>
): Promise<CitizenProfile> => {
  const response = await axios.patch(
    `${API_BASE_URL}/cit/update-citizen`,
    data
  );
  return response.data.data;
};
