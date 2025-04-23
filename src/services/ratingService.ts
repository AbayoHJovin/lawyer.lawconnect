
import API from '../lib/axios';

export interface Rating {
  id?: number;
  citizenId: number;
  lawyerId: number;
  rating: number;
  review?: string;
  createdAt?: string;
}

export interface AddRatingPayload {
  lawyerId: number;
  rating: number;
  review?: string;
}

export const addRating = async (payload: AddRatingPayload): Promise<Rating> => {
  const response = await API.post('/rating/addRating', payload);
  return response.data;
};

export const getRatingsByLawyer = async (lawyerId: number): Promise<Rating[]> => {
  const response = await API.get(`/rating/lawyer/${lawyerId}`);
  return response.data;
};
